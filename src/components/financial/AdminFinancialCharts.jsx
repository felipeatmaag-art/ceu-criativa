import React from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
const label = (month) => new Date(`${month}-02T12:00:00`).toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
const tooltipStyle = { borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' };

export default function AdminFinancialCharts({ history }) {
  const data = history.map(item => ({ ...item, label: label(item.month) }));
  return <div className="grid gap-4 xl:grid-cols-2">
    <section className="rounded-2xl border bg-card p-5 shadow-sm"><h3 className="font-semibold text-foreground">Vendas e lucro mensal</h3><p className="mt-1 text-xs text-muted-foreground">Faturamento bruto comparado ao lucro real.</p><div className="mt-5 h-64"><ResponsiveContainer width="100%" height="100%"><AreaChart data={data}><CartesianGrid vertical={false} stroke="hsl(var(--border))"/><XAxis dataKey="label" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false} tickFormatter={value => `R$${value}`}/><Tooltip contentStyle={tooltipStyle} formatter={value => money(value)}/><Legend/><Area type="monotone" dataKey="gross" name="Vendas" stroke="hsl(var(--ceu-sky))" fill="hsl(var(--ceu-sky))" fillOpacity={0.18}/><Area type="monotone" dataKey="profit" name="Lucro" stroke="hsl(var(--ceu-aqua))" fill="hsl(var(--ceu-aqua))" fillOpacity={0.2}/></AreaChart></ResponsiveContainer></div></section>
    <section className="rounded-2xl border bg-card p-5 shadow-sm"><h3 className="font-semibold text-foreground">Comissões dos artistas</h3><p className="mt-1 text-xs text-muted-foreground">Total calculado automaticamente por mês.</p><div className="mt-5 h-64"><ResponsiveContainer width="100%" height="100%"><BarChart data={data}><CartesianGrid vertical={false} stroke="hsl(var(--border))"/><XAxis dataKey="label" tickLine={false} axisLine={false}/><YAxis tickLine={false} axisLine={false} tickFormatter={value => `R$${value}`}/><Tooltip contentStyle={tooltipStyle} formatter={value => money(value)}/><Bar dataKey="commissions" name="Comissões" fill="hsl(var(--ceu-coral))" radius={[8, 8, 0, 0]} maxBarSize={34}/></BarChart></ResponsiveContainer></div></section>
  </div>;
}