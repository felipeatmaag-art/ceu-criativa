import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';
import { stripeRequest } from '../../shared/stripe.ts';

import checkoutItems from '../../shared/checkoutItems.ts';
import { tokenHash } from '../../shared/checkoutSecurity.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    if (body.action === 'config') return Response.json({ publishableKey: secrets.get('STRIPE_PUBLISHABLE_KEY') || null });
    const base44 = createClientFromRequest(req);
    const items = body.items;
    if (!Array.isArray(items) || !items.length || items.length > 20) return Response.json({ error: 'Escolha de 1 a 20 itens.' }, { status: 400 });
    if (body.paymentMethod && body.paymentMethod !== 'credit' && body.paymentMethod !== 'google_pay') return Response.json({ error: 'Este checkout integrado aceita cartão e Google Pay. Pix e boleto aguardam integração sem redirecionamento.' }, { status: 400 });
    if (!body.customer?.name?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.customer?.email || '')) throw new Error('Informe nome e e-mail válidos.');
    if (!['zipcode','street','number','city','state'].every(k => typeof body.shippingAddress?.[k] === 'string' && body.shippingAddress[k].trim())) throw new Error('Complete o endereço de entrega.');
    if (!/^[a-zA-Z0-9-]{32,80}$/.test(body.requestId || '')) throw new Error('Identificação do checkout inválida.');
    const hash = await tokenHash(body.checkoutToken);
    const db = base44.asServiceRole.entities;
    let order = (await db.Order.filter({ checkout_key: body.requestId, checkout_token_hash: hash }, '-created_date', 1))[0];
    if (!order) {
      const safeItems = await checkoutItems(base44, items);
      const grouped = new Map();
      safeItems.forEach(i => grouped.set(i.variant_id, (grouped.get(i.variant_id) || 0) + i.quantity));
      for (const [id, count] of grouped) if ((await db.BaseProductVariant.get(id)).stock_quantity < count) throw new Error('A soma dos itens ultrapassa o estoque físico disponível.');
      const subtotal = safeItems.reduce((sum, i) => sum + Math.round(i.price * 100) * i.quantity, 0);
      const shipping = subtotal >= 15000 ? 0 : 1500;
      const discount = body.couponCode === 'CRIATIVO10' ? 0.1 : body.couponCode === 'BEMVINDO' ? 0.05 : 0;
      const total = subtotal - Math.round(subtotal * discount) + shipping;
      const baseCostTotal = safeItems.reduce((sum, item) => sum + Math.round(item.base_cost * 100) * item.quantity, 0);
      const artistCommissionTotal = safeItems.reduce((sum, item) => sum + Math.round(item.artist_commission * 100) * item.quantity, 0);
      order = await db.Order.create({ order_number: `CEU-${crypto.randomUUID().slice(0,8).toUpperCase()}`, customer_name: body.customer.name.trim().slice(0,100), customer_email: body.customer.email.trim().toLowerCase().slice(0,150), items: safeItems, subtotal: subtotal/100, shipping_cost: shipping/100, total: total/100, base_cost_total: baseCostTotal/100, artist_commission_total: artistCommissionTotal/100, status: 'pending', checkout_key: body.requestId, checkout_token_hash: hash, shipping_address: Object.fromEntries(['zipcode','street','number','city','state'].map(k => [k, body.shippingAddress[k].trim().slice(0,200)])) });
    }
    if (order.status === 'cancelled') throw new Error('Este pagamento foi cancelado. Inicie uma nova tentativa.');
    let intent;
    if (order.payment_intent_id) intent = await stripeRequest(secrets.get('STRIPE_SECRET_KEY'), `/payment_intents/${order.payment_intent_id}`);
    else {
      // Google Pay is tokenized by Stripe Elements; no raw wallet/card token is stored here.
      // TODO: Inserir credenciais do Google Pay API — only if replacing Stripe with a direct Google gateway.
      const params = new URLSearchParams({ amount: String(Math.round(order.total*100)), currency: 'brl', capture_method: 'manual', 'payment_method_types[0]': 'card', 'metadata[base44_app_id]': secrets.get('BASE44_APP_ID'), 'metadata[order_id]': order.id, description: `Pedido ${order.order_number}` });
      intent = await stripeRequest(secrets.get('STRIPE_SECRET_KEY'), '/payment_intents', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Idempotency-Key': `pod-create-${order.id}` }, body: params });
      await db.Order.update(order.id, { payment_intent_id: intent.id });
    }
    return Response.json({ clientSecret: intent.client_secret, orderId: order.id, orderNumber: order.order_number, amount: intent.amount, status: intent.status });
  } catch (error) { console.error('createStripeCheckout:', error.message); return Response.json({ error: error.message }, { status: 400 }); }
}