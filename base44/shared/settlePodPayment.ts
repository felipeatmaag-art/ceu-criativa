import { stripeRequest } from './stripe.ts';
import { secrets } from 'base44:runtime';
// Stock is changed ONLY on BaseProductVariant. No Design quantity exists.
export default async function settlePodPayment(base44, intent) {
  const appId = secrets.get('BASE44_APP_ID');
  if (intent.metadata?.base44_app_id !== appId || !intent.metadata?.order_id) throw new Error('Pagamento inválido.');
  const db = base44.asServiceRole.entities;
  const order = await db.Order.get(intent.metadata.order_id);
  if (order.payment_intent_id !== intent.id || intent.currency !== 'brl' || intent.amount !== Math.round(order.total * 100)) throw new Error('Pedido não corresponde ao pagamento.');
  const lock = crypto.randomUUID(), now = Date.now();
  if (Number(order.settlement_expires || 0) > now) throw new Error('Confirmação já em andamento. Aguarde a próxima tentativa.');
  await db.Order.updateMany({ id: order.id, settlement_expires: order.settlement_expires ?? { $exists: false } }, { $set: { settlement_lock: lock, settlement_expires: now + 120000 } });
  if ((await db.Order.get(order.id)).settlement_lock !== lock) throw new Error('Confirmação concorrente. Tente novamente.');
  try {
  const quantities = new Map();
  for (const item of order.items) {
    if (!item.variant_id || !item.base_product_id) throw new Error('Pedido sem vínculo físico.');
    quantities.set(item.variant_id, (quantities.get(item.variant_id) || 0) + item.quantity);
  }
  const stock = [...quantities.entries()].sort(([a], [b]) => a.localeCompare(b));
  const release = async () => {
    for (const [id, quantity] of stock) {
      // Atomic compensation, safe to replay; never increment twice.
      await db.BaseProductVariant.updateMany({ id, debited_order_ids: order.id, released_order_ids: { $ne: order.id } }, { $inc: { stock_quantity: quantity }, $addToSet: { released_order_ids: order.id } });
    }
    await db.Order.update(order.id, { status: 'cancelled' });
    return { paid: false, status: 'cancelled', orderNumber: order.order_number };
  };
  // Always retrieve the latest state: webhooks can arrive out of order.
  intent = await stripeRequest(secrets.get('STRIPE_SECRET_KEY'), `/payment_intents/${intent.id}`);
  if (intent.status === 'canceled') return release();
  if (!['requires_capture', 'succeeded'].includes(intent.status)) return { paid: false, status: intent.status };
  for (const [id, quantity] of stock) {
    // Conditional decrement + idempotency marker occur in ONE database operation.
    await db.BaseProductVariant.updateMany({ id, is_active: true, stock_quantity: { $gte: quantity }, debited_order_ids: { $ne: order.id }, released_order_ids: { $ne: order.id } }, { $inc: { stock_quantity: -quantity }, $addToSet: { debited_order_ids: order.id } });
    const variant = await db.BaseProductVariant.get(id);
    if (!variant.debited_order_ids?.includes(order.id) || variant.released_order_ids?.includes(order.id)) {
      if (intent.status === 'succeeded') throw new Error('Pagamento capturado sem estoque reservado. Revisão necessária.');
      await stripeRequest(secrets.get('STRIPE_SECRET_KEY'), `/payment_intents/${intent.id}/cancel`, { method: 'POST', headers: { 'Idempotency-Key': `pod-cancel-${order.id}` } });
      await release();
      return { paid: false, status: 'cancelled', error: 'Esse insumo acabou de esgotar. A autorização foi cancelada, sem captura.' };
    }
  }
  if (intent.status === 'requires_capture') {
    intent = await stripeRequest(secrets.get('STRIPE_SECRET_KEY'), `/payment_intents/${intent.id}/capture`, { method: 'POST', headers: { 'Idempotency-Key': `pod-capture-${order.id}` } });
  }
  if (intent.status !== 'succeeded') return { paid: false, status: intent.status };
  // Never regress an already producing/shipped/delivered order on a replay.
  await db.Order.updateMany({ id: order.id, status: 'pending' }, { $set: { status: 'paid' } });
  return { paid: true, status: 'paid', orderNumber: order.order_number, total: order.total, purchasedItemIds: order.items.map(i => i.cart_item_id) };
  } finally {
    await db.Order.updateMany({ id: order.id, settlement_lock: lock }, { $set: { settlement_expires: 0, settlement_lock: '' } });
  }
}