import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FinancialDashboard from '@/components/financial/FinancialDashboard';
import DesignPerformanceChart from '@/components/dashboard/DesignPerformanceChart';
import { BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SalesReports() {
  const { data: user, isLoading } = useQuery({ queryKey: ['sales-report-user'], queryFn: async () => { try { return await base44.auth.me(); } catch { return null; } } });
  const { data: designs = [] } = useQuery({ queryKey: ['sales-report-designs', user?.id], queryFn: () => base44.entities.Design.filter({ artist_id: user.id }), enabled: !!user?.id });
  const { data: orders = [] } = useQuery({ queryKey: ['sales-report-orders', user?.id], queryFn: async () => (await base44.entities.Order.list('-created_date', 300)).filter(order => order.items?.some(item => item.artist_id === user.id)), enabled: !!user?.id });
  const { data: likes = [] } = useQuery({ queryKey: ['sales-report-likes', user?.id], queryFn: async () => { const ids = new Set(designs.map(design => design.id)); return (await base44.entities.Like.list('-created_date', 500)).filter(like => ids.has(like.design_id)); }, enabled: !!user?.id && designs.length > 0 });
  if (isLoading) return <div className="min-h-screen bg-ceu-cloud p-12"><div className="mx-auto h-32 max-w-7xl animate-pulse rounded-3xl bg-muted"/></div>;
  if (!user) return <div className="min-h-screen bg-ceu-cloud px-4 py-20 text-center"><h1 className="text-3xl font-bold text-ceu-navy">Relatórios de Vendas</h1><p className="mt-3 text-muted-foreground">Entre para acompanhar o desempenho das suas estampas.</p><Button onClick={() => base44.auth.redirectToLogin('/sales-reports')} className="mt-6 rounded-full">Entrar e visualizar</Button></div>;
  return <div className="min-h-screen bg-ceu-cloud px-4 py-12"><div className="mx-auto max-w-7xl"><header className="mb-8"><div className="mb-2 flex items-center gap-2 text-ceu-aqua"><BarChart3 className="h-5 w-5"/><span className="text-sm font-semibold">Insights do artista</span></div><h1 className="text-4xl font-bold text-ceu-navy">Relatórios de Vendas</h1><p className="mt-2 text-muted-foreground">Vendas, comissões acumuladas e desempenho das suas estampas.</p></header><FinancialDashboard/>{designs.length > 0 && <DesignPerformanceChart designs={designs} orders={orders} likes={likes}/>}</div></div>;
}