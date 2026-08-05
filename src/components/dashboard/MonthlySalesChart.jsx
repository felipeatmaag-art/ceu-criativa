import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, Wallet } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import moment from 'moment';

const PERIODS = [
  { value: '3m', label: 'Últimos 3 meses', months: 3 },
  { value: '6m', label: 'Últimos 6 meses', months: 6 },
  { value: '12m', label: 'Últimos 12 meses', months: 12 },
  { value: 'all', label: 'Todo o período', months: null }
];

const COMMISSION_RATE = 0.3;

export default function MonthlySalesChart({ orders, userId }) {
  const [period, setPeriod] = useState('12m');

  const data = useMemo(() => {
    const periodCfg = PERIODS.find(p => p.value === period);
    const months = periodCfg.months;

    // Filter orders by period
    let filtered = orders;
    if (months) {
      const start = moment().subtract(months - 1, 'months').startOf('month');
      filtered = orders.filter(o => moment(o.created_date).isSameOrAfter(start));
    }

    // Group by month
    const monthMap = {};
    filtered.forEach(o => {
      const key = moment(o.created_date).format('YYYY-MM');
      if (!monthMap[key]) {
        monthMap[key] = { month: key, vendas: 0, ganhos: 0 };
      }
      const myItems = (o.items || []).filter(it => it.artist_id === userId);
      const itemRevenue = myItems.reduce(
        (s, it) => s + ((it.price || 0) * (it.quantity || 1) * COMMISSION_RATE),
        0
      );
      if (myItems.length > 0) {
        monthMap[key].vendas += 1;
        monthMap[key].ganhos += itemRevenue;
      }
    });

    // Build sorted list, fill empty months
    const result = [];
    const totalMonths = months || 12;
    for (let i = totalMonths - 1; i >= 0; i--) {
      const m = moment().subtract(i, 'months');
      const key = m.format('YYYY-MM');
      const existing = monthMap[key];
      result.push({
        mes: m.format('MMM/YY'),
        vendas: existing ? existing.vendas : 0,
        ganhos: parseFloat((existing ? existing.ganhos : 0).toFixed(2))
      });
    }
    return result;
  }, [orders, userId, period]);

  const totals = useMemo(() => {
    const totalSales = data.reduce((s, d) => s + d.vendas, 0);
    const totalEarnings = data.reduce((s, d) => s + d.ganhos, 0);
    return { totalSales, totalEarnings };
  }, [data]);

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Vendas e Ganhos Acumulados
          </CardTitle>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48 rounded-xl text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map(p => (
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-6 pt-2">
          <div>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Wallet className="w-3 h-3" /> Total no período
            </p>
            <p className="text-lg font-bold text-gray-900">
              {totals.totalSales} vendas • R$ {totals.totalEarnings.toFixed(2)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="mes" stroke="#9ca3af" fontSize={11} tickLine={false} />
            <YAxis yAxisId="left" stroke="#9ca3af" fontSize={11} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={11} tickLine={false} tickFormatter={v => `R$${v}`} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }}
              formatter={(value, name) => name === 'Ganhos (R$)' ? `R$ ${value.toFixed(2)}` : value}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="vendas"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10b981' }}
              activeDot={{ r: 5 }}
              name="Vendas"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ganhos"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#3b82f6' }}
              activeDot={{ r: 5 }}
              name="Ganhos (R$)"
              strokeDasharray="0"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}