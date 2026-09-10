import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Landmark } from 'lucide-react';
import AdminFinancialMetrics from '@/components/financial/AdminFinancialMetrics';
import AdminFinancialCharts from '@/components/financial/AdminFinancialCharts';
import ArtistCommissionList from '@/components/financial/ArtistCommissionList';
import CommissionRateManager from '@/components/financial/CommissionRateManager';

export default function AdminFinancialDashboard() {
  const { data, isLoading, isError } = useQuery({ queryKey: ['platform-financial-summary'], queryFn: async () => (await base44.functions.invoke('getArtistFinancialSummary', { scope: 'platform' })).data });
  return <section className="space-y-5" aria-labelledby="admin-financial-title"><div><div className="mb-2 flex items-center gap-2 text-ceu-aqua"><Landmark className="h-5 w-5"/><span className="text-sm font-semibold">Financeiro da plataforma</span></div><h2 id="admin-financial-title" className="text-3xl font-bold text-ceu-navy">Vendas, comissões e lucro real</h2><p className="mt-2 text-sm text-muted-foreground">Valores consolidados somente de pedidos pagos e em andamento.</p></div>{isLoading && <div className="h-32 animate-pulse rounded-2xl bg-muted"/>}{isError && <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">Não foi possível carregar os dados financeiros.</div>}{data && <><AdminFinancialMetrics summary={data}/><AdminFinancialCharts history={data.monthlyHistory || []}/><CommissionRateManager/><ArtistCommissionList artists={data.artistCommissions || []}/></>}</section>;
}