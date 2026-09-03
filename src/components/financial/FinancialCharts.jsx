import React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const monthLabel = (month) => new Date(`${month}-02T12:00:00`).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');

function ChartCard({ title, description, children }) {
  return <div className="rounded-2xl border bg-card p-5 shadow-sm"><h3 className="font-semibold text-foreground">{title}</h3><p className="mt-1 text-xs text-muted-foreground">{description}</p><div className="mt-5 h-64">{children}</div></div>;
}

export default function FinancialCharts({ history }) {
  const data = history.map((item) => ({ ...item, label: monthLabel(item.month) }));
  const tooltipStyle = { borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' };
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <ChartCard title="Evolução dos ganhos" description="Comissões acumuladas nos últimos 12 meses.">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 8 }}><defs><linearGradient id="earningsFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(var(--ceu-aqua))" stopOpacity={0.35}/><stop offset="95%" stopColor="hsl(var(--ceu-aqua))" stopOpacity={0.02}/></linearGradient></defs><CartesianGrid vertical={false} stroke="hsl(var(--border))"/><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11}/><YAxis tickLine={false} axisLine={false} fontSize={11} tickFormatter={(value) => `R$${value}`}/><Tooltip contentStyle={tooltipStyle} formatter={(value) => [money(value), 'Ganhos']}/><Area type="monotone" dataKey="earnings" stroke="hsl(var(--ceu-aqua))" strokeWidth={3} fill="url(#earningsFill)"/></AreaChart>
        </ResponsiveContainer>
      </ChartCard>
      <ChartCard title="Vendas mensais" description="Quantidade de pedidos com seus designs por mês.">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -20, right: 8 }}><CartesianGrid vertical={false} stroke="hsl(var(--border))"/><XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11}/><YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={11}/><Tooltip contentStyle={tooltipStyle} formatter={(value) => [value, 'Vendas']}/><Bar dataKey="sales" fill="hsl(var(--ceu-sky))" radius={[8, 8, 0, 0]} maxBarSize={32}/></BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}