import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import EmbeddedPaymentForm from '@/components/checkout/EmbeddedPaymentForm';
import GooglePayPreview from '@/components/checkout/GooglePayPreview';
import { getEmbeddedStripe, prepareEmbeddedPayment } from '@/services/embeddedPayments';
import { cartStore } from '@/services/cartStore';
export default function EmbeddedCheckout({ payload, valid, onPaid }) {
  const signature = JSON.stringify(payload);
  const [stripe, setStripe] = useState(undefined), [payment, setPayment] = useState(null), [identity, setIdentity] = useState(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => { let active = true; getEmbeddedStripe().then(s => { if (active) setStripe(s); }).catch(() => { if (active) { setStripe(null); setError('Não foi possível carregar o pagamento seguro.'); } }); return () => { active = false; }; }, []);
  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem('ceu-pod-payment') || 'null');
    setPayment(saved?.signature === signature ? saved.payment : null);
    setIdentity(saved?.signature === signature ? saved.identity : { requestId: crypto.randomUUID(), checkoutToken: crypto.randomUUID() + crypto.randomUUID() });
    setError('');
  }, [signature]);
  const prepare = async () => {
    setBusy(true); setError('');
    try {
      const next = await prepareEmbeddedPayment(payload, identity);
      sessionStorage.setItem('ceu-pod-payment', JSON.stringify({ signature, identity, payment: next })); setPayment(next);
    } catch (e) { setError(e.response?.data?.error || 'Não foi possível preparar o pagamento.'); }
    finally { setBusy(false); }
  };
  const paid = result => { cartStore.removePurchased(result.purchasedItemIds); sessionStorage.removeItem('ceu-pod-payment'); onPaid(result); };
  if (stripe === undefined) return <p className="text-sm text-muted-foreground">Carregando pagamento integrado...</p>;
  return <div className="space-y-3">{!stripe ? <GooglePayPreview reason="A chave pública ou o serviço de pagamentos ainda não está disponível. Nenhuma cobrança foi feita." /> : payment ? <Elements stripe={stripe} options={{ clientSecret: payment.clientSecret, locale: 'pt-BR', appearance: { theme: 'stripe', variables: { borderRadius: '12px' } } }} key={payment.clientSecret}><EmbeddedPaymentForm payment={payment} identity={identity} onPaid={paid} /></Elements> : <><Button type="button" className="h-12 w-full rounded-xl" disabled={!valid || busy || !identity} onClick={prepare}>{busy ? 'Conferindo estoque físico...' : 'Continuar com Google Pay ou cartão'}</Button><p className="text-xs text-muted-foreground">O pagamento abre aqui mesmo. Nenhum redirecionamento para checkout externo.</p></>}{error && <p role="alert" className="text-sm text-destructive">{error}</p>}</div>;
}