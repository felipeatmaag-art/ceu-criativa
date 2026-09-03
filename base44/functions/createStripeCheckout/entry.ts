import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';
import { stripeRequest } from '../../shared/stripe.ts';

const prices = { camiseta: 4990, baby_look: 4990, quadro: 8990, caneca: 3990 };

export default async function(req: Request): Promise<Response> {
  let order = null;
  let base44 = null;
  try {
    base44 = createClientFromRequest(req);
    const body = await req.json();
    const items = Array.isArray(body.items) ? body.items.slice(0, 20) : [];
    if (!items.length) return Response.json({ error: 'Carrinho vazio' }, { status: 400 });
    if (!body.customer?.email || !body.customer?.name) return Response.json({ error: 'Informe nome e e-mail' }, { status: 400 });
    if (!body.shippingAddress?.zipcode || !body.shippingAddress?.street || !body.shippingAddress?.number) {
      return Response.json({ error: 'Informe o endereço de entrega' }, { status: 400 });
    }

    const safeItems = items.map((item) => {
      const unitPrice = prices[item.product_type];
      if (!unitPrice) throw new Error('Produto inválido no carrinho');
      const quantity = Math.max(1, Math.min(10, Number(item.quantity) || 1));
      return {
        product_type: item.product_type,
        design_id: item.design_id || '',
        design_title: String(item.design_title || 'Arte personalizada').slice(0, 100),
        artist_id: item.artist_id || '',
        quantity,
        size: String(item.size || '').slice(0, 30),
        color: String(item.color || '').slice(0, 30),
        price: unitPrice / 100,
      };
    });

    const subtotalCents = safeItems.reduce((sum, item) => sum + Math.round(item.price * 100) * item.quantity, 0);
    const shippingCents = subtotalCents >= 15000 ? 0 : 1500;
    const couponRate = body.couponCode === 'CRIATIVO10' ? 0.10 : body.couponCode === 'BEMVINDO' ? 0.05 : 0;
    const paymentRate = body.paymentMethod === 'pix' ? 0.05 : 0;
    const discountCents = Math.round(subtotalCents * (couponRate + paymentRate));
    const totalCents = Math.max(100, subtotalCents - discountCents + shippingCents);
    const orderNumber = `CEU-${Date.now().toString().slice(-8)}`;

    order = await base44.asServiceRole.entities.Order.create({
      order_number: orderNumber,
      customer_email: String(body.customer.email).trim().toLowerCase().slice(0, 150),
      customer_name: String(body.customer.name).trim().slice(0, 100),
      items: safeItems,
      subtotal: subtotalCents / 100,
      shipping_cost: shippingCents / 100,
      total: totalCents / 100,
      status: 'pending',
      shipping_address: body.shippingAddress,
    });

    const origin = new URL(req.url).origin;
    const method = ['pix', 'boleto', 'credit'].includes(body.paymentMethod) ? body.paymentMethod : 'credit';
    const paymentType = method === 'credit' ? 'card' : method;
    const params = new URLSearchParams({
      mode: 'payment',
      customer_email: String(body.customer.email).trim(),
      success_url: `${origin}/CheckoutSuccess?session_id={CHECKOUT_SESSION_ID}&order_id=${order.id}`,
      cancel_url: `${origin}/Cart?checkout=cancelled`,
      'payment_method_types[]': paymentType,
      'line_items[0][price_data][currency]': 'brl',
      'line_items[0][price_data][product_data][name]': `Pedido ${orderNumber}`,
      'line_items[0][price_data][product_data][description]': `${safeItems.length} item(ns) personalizado(s)`,
      'line_items[0][price_data][unit_amount]': String(totalCents),
      'line_items[0][quantity]': '1',
      'metadata[base44_app_id]': secrets.get('BASE44_APP_ID'),
      'metadata[order_id]': order.id,
      'payment_intent_data[metadata][base44_app_id]': secrets.get('BASE44_APP_ID'),
      'payment_intent_data[metadata][order_id]': order.id,
      locale: 'pt-BR',
    });
    if (paymentType === 'boleto') params.set('payment_method_options[boleto][expires_after_days]', '3');

    const session = await stripeRequest(secrets.get('STRIPE_SECRET_KEY'), '/checkout/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Idempotency-Key': crypto.randomUUID(),
      },
      body: params,
    });
    return Response.json({ checkoutUrl: session.url, orderId: order.id, orderNumber });
  } catch (error) {
    console.error('createStripeCheckout:', error);
    if (order && base44) await base44.asServiceRole.entities.Order.delete(order.id);
    return Response.json({ error: error.message }, { status: 500 });
  }
}