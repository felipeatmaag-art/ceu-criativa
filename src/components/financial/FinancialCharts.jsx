import React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const monthLabel = (month) => new Date(`${month}-02T12:00:00`).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }).replace('.', '').replace(' de ', ' ');
const fullMonthLabel = (month) => new Date(`${month}-02T12:00:00`).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

function ChartCard({ title, description, value, valueLabel, children }) {
  return <section className="rounded-2xl border bg-card p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h3 className="font-semibold text-foreground">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{description}</p></div><div className="rounded-xl bg-muted px-3 py-2 sm:text-right"><p className="text-lg font-bold text-foreground">{value}</p><p className="text-[11px] text-muted-foreground">{valueLabel}</p></div></div><div className="mt-5 h-64">{children}</div></section>;
}

export default function FinancialCharts({ history }) {
  const data = history.map((item) => ({ ...item, label: monthLabel(item.month), fullLabel: fullMonthLabel(item.month) }));
  const totalEarnings = data.reduce((sum, item) => sum + item.earnings, 0);
  const totalSales = data.reduce((sum, item) => sum + item.sales, 0);
  const tooltipStyle = { borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' };
  const tooltipLabel = (_, payload) => payload?.[0]?.payload.fullLabel || '';
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <ChartCard title="Evolução dos ganhos" description="Comissões recebidas mês a mês nos últimos 12 meses." value={money(totalEarnings)} valueLabel="total no período">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 8 }}><defs><linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--ceu-aqua))" stopOpacity={0.35}/><stop offset="95%" stopColor="hsl(var(--ceu-aqua))" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid vertical={false} stroke="hsl(var(--border))"/><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11}/><YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(value) => `R$${value}`}/><Tooltip contentStyle={tooltipStyle} labelFormatter={tooltipLabel} formatter={(value) => [money(value), 'Ganhos']}/><Area type="monotone" dataKey="earnings" stroke="hsl(var(--ceu-aqua))" strokeWidth={3} fill="url(#earningsFill)"/></AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Histórico de vendas" description="Quantidade de vendas dos seus designs em cada mês." value={totalSales.toLocaleString('pt-BR')} valueLabel={totalSales === 1 ? 'venda no período' : 'vendas no período'}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 8 }}><CartesianGrid vertical={false} stroke="hsl(var(--border))"/><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11}/><YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11}/><Tooltip contentStyle={tooltipStyle} labelFormatter={tooltipLabel} formatter={(value) => [value, 'Vendas']}/><Bar dataKey="sales" fill="hsl(var(--ceu-sky))" radius={[8, 8, 0, 0]} maxBarSize={32}/></BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}