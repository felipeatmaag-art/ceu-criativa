import { useRef, useState } from 'react';
import { ExpressCheckoutElement, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import GooglePayPreview from '@/components/checkout/GooglePayPreview';
import { completeEmbeddedPayment } from '@/services/embeddedPayments';
export default function EmbeddedPaymentForm({ payment, identity, onPaid }) {
  const stripe = useStripe(), elements = useElements(), lock = useRef(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [wallet, setWallet] = useState(null), [authorized, setAuthorized] = useState(['requires_capture','succeeded'].includes(payment.status));
  const finish = async () => {
    const result = await completeEmbeddedPayment(payment.orderId, identity.checkoutToken);
    if (result.paid) { onPaid(result); return; }
    if (result.status === 'cancelled') { setError(result.error || 'Autorização cancelada. Feche e abra o checkout para tentar novamente.'); sessionStorage.removeItem('ceu-pod-payment'); return; }
    setError('A confirmação ainda está em andamento. Consulte novamente; não refaça o pagamento.');
  };
  const pay = async () => {
    if (lock.current || !stripe || !elements) return;
    lock.current = true; setBusy(true); setError('');
    try {
      if (!authorized) {
        const submitted = await elements.submit(); if (submitted.error) throw new Error(submitted.error.message);
        // Google Pay's token stays inside Stripe Elements; no wallet token is persisted by our app.
        const result = await stripe.confirmPayment({ elements, redirect: 'if_required' });
        if (result.error) throw new Error(result.error.message);
        setAuthorized(true);
      }
      await finish();
    } catch (e) { setError(e.response?.data?.error || e.message || 'Não foi possível confirmar agora.'); }
    finally { setBusy(false); lock.current = false; }
  };
  return <div className="space-y-4 text-foreground">
    <p className="text-center font-semibold">Pagar rápido e decolar</p>
    <ExpressCheckoutElement options={{ paymentMethods: { googlePay: 'always', applePay: 'never', link: 'never', amazonPay: 'never', paypal: 'never', klarna: 'never' }, buttonTheme: { googlePay: 'black' }, buttonHeight: 48 }} onReady={e => setWallet(!!e.availablePaymentMethods?.googlePay)} onConfirm={pay} />
    {wallet === false && <GooglePayPreview />}
    {wallet === null && <p className="text-sm text-muted-foreground">Verificando Google Pay...</p>}
    {!authorized && <PaymentElement options={{ wallets: { googlePay: 'never', applePay: 'never' }, layout: 'tabs' }} />}
    <Button type="button" className="h-12 w-full rounded-xl" disabled={!stripe || busy} onClick={pay}>{busy ? 'Confirmando seu pedido...' : authorized ? 'Consultar confirmação' : `Pagar com cartão · R$ ${(payment.amount / 100).toFixed(2)}`}</Button>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <p className="text-xs text-muted-foreground">Pagamento integrado e seguro. A captura ocorre somente após reservar o insumo físico.</p>
  </div>;
}