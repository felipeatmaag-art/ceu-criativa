import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function CheckoutSuccess() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    base44.functions.invoke('confirmStripeCheckout', {
      sessionId: params.get('session_id'),
      orderId: params.get('order_id'),
    }).then(({ data }) => {
      setResult(data);
      localStorage.removeItem('cart');
    }).catch((err) => setError(err.response?.data?.error || 'Não foi possível confirmar o pagamento.'));
  }, []);

  const Icon = result?.paid ? CheckCircle : Clock;
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl">
        {!result && !error && <Loader2 className="w-12 h-12 mx-auto animate-spin text-emerald-500" />}
        {error && <p className="text-red-600 font-medium">{error}</p>}
        {result && <>
          <Icon className={`w-16 h-16 mx-auto mb-5 ${result.paid ? 'text-emerald-500' : 'text-amber-500'}`} />
          <h1 className="text-3xl font-bold text-gray-900">{result.paid ? 'Pagamento confirmado!' : 'Pagamento em processamento'}</h1>
          <p className="text-gray-500 mt-3">Pedido #{result.orderNumber}</p>
          <p className="text-gray-600 mt-2">Enviaremos as atualizações para {result.customerEmail}.</p>
          <p className="text-xl font-bold text-gray-900 mt-5">R$ {Number(result.total).toFixed(2)}</p>
        </>}
        <Link to={createPageUrl('Explore')}><Button className="mt-8 ceu-gradient text-white rounded-xl">Continuar explorando</Button></Link>
      </div>
    </div>
  );
}