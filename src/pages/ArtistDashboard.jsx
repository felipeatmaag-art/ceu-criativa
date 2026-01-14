import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  DollarSign,
  Heart,
  ShoppingBag,
  Sparkles,
  Calendar,
  ArrowUp,
  ArrowDown,
  Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import moment from 'moment';

export default function ArtistDashboard() {
  const [user, setUser] = useState(null);
  const [period, setPeriod] = useState('all'); // 'week', 'month', 'all'

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: designs = [], isLoading: isLoadingDesigns } = useQuery({
    queryKey: ['artist-designs', user?.id],
    queryFn: () => base44.entities.Design.filter({ artist_id: user.id }, '-created_date', 100),
    enabled: !!user?.id,
  });

  const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ['artist-orders', user?.id],
    queryFn: async () => {
      const allOrders = await base44.entities.Order.list('-created_date', 200);
      return allOrders.filter(order => 
        order.items?.some(item => item.artist_id === user.id)
      );
    },
    enabled: !!user?.id,
  });

  const { data: likes = [] } = useQuery({
    queryKey: ['all-likes'],
    queryFn: () => base44.entities.Like.list('', 1000),
    enabled: !!user?.id,
  });

  // Filter data by period
  const getFilteredOrders = () => {
    if (period === 'all') return orders;
    const now = new Date();
    const daysAgo = period === 'week' ? 7 : 30;
    const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));
    return orders.filter(order => new Date(order.created_date) >= cutoffDate);
  };

  const filteredOrders = getFilteredOrders();

  // Calculate metrics
  const totalSales = filteredOrders.reduce((sum, order) => {
    const artistItems = order.items?.filter(item => item.artist_id === user?.id) || [];
    return sum + artistItems.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0);
  }, 0);

  const totalRevenue = filteredOrders.reduce((sum, order) => {
    const artistItems = order.items?.filter(item => item.artist_id === user?.id) || [];
    return sum + artistItems.reduce((itemSum, item) => {
      const itemPrice = item.price || 0;
      const commission = 0.30; // 30% commission
      return itemSum + (itemPrice * (item.quantity || 1) * commission);
    }, 0);
  }, 0);

  const totalDesigns = designs.length;
  const approvedDesigns = designs.filter(d => d.status === 'aprovado').length;
  const totalLikes = designs.reduce((sum, design) => {
    return sum + likes.filter(like => like.design_id === design.id).length;
  }, 0);

  // Top designs by sales
  const designSalesMap = {};
  filteredOrders.forEach(order => {
    order.items?.forEach(item => {
      if (item.artist_id === user?.id && item.design_id) {
        if (!designSalesMap[item.design_id]) {
          designSalesMap[item.design_id] = {
            id: item.design_id,
            title: item.design_title,
            sales: 0,
            revenue: 0
          };
        }
        designSalesMap[item.design_id].sales += item.quantity || 1;
        designSalesMap[item.design_id].revenue += (item.price || 0) * (item.quantity || 1) * 0.30;
      }
    });
  });

  const topDesignsBySales = Object.values(designSalesMap)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 5);

  // Top designs by likes
  const topDesignsByLikes = designs
    .map(design => ({
      ...design,
      likesCount: likes.filter(like => like.design_id === design.id).length
    }))
    .sort((a, b) => b.likesCount - a.likesCount)
    .slice(0, 5);

  // Sales over time (last 30 days)
  const salesOverTime = [];
  for (let i = 29; i >= 0; i--) {
    const date = moment().subtract(i, 'days');
    const dayOrders = orders.filter(order => 
      moment(order.created_date).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
    );
    const daySales = dayOrders.reduce((sum, order) => {
      const artistItems = order.items?.filter(item => item.artist_id === user?.id) || [];
      return sum + artistItems.reduce((itemSum, item) => itemSum + (item.quantity || 1), 0);
    }, 0);
    const dayRevenue = dayOrders.reduce((sum, order) => {
      const artistItems = order.items?.filter(item => item.artist_id === user?.id) || [];
      return sum + artistItems.reduce((itemSum, item) => {
        return itemSum + ((item.price || 0) * (item.quantity || 1) * 0.30);
      }, 0);
    }, 0);
    salesOverTime.push({
      date: date.format('DD/MM'),
      sales: daySales,
      revenue: dayRevenue
    });
  }

  // Category distribution
  const categoryMap = {};
  designs.forEach(design => {
    if (!categoryMap[design.category]) {
      categoryMap[design.category] = 0;
    }
    categoryMap[design.category]++;
  });

  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899'];

  const statCards = [
    {
      title: 'Ganhos Totais',
      value: `R$ ${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      change: '+12%',
      positive: true
    },
    {
      title: 'Vendas Totais',
      value: totalSales,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      change: '+8%',
      positive: true
    },
    {
      title: 'Designs Publicados',
      value: approvedDesigns,
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      subtitle: `${totalDesigns} total`
    },
    {
      title: 'Total de Curtidas',
      value: totalLikes,
      icon: Heart,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      change: '+15%',
      positive: true
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Faça login para acessar seu dashboard</h2>
          <Button onClick={() => base44.auth.redirectToLogin()} className="ceu-gradient text-white rounded-xl">
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  if (isLoadingDesigns || isLoadingOrders) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard do Artista</h1>
            <p className="text-gray-500">Acompanhe seu desempenho e ganhos</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-48 rounded-xl">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Últimos 7 dias</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="all">Todo período</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="hover-glow rounded-2xl border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                      {stat.change && (
                        <Badge 
                          variant="secondary" 
                          className={`${stat.positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                        >
                          {stat.positive ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                          {stat.change}
                        </Badge>
                      )}
                    </div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">{stat.title}</h3>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    {stat.subtitle && (
                      <p className="text-xs text-gray-400 mt-1">{stat.subtitle}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Over Time */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Vendas nos Últimos 30 Dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Vendas"
                    dot={{ fill: '#10b981', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Category Distribution */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Distribuição por Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Designs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Top Designs by Sales */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                Top 5 Designs por Vendas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topDesignsBySales.length > 0 ? (
                <div className="space-y-3">
                  {topDesignsBySales.map((design, index) => (
                    <div key={design.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{design.title}</p>
                        <p className="text-sm text-gray-500">{design.sales} vendas</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600">R$ {design.revenue.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Nenhuma venda ainda</p>
              )}
            </CardContent>
          </Card>

          {/* Top Designs by Likes */}
          <Card className="rounded-2xl border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Top 5 Designs por Curtidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topDesignsByLikes.length > 0 ? (
                <div className="space-y-3">
                  {topDesignsByLikes.map((design, index) => (
                    <Link
                      key={design.id}
                      to={createPageUrl(`DesignDetail?id=${design.id}`)}
                      className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-red-600 text-white flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-white shrink-0">
                        <img src={design.image_url} alt={design.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{design.title}</p>
                        <p className="text-sm text-gray-500">{design.likesCount} curtidas</p>
                      </div>
                      <Eye className="w-4 h-4 text-gray-400" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">Nenhum design publicado ainda</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="rounded-2xl border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-gray-700" />
              Últimas Transações
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredOrders.length > 0 ? (
              <div className="space-y-3">
                {filteredOrders.slice(0, 10).map((order) => {
                  const artistItems = order.items?.filter(item => item.artist_id === user.id) || [];
                  const orderRevenue = artistItems.reduce((sum, item) => {
                    return sum + ((item.price || 0) * (item.quantity || 1) * 0.30);
                  }, 0);

                  return (
                    <div key={order.id} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Pedido #{order.order_number}</p>
                        <p className="text-sm text-gray-500">
                          {artistItems.length} {artistItems.length === 1 ? 'item' : 'itens'} • {moment(order.created_date).format('DD/MM/YYYY')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-emerald-600">R$ {orderRevenue.toFixed(2)}</p>
                        <Badge variant="secondary" className="mt-1">
                          {order.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma transação encontrada</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}