import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { secrets } from 'base44:runtime';
import { tokenHash } from '../../shared/checkoutSecurity.ts';
import { stripeRequest } from '../../shared/stripe.ts';
import settlePodPayment from '../../shared/settlePodPayment.ts';
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const { orderId, checkoutToken } = await req.json();
    if (!orderId || !checkoutToken) return Response.json({ error: 'Pedido não identificado.' }, { status: 400 });
    // Guest checkout is authorized by a per-checkout secret, not a logged-in User.
    const order = await base44.asServiceRole.entities.Order.get(orderId);
    if (order.checkout_token_hash !== await tokenHash(checkoutToken)) return Response.json({ error: 'Acesso negado.' }, { status: 403 });
    const intent = await stripeRequest(secrets.get('STRIPE_SECRET_KEY'), `/payment_intents/${order.payment_intent_id}`);
    return Response.json(await settlePodPayment(base44, intent));
  } catch (e) { console.error('completePodPayment:', e.message); return Response.json({ error: 'Não foi possível confirmar agora. Tente consultar novamente; não refaça o pagamento.' }, { status: 400 }); }
}