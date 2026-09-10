import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import Stripe from 'npm:stripe@17.7.0';
import { secrets } from 'base44:runtime';
import settlePodPayment from '../../shared/settlePodPayment.ts';
export default async function(req: Request): Promise<Response> {
  const base44 = createClientFromRequest(req);
  try {
    // Establish the request auth context first; provider authenticity is signature-based.
    await base44.auth.isAuthenticated();
    const signature = req.headers.get('stripe-signature');
    if (!signature) return Response.json({ error: 'Assinatura obrigatória.' }, { status: 400 });
    const stripe = new Stripe(secrets.get('STRIPE_SECRET_KEY'));
    let event;
    try { event = await stripe.webhooks.constructEventAsync(await req.text(), signature, secrets.get('STRIPE_POD_WEBHOOK_SECRET')); }
    catch (_) { return Response.json({ error: 'Assinatura inválida.' }, { status: 400 }); }
    const supported = ['payment_intent.amount_capturable_updated', 'payment_intent.succeeded', 'payment_intent.canceled', 'payment_intent.payment_failed'];
    if (supported.includes(event.type) && event.data.object.metadata?.base44_app_id === secrets.get('BASE44_APP_ID') && event.data.object.metadata?.order_id) {
      const orders = await base44.asServiceRole.entities.Order.filter({ id: event.data.object.metadata.order_id }, '-created_date', 1);
      if (orders[0]?.payment_intent_id === event.data.object.id) {
        if (event.type === 'payment_intent.payment_failed') console.error('stripePodWebhook: pagamento recusado', event.data.object.id);
        else await settlePodPayment(base44, event.data.object);
      }
    }
    return Response.json({ received: true, handled: supported.includes(event.type) });
  } catch (e) { console.error('stripePodWebhook:', e.message); return Response.json({ error: 'Confirmação pendente de nova tentativa.' }, { status: 500 }); }
}