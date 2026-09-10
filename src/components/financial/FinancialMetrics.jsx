import React from 'react';
import { Banknote, Clock3, CircleDollarSign, ShoppingBag, Eye } from 'lucide-react';

const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export default function FinancialMetrics({ summary }) {
  const metrics = [
    { label: 'Saldo disponível', value: money(summary.available), note: 'Pedidos entregues', icon: Banknote, style: 'bg-ceu-aqua/15 text-ceu-navy' },
    { label: 'Em processamento', value: money(summary.processing), note: 'Pedidos em andamento', icon: Clock3, style: 'bg-ceu-sun/20 text-ceu-navy' },
    { label: 'Ganhos totais', value: money(summary.totalCommissions), note: 'Total acumulado', icon: CircleDollarSign, style: 'bg-ceu-sky/20 text-ceu-navy' },
    { label: 'Vendas realizadas', value: summary.salesCount || 0, note: money(summary.grossSales), icon: ShoppingBag, style: 'bg-ceu-coral/15 text-ceu-navy' },
    { label: 'Visualizações', value: summary.viewsCount || 0, note: 'Acessos às estampas', icon: Eye, style: 'bg-ceu-sky/20 text-ceu-navy' }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {metrics.map(({ label, value, note, icon: Icon, style }) => (
        <div key={label} className="rounded-2xl bg-card border p-5 shadow-sm">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${style}`}><Icon className="w-5 h-5" /></div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{note}</p>
        </div>
      ))}
    </div>
  );
}