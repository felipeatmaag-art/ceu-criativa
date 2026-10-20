import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  ShoppingBag, 
  Truck, 
  RefreshCw, 
  Search,
  MessageCircle,
  Package,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AdminOrdersManager() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-orders-list'],
    queryFn: async () => {
      try {
        const list = await base44.entities.Order.list('-created_date', 100);
        return Array.isArray(list) ? list : [];
      } catch (err) {
        console.error('Erro ao buscar pedidos:', err);
        return [];
      }
    }
  });

  const handleUpdateStatus = async (orderId, newStatus, paymentStatus = null) => {
    try {
      const patch = { status: newStatus };
      if (paymentStatus) {
        patch.payment_status = paymentStatus;
        if (paymentStatus === 'paid') {
          patch.paid_at = new Date().toISOString();
        }
      }
      await base44.entities.Order.update(orderId, patch);
      await queryClient.invalidateQueries({ queryKey: ['admin-orders-list'] });
      setFeedback({
        type: 'success',
        text: `✓ Pedido atualizado para "${newStatus.replace('_', ' ')}"`
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filter === 'ALL' || o.status === filter || o.payment_status === filter;
    const term = search.toLowerCase();
    const orderNum = (o.order_number || o.id || '').toLowerCase();
    const customer = (o.customer_name || o.customer_email || '').toLowerCase();
    return matchesFilter && (orderNum.includes(term) || customer.includes(term));
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Fila de Produção &amp; Pedidos
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Todos os Pedidos da Plataforma ({orders.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe pedidos de clientes, confirme pagamentos Pix e atualize o status da produção têxtil.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="rounded-xl h-9 text-xs font-bold gap-1.5 border-slate-300"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          Atualizar Fila
        </Button>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold">
          {feedback.text}
        </div>
      )}

      {/* Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {['ALL', 'paid', 'pendente', 'em_producao', 'enviado'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st === 'ALL' && 'Todos os Pedidos'}
              {st === 'paid' && 'Pagos'}
              {st === 'pendente' && 'Aguardando Pagamento'}
              {st === 'em_producao' && 'Em Produção'}
              {st === 'enviado' && 'Enviados'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Buscar por pedido ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 rounded-xl bg-white border-slate-300 text-xs text-slate-900"
          />
        </div>
      </div>

      {/* Lista de Pedidos */}
      {isLoading ? (
        <div className="p-10 text-center text-xs text-slate-400 bg-white rounded-3xl border">
          Carregando pedidos...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-3xl border">
          Nenhum pedido encontrado com os filtros selecionados.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((o) => {
            const isPaid = o.payment_status === 'pago' || o.status === 'paid';
            const items = Array.isArray(o.items) ? o.items : [];

            return (
              <div
                key={o.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3 hover:border-slate-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">
                          #{o.order_number || o.id}
                        </span>
                        <Badge className={`text-[10px] font-bold ${isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                          {isPaid ? '✓ Pago via Pix' : 'Aguardando Pagamento'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-600">
                          {o.status || 'novo'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(o.created_date || Date.now()).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900">
                      R$ {Number(o.total_amount || 0).toFixed(2).replace('.', ',')}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {o.payment_method || 'Pix Oficial'}
                    </span>
                  </div>
                </div>

                {/* Dados do Cliente & Itens */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Dados do Comprador:</span>
                    <div><strong>Nome:</strong> {o.customer_name || 'Cliente'}</div>
                    <div><strong>E-mail:</strong> {o.customer_email || 'Não informado'}</div>
                    {o.customer_phone && <div><strong>WhatsApp:</strong> {o.customer_phone}</div>}
                  </div>

                  <div>
                    <span className="font-bold text-slate-900 block mb-1">Itens do Pedido ({items.length}):</span>
                    {items.length > 0 ? (
                      <div className="space-y-1">
                        {items.map((it, idx) => (
                          <div key={idx} className="text-[11px] text-slate-600 truncate">
                            • {it.quantity || 1}x {it.product_name || it.title || 'Produto'} ({it.size || 'M'}, {it.color || 'Preta'})
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Nenhum item discriminado</span>
                    )}
                  </div>
                </div>

                {/* Ações Rápidas do Master */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {!isPaid && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleUpdateStatus(o.id, 'paid', 'paid')}
                        className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Marcar como Pago
                      </Button>
                    )}

                    {isPaid && o.status !== 'em_producao' && o.status !== 'enviado' && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleUpdateStatus(o.id, 'em_producao')}
                        className="h-8 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs gap-1"
                      >
                        <Package className="w-3.5 h-3.5" />
                        Iniciar Produção
                      </Button>
                    )}

                    {o.status !== 'enviado' && (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateStatus(o.id, 'enviado')}
                        className="h-8 rounded-xl border-slate-300 text-slate-700 font-bold text-xs gap-1"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        Marcar como Enviado
                      </Button>
                    )}
                  </div>

                  {o.customer_phone && (
                    <a
                      href={`https://wa.me/55${o.customer_phone.replace(/\D/g, '')}?text=Ol%C3%A1%20${encodeURIComponent(o.customer_name || '')}%21%20Sou%20da%20equipe%20C%C3%A9u%20Criativa%20referente%20ao%20seu%20pedido%20%23${o.order_number || o.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Falar no WhatsApp
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
