import React from 'react';
import { BadgeDollarSign, CircleDollarSign, Factory, ReceiptText, ShoppingBag } from 'lucide-react';

const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export default function AdminFinancialMetrics({ summary }) {
  const metrics = [
    { label: 'Vendas reais', value: money(summary.grossSales), note: `${summary.salesCount || 0} pedidos pagos`, icon: ShoppingBag, style: 'bg-ceu-sky/20' },
    { label: 'Comissões', value: money(summary.totalCommissions), note: 'Total dos artistas', icon: BadgeDollarSign, style: 'bg-ceu-coral/15' },
    { label: 'Custos de produção', value: money(summary.baseCosts), note: 'Custo base dos produtos', icon: Factory, style: 'bg-ceu-sun/20' },
    { label: 'Lucro total', value: money(summary.totalProfit), note: 'Após custos e comissões', icon: CircleDollarSign, style: 'bg-ceu-aqua/20' },
    { label: 'Ticket médio', value: money(summary.averageTicket), note: 'Média por pedido pago', icon: ReceiptText, style: 'bg-muted' }
  ];
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{metrics.map(({ label, value, note, icon: Icon, style }) => <div key={label} className="rounded-2xl border bg-card p-5 shadow-sm"><div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-ceu-navy ${style}`}><Icon className="h-5 w-5" /></div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-bold text-foreground">{value}</p><p className="mt-1 text-xs text-muted-foreground">{note}</p></div>)}</div>;
}