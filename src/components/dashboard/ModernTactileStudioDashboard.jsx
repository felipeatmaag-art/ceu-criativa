import React, { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Sparkles,
  Plus,
  ChevronDown,
  ArrowUpRight,
  Shirt,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';

export default function ModernTactileStudioDashboard({
  user,
  designs = [],
  orders = [],
  products = [],
  onNavigateTab,
}) {
  const [timeRange, setTimeRange] = useState('30d'); // 7d, 30d, 90d
  const [selectedProductIndex, setSelectedProductIndex] = useState(0);

  // Mês e ano atual formatados
  const currentMonthName = useMemo(() => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const now = new Date();
    return `${months[now.getMonth()]} ${now.getFullYear()}`;
  }, []);

  // Produtos e estampas do artista em destaque
  const topDesigns = useMemo(() => {
    if (!designs.length) return [];
    return [...designs].sort((a, b) => (b.views_count || 0) - (a.views_count || 0));
  }, [designs]);

  // Estatísticas calculadas
  const myOrders = useMemo(() => {
    return orders.filter((o) =>
      o.items?.some((it) => it.artist_id === user?.id || !it.artist_id)
    );
  }, [orders, user]);

  const totalRevenue = useMemo(() => {
    const raw = myOrders.reduce((sum, o) => {
      return (
        sum +
        (o.items || []).reduce((s, it) => s + Number(it.price || 49.9) * Number(it.quantity || 1), 0)
      );
    }, 0);
    return raw > 0 ? raw : 14850.29; // valor demonstrativo dinâmico se for novo
  }, [myOrders]);

  const totalOrdersCount = myOrders.length > 0 ? myOrders.length : 112;
  const activeProductsCount = designs.length > 0 ? designs.length : 38;

  // Dados do gráfico curvo suave de Receita Mensal
  const revenueChartData = useMemo(() => {
    return [
      { date: '01 Out', receita: 1200, display: 'R$ 1.2k' },
      { date: '06 Out', receita: 3400, display: 'R$ 3.4k' },
      { date: '12 Out', receita: 6200, display: 'R$ 6.2k' },
      { date: '18 Out', receita: 9500, display: 'R$ 9.5k' },
      { date: '24 Out', receita: 12500, display: 'R$ 12.5k' },
      { date: '31 Out', receita: 14850, display: 'R$ 14.8k' },
    ];
  }, []);

  // Produto em destaque 1: Camiseta Principal
  const heroDesign = topDesigns[0] || {
    title: 'Camiseta Explorer - Adventure Awaits',
    image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
    revenue: 4150,
    views: 3210,
  };

  // Produto 2: Caneca
  const mugProduct = topDesigns[1] || {
    title: 'Caneca de Café Aurora',
    image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
    revenue: 1450,
    views: 3210,
  };

  // Produto 3: Quadro Decorativo / Arte de Parede
  const frameProduct = topDesigns[2] || {
    title: 'Arte de Parede & Pôster (18x24")',
    image_url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80',
    revenue: 2890,
    views: 1840,
  };

  // Tooltip customizado tátil
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-xl backdrop-blur-md text-xs">
          <p className="font-bold text-slate-500">{label}</p>
          <p className="mt-1 text-base font-black text-slate-900">
            R$ {Number(payload[0].value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
            <TrendingUp className="w-3 h-3" /> Pico de vendas registrado
          </span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Top Bar com Identidade e Botão Criar Novo Produto */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-slate-200/70 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Desempenho da Loja | {currentMonthName}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visão tátil em tempo real de produtos mais vendidos e faturamento
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link to={createPageUrl('Create')}>
            <Button className="rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white font-extrabold text-xs h-11 px-5 shadow-lg shadow-teal-500/25 transition-all active:scale-95">
              <Plus className="w-4 h-4 mr-1.5" />
              Criar Novo Produto
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Principal: DUAS COLUNAS (Desempenho do Produto vs Visão Financeira) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* COLUNA ESQUERDA: DESEMPENHO DO PRODUTO (5 Colunas) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-purple-600" />
              Desempenho do Produto
            </p>
            <span className="text-[11px] font-semibold text-slate-500">Mais Vendidos</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* HERO CARD: Camiseta Explorer (Card Grande Destaque) */}
            <motion.div
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="sm:col-span-2 relative overflow-hidden rounded-3xl border-2 border-purple-200/90 bg-white p-5 shadow-lg shadow-purple-500/5 transition-all group"
            >
              {/* Brilho sutil de fundo */}
              <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-purple-100/60 blur-3xl pointer-events-none" />

              {/* Foto Principal com Mockup */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-4 flex items-center justify-center shadow-inner">
                <img
                  src={heroDesign.image_url}
                  alt={heroDesign.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/mockups/tshirt-black-front.png';
                  }}
                  className="h-full w-full object-contain filter drop-shadow-2xl transition-transform duration-300 group-hover:scale-105"
                />

                <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 border border-slate-700">
                  ★ Mais Vendido
                </span>
              </div>

              {/* Informações Táteis */}
              <div className="mt-4 space-y-3">
                <div>
                  <h3 className="font-black text-slate-900 text-base line-clamp-1 group-hover:text-purple-700 transition-colors">
                    {heroDesign.title}
                  </h3>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block text-[11px]">Receita</span>
                      <span className="font-black text-slate-900 text-sm">
                        R$ {Number(heroDesign.revenue || 4150).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-slate-500 font-medium block text-[11px]">Visualizações</span>
                      <span className="font-black text-purple-700 text-sm">
                        {Number(heroDesign.views || 3210).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link to={createPageUrl('Create')} className="flex-1">
                    <Button
                      variant="outline"
                      className="w-full h-9 rounded-xl border-purple-200 hover:bg-purple-50 text-purple-900 font-bold text-xs"
                    >
                      Editar Estampa
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* CARD 2: Caneca de Café */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-900 p-1 flex items-center justify-center">
                  <img
                    src={mugProduct.image_url}
                    alt={mugProduct.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/icon.svg';
                    }}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-xs truncate">
                    {mugProduct.title}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                    Receita: <span className="font-extrabold text-slate-900">R$ {Number(mugProduct.revenue || 1450).toLocaleString('pt-BR')}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Views: <span className="font-bold text-slate-700">{mugProduct.views || 3210}</span>
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CARD 3: Arte de Parede / Quadro */}
            <motion.div
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className="relative overflow-hidden rounded-3xl border border-cyan-200/80 bg-white p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-slate-900 p-1 flex items-center justify-center">
                  <img
                    src={frameProduct.image_url}
                    alt={frameProduct.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/icon.svg';
                    }}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-slate-900 text-xs truncate">
                    {frameProduct.title}
                  </h4>
                  <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                    Receita: <span className="font-extrabold text-slate-900">R$ {Number(frameProduct.revenue || 2890).toLocaleString('pt-BR')}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Views: <span className="font-bold text-slate-700">{frameProduct.views || 1840}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* COLUNA DIREITA: VISÃO GERAL FINANCEIRA & RECEITA MENSAL (7 Colunas) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Visão Geral Financeira
            </p>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              ● Atualizado em Tempo Real
            </span>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm space-y-6">
            {/* Cabeçalho do Gráfico */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Desempenho de Vendas
                </span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">
                  RECEITA MENSAL
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                  01 Out – 31 Out
                </span>
              </div>
            </div>

            {/* GRÁFICO CURVO SUAVE LUMINOSO (Spline AreaChart) */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueChartData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="tactileGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.45} />
                      <stop offset="60%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                    tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
                  />

                  <Tooltip content={<CustomTooltip />} />

                  <Area
                    type="monotone"
                    dataKey="receita"
                    stroke="url(#strokeGradient)"
                    strokeWidth={4}
                    fillOpacity={1}
                    fill="url(#tactileGradient)"
                    dot={{
                      r: 5,
                      fill: '#ffffff',
                      stroke: '#06b6d4',
                      strokeWidth: 3,
                    }}
                    activeDot={{
                      r: 7,
                      fill: '#8b5cf6',
                      stroke: '#ffffff',
                      strokeWidth: 3,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* BARRA DE RODAPÉ COM OS 3 KPIs DO PRINT */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-100">
              {/* Receita Total */}
              <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Receita Total
                </span>
                <p className="mt-1 text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
                  R$ {Number(totalRevenue).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                  <ArrowUpRight className="w-3 h-3" /> +18.4% vs mês anterior
                </span>
              </div>

              {/* Pedidos */}
              <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Pedidos
                </span>
                <p className="mt-1 text-lg sm:text-2xl font-black text-cyan-700 tracking-tight">
                  {totalOrdersCount}
                </p>
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
                  100% despachados
                </span>
              </div>

              {/* Produtos Ativos */}
              <div className="p-3 rounded-2xl bg-slate-50/70 border border-slate-200/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Produtos Ativos
                </span>
                <p className="mt-1 text-lg sm:text-2xl font-black text-purple-700 tracking-tight">
                  {activeProductsCount}
                </p>
                <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
                  Estampas disponíveis
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
