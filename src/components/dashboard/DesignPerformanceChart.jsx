import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from 'recharts';
import moment from 'moment';

export default function DesignPerformanceChart({ designs, orders, likes }) {
  const [selectedDesignId, setSelectedDesignId] = useState(designs[0]?.id || '');

  const selectedDesign = designs.find(d => d.id === selectedDesignId);

  // Build per-day data for selected design
  const last30 = [];
  for (let i = 29; i >= 0; i--) {
    const date = moment().subtract(i, 'days');
    const dayStr = date.format('YYYY-MM-DD');
    const daySales = orders
      .filter(o => moment(o.created_date).format('YYYY-MM-DD') === dayStr)
      .reduce((sum, o) => {
        const matched = o.items?.filter(it => it.design_id === selectedDesignId) || [];
        return sum + matched.reduce((s, it) => s + (it.quantity || 1), 0);
      }, 0);
    const dayLikes = likes.filter(l =>
      l.design_id === selectedDesignId &&
      moment(l.created_date).format('YYYY-MM-DD') === dayStr
    ).length;
    last30.push({ date: date.format('DD/MM'), vendas: daySales, curtidas: dayLikes });
  }

  return (
    <Card className="rounded-2xl border-0 shadow-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Performance por Design
          </CardTitle>
          <Select value={selectedDesignId} onValueChange={setSelectedDesignId}>
            <SelectTrigger className="w-56 rounded-xl text-sm">
              <SelectValue placeholder="Selecione um design" />
            </SelectTrigger>
            <SelectContent>
              {designs.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selectedDesign && (
          <div className="flex items-center gap-3 pt-2">
            <img
              src={selectedDesign.image_url}
              alt={selectedDesign.title}
              className="w-10 h-10 rounded-xl object-cover border border-gray-100"
            />
            <div>
              <p className="font-semibold text-gray-900 text-sm">{selectedDesign.title}</p>
              <p className="text-xs text-gray-500 capitalize">{selectedDesign.category} • {selectedDesign.status}</p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={last30} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={11} tickLine={false} interval={6} />
            <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar dataKey="vendas" fill="#10b981" radius={[4, 4, 0, 0]} name="Vendas" />
            <Bar dataKey="curtidas" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Curtidas" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}