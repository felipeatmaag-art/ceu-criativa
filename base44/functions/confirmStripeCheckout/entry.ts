import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';
import { stripeRequest } from '../../shared/stripe.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { sessionId, orderId } = await req.json();
    if (!sessionId || !orderId) return Response.json({ error: 'Pagamento não identificado' }, { status: 400 });

    const session = await stripeRequest(secrets.get('STRIPE_SECRET_KEY'), `/checkout/sessions/${encodeURIComponent(sessionId)}`);
    if (session.metadata?.base44_app_id !== secrets.get('BASE44_APP_ID') || session.metadata?.order_id !== orderId) {
      return Response.json({ error: 'Pagamento inválido' }, { status: 403 });
    }

    const order = await base44.asServiceRole.entities.Order.get(orderId);
    const isPaid = session.payment_status === 'paid';
    if (isPaid && order.status !== 'paid') await base44.asServiceRole.entities.Order.update(orderId, { status: 'paid' });

    return Response.json({
      paid: isPaid,
      status: isPaid ? 'paid' : 'pending',
      orderNumber: order.order_number,
      customerEmail: order.customer_email,
      total: order.total,
    });
  } catch (error) {
    console.error('confirmStripeCheckout:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}