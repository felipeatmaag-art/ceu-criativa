export function createStripeWebhookHandler({ stripe, webhookSecret, appId, findOrder, settlePayment, log = console }) {
  return async function stripeWebhook(req, res) {
    try {
      const event = stripe.webhooks.constructEvent(req.rawBody, req.headers['stripe-signature'], webhookSecret);
      const intent = event.data.object;
      const supported = ['payment_intent.amount_capturable_updated','payment_intent.succeeded','payment_intent.canceled','payment_intent.payment_failed'];
      if (!supported.includes(event.type)) return res.status(200).json({ received: true, handled: false });
      if (intent.metadata?.base44_app_id !== appId || !intent.metadata?.order_id) return res.status(200).json({ received: true, handled: false });
      const order = await findOrder(intent.metadata.order_id);
      if (!order || order.payment_intent_id !== intent.id) return res.status(200).json({ received: true, handled: false });
      if (event.type === 'payment_intent.payment_failed') log.error('Pagamento recusado', intent.id);
      else await settlePayment(order, intent);
      return res.status(200).json({ received: true, handled: true });
    } catch (error) {
      log.error('Webhook Stripe inválido', error.message);
      return res.status(400).json({ error: 'Assinatura inválida.' });
    }
  };
}