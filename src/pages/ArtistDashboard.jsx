import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  TrendingUp, ShoppingBag, Heart, Palette, Plus,
  LayoutGrid, FolderOpen, Lightbulb, PackageCheck, Percent, Megaphone
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import moment from 'moment';
import { motion } from 'framer-motion';
import DesignManagementGrid from '@/components/dashboard/DesignManagementGrid';
import CollectionsManager from '@/components/dashboard/CollectionsManager';
import InsightsPanel from '@/components/dashboard/InsightsPanel';
import DesignPerformanceChart from '@/components/dashboard/DesignPerformanceChart';
import MonthlySalesChart from '@/components/dashboard/MonthlySalesChart';
import NotificationsPanel from '@/components/dashboard/NotificationsPanel';
import RealtimeToasts from '@/components/dashboard/RealtimeToasts';
import ProductionQueue from '@/components/production/ProductionQueue';
import FinancialDashboard from '@/components/financial/FinancialDashboard';
import CategoryBrowser from '@/components/dashboard/CategoryBrowser';
import MarginCalculator from '@/components/dashboard/MarginCalculator';
import MarketingSettings from '@/components/dashboard/MarketingSettings';

export default function ArtistDashboard() {
  const [tab, setTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me()
  });

  const { data: designs = [] } = useQuery({
    queryKey: ['artist-designs', user?.id],
    queryFn: () => base44.entities.Design.filter({ artist_id: user.id }),
    enabled: !!user?.id,
    refetchOnMount: 'always'
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['artist-orders', user?.id],
    queryFn: () => base44.entities.Order.list('-created_date', 200),
    enabled: !!user?.id
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['artist-likes', user?.id],
    queryFn: async () => {
      if (!designs.length) return [];
      const all = await Promise.all(
        designs.map(d => base44.entities.Like.filter({ design_id: d.id }))
      );
      return all.flat();
    },
    enabled: !!user?.id && designs.length > 0
  });

  // Stats
  const myOrders = orders.filter(o =>
    o.items?.some(it => it.artist_id === user?.id)
  );
  const totalSales = myOrders.length;
  const totalRevenue = myOrders.reduce((sum, o) => {
    return sum + (o.items || [])
      .filter(it => it.artist_id === user?.id)
      .reduce((s, it) => s + ((it.artist_commission || 0) * (it.quantity || 1)), 0);
  }, 0);
  const totalLikes = likes.length;
  const approvedDesigns = designs.filter(d => d.status === 'aprovado').length;

  // Chart data – last 12 weeks
  const chartData = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = moment().subtract(i, 'weeks').startOf('isoWeek');
    const weekEnd = weekStart.clone().endOf('isoWeek');
    const label = weekStart.format('DD/MM');
    const weekOrders = myOrders.filter(o =>
      moment(o.created_date).isBetween(weekStart, weekEnd, null, '[]')
    );
    const revenue = weekOrders.reduce((sum, o) =>
      sum + (o.items || [])
        .filter(it => it.artist_id === user?.id)
        .reduce((s, it) => s + ((it.price || 0) * (it.quantity || 1) * 0.3), 0)
    , 0);
    chartData.push({ semana: label, vendas: weekOrders.length, receita: parseFloat(revenue.toFixed(2)) });
  }

  const stats = [
    { label: 'Vendas Totais', value: totalSales, icon: ShoppingBag, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Receita do artista', value: `R$ ${totalRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Curtidas', value: totalLikes, icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Designs Aprovados', value: approvedDesigns, icon: Palette, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <RealtimeToasts userId={user.id} designs={designs} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Olá, {user.artist_name || user.full_name} 👋
            </h1>
            <p className="text-gray-500 mt-0.5 text-sm">Painel do Artista</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationsPanel userId={user.id} designs={designs} />
            <Link to={createPageUrl('Create')}>
              <Button className="rounded-xl bg-gray-900 hover:bg-gray-800 gap-2 text-sm">
                <Plus className="w-4 h-4" /> Novo Design
              </Button>
            </Link>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-6 max-w-full justify-start overflow-x-auto bg-white rounded-2xl p-1 shadow-sm border border-gray-100 gap-1">
            <TabsTrigger value="overview" className="rounded-xl gap-2 text-sm data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4" /> Visão Geral
            </TabsTrigger>
            <TabsTrigger value="designs" className="rounded-xl gap-2 text-sm data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <LayoutGrid className="w-4 h-4" /> Designs
              {designs.length > 0 && (
                <Badge className="bg-gray-100 text-gray-700 border-0 rounded-full text-xs px-1.5 py-0">{designs.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="collections" className="rounded-xl gap-2 text-sm data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <FolderOpen className="w-4 h-4" /> Coleções
            </TabsTrigger>
            <TabsTrigger value="margin" className="rounded-xl gap-2 text-sm data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Percent className="w-4 h-4" /> Margens
            </TabsTrigger>
            <TabsTrigger value="marketing" className="rounded-xl gap-2 text-sm data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Megaphone className="w-4 h-4" /> Marketing
            </TabsTrigger>
            <TabsTrigger value="production" className="rounded-xl gap-2 text-sm data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <PackageCheck className="w-4 h-4" /> Produção
            </TabsTrigger>
            <TabsTrigger value="insights" className="rounded-xl gap-2 text-sm data-[state=active]:bg-gray-900 data-[state=active]:text-white">
              <Lightbulb className="w-4 h-4" /> Insights
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <FinancialDashboard />
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {stats.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                            <Icon className={`w-5 h-5 ${s.color}`} />
                          </div>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{s.label}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-emerald-600" />
                    Vendas por Semana
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="semana" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="vendas" stroke="#10b981" strokeWidth={2} fill="url(#salesGrad)" name="Vendas" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    Receita por Semana (R$)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="semana" stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <YAxis stroke="#9ca3af" fontSize={11} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', fontSize: '12px' }} />
                      <Area type="monotone" dataKey="receita" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" name="Receita (R$)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Sales & Earnings Chart */}
            <div className="mb-6">
              <MonthlySalesChart orders={myOrders} userId={user.id} />
            </div>

            {/* Design Performance */}
            {designs.length > 0 && (
              <DesignPerformanceChart designs={designs} orders={orders} likes={likes} />
            )}
          </TabsContent>

          {/* Designs Tab */}
          <TabsContent value="designs">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div>
                <h3 className="font-bold text-gray-900">Meus Designs</h3>
                <p className="text-sm text-gray-500 mt-0.5">Gerencie, edite e arquive suas estampas</p>
              </div>
              <Link to={createPageUrl('Create')}>
                <Button className="rounded-xl bg-gray-900 hover:bg-gray-800 gap-2 text-sm">
                  <Plus className="w-4 h-4" /> Novo Design
                </Button>
              </Link>
            </div>
            <DesignManagementGrid designs={designs} likes={likes} userId={user.id} />
          </TabsContent>

          {/* Collections Tab */}
          <TabsContent value="collections">
            <CategoryBrowser />
            <CollectionsManager designs={designs} user={user} />
          </TabsContent>

          <TabsContent value="margin"><MarginCalculator user={user} designs={designs} /></TabsContent>
          <TabsContent value="marketing"><MarketingSettings user={user} /></TabsContent>

          <TabsContent value="production">
            <ProductionQueue orders={myOrders} userId={user.id} />
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights">
            <InsightsPanel designs={designs} orders={myOrders} likes={likes} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}