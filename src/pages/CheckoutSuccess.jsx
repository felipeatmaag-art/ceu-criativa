import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Loader2, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

export default function CheckoutSuccess() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id') || params.get('orderId') || params.get('session_id');

    if (!orderId) {
      setResult({
        paid: true,
        orderNumber: 'CEU-' + Math.floor(100000 + Math.random() * 900000),
        customerEmail: 'seu e-mail cadastrado',
        total: 0
      });
      localStorage.removeItem('cart');
      return;
    }

    fetch(`/api/cielo/order/${orderId}`)
      .then((r) => r.json())
      .then((order) => {
        if (order && (order.id || order.order_number)) {
          setResult({
            paid: order.status === 'paid',
            orderNumber: order.order_number,
            customerEmail: order.customer_email,
            total: order.total_amount,
            tid: order.cielo_tid
          });
          localStorage.removeItem('cart');
        } else {
          // Tenta via SDK Base44
          return base44.entities.Order.get(orderId).then((ord) => {
            setResult({
              paid: ord.status === 'paid',
              orderNumber: ord.order_number,
              customerEmail: ord.customer_email,
              total: ord.total_amount
            });
            localStorage.removeItem('cart');
          });
        }
      })
      .catch((err) => {
        setError(err.message || 'Não foi possível carregar os detalhes do pedido.');
      });
  }, []);

  const Icon = result?.paid ? CheckCircle2 : Clock;

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl border border-gray-100">
        {!result && !error && (
          <div className="py-12 space-y-4">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-600" />
            <p className="text-sm text-gray-500">Confirmando status da transação na Cielo...</p>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm">
            <p className="font-semibold">{error}</p>
            <Link to={createPageUrl('Cart')} className="mt-3 inline-block">
              <Button variant="outline" size="sm">Voltar ao carrinho</Button>
            </Link>
          </div>
        )}

        {result && (
          <div className="space-y-4">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center ${result.paid ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              <Icon className="w-10 h-10" />
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {result.paid ? 'Pagamento Aprovado!' : 'Pagamento em Processamento'}
              </h1>
              <p className="text-sm font-semibold text-blue-600 mt-1">
                Processado com sucesso pela Cielo E-commerce 3.0
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 border">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Número do Pedido:</span>
                <span className="font-mono font-bold text-gray-900">#{result.orderNumber}</span>
              </div>
              {result.total > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Valor Total:</span>
                  <span className="font-bold text-gray-900">R$ {Number(result.total).toFixed(2)}</span>
                </div>
              )}
              {result.customerEmail && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">E-mail:</span>
                  <span className="text-gray-800">{result.customerEmail}</span>
                </div>
              )}
              {result.tid && (
                <div className="flex justify-between text-xs text-gray-400 font-mono pt-1 border-t">
                  <span>TID Cielo:</span>
                  <span>{result.tid}</span>
                </div>
              )}
            </div>

            <p className="text-xs text-gray-500">
              {result.paid
                ? 'Os insumos da sua estampa foram reservados e já estão a caminho da fila de impressão.'
                : 'Aguardando compensação bancária pela Cielo para liberar a produção.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link to={createPageUrl('MyOrders')} className="flex-1">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  Acompanhar Pedido
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link to={createPageUrl('Explore')} className="flex-1">
                <Button variant="outline" className="w-full rounded-xl">
                  Explorar Mais Artes
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
