import React from 'react';
import { Badge } from '@/components/ui/badge';

const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const statusLabel = { paid: 'Pago', producing: 'Em produção', shipped: 'Enviado', delivered: 'Disponível' };

export default function RecentCommissions({ transactions }) {
  if (!transactions.length) return <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">Suas comissões aparecerão aqui após a primeira venda paga.</div>;

  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b"><h3 className="font-semibold text-foreground">Comissões recentes</h3></div>
      <div className="divide-y">
        {transactions.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">Pedido {item.orderNumber}</p>
              <p className="text-xs text-muted-foreground mt-1">{new Date(item.date).toLocaleDateString('pt-BR')}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-foreground">{money(item.commission)}</p>
              <Badge variant="secondary" className="mt-1 rounded-full font-normal">{statusLabel[item.status]}</Badge>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}