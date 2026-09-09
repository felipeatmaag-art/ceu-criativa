import { loadStripe } from '@stripe/stripe-js';
import { base44 } from '@/api/base44Client';
let stripePromise;
export function getEmbeddedStripe() {
  // This app uses Vite/React. For a future Next.js host, expose NEXT_PUBLIC_STRIPE_KEY through its runtime adapter.
  // Never expose STRIPE_SECRET_KEY. Only a publishable pk_* key may reach the browser.
  if (!stripePromise) stripePromise = (async () => {
    const configured = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.NEXT_PUBLIC_STRIPE_KEY || import.meta.env.VITE_NEXT_PUBLIC_STRIPE_KEY;
    const key = configured || (await base44.functions.invoke('createStripeCheckout', { action: 'config' })).data.publishableKey;
    return key ? loadStripe(key) : null;
  })();
  return stripePromise;
}
export async function prepareEmbeddedPayment(payload, identity) {
  return (await base44.functions.invoke('createStripeCheckout', { ...payload, ...identity, paymentMethod: 'credit' })).data;
}
export async function completeEmbeddedPayment(orderId, checkoutToken) {
  return (await base44.functions.invoke('completePodPayment', { orderId, checkoutToken })).data;
}