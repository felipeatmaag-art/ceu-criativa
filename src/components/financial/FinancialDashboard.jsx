import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { WalletCards } from 'lucide-react';
import FinancialMetrics from '@/components/financial/FinancialMetrics';
import FinancialCharts from '@/components/financial/FinancialCharts';
import RecentCommissions from '@/components/financial/RecentCommissions';

export default function FinancialDashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['artist-financial-summary'],
    queryFn: async () => (await base44.functions.invoke('getArtistFinancialSummary', {})).data
  });

  return (
    <section className="mb-8 space-y-5" aria-labelledby="financial-title">
      <div>
        <div className="flex items-center gap-2 text-ceu-aqua mb-2"><WalletCards className="w-5 h-5" /><span className="text-sm font-semibold">Financeiro</span></div>
        <h2 id="financial-title" className="text-2xl font-bold text-foreground">Seu saldo e suas comissões</h2>
        <p className="text-sm text-muted-foreground mt-1">Acompanhe os valores gerados pelas vendas dos seus designs.</p>
      </div>
      {isLoading && <div className="h-32 rounded-2xl bg-muted animate-pulse" />}
      {isError && <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">Não foi possível carregar seu resumo financeiro.</div>}
      {data && <><FinancialMetrics summary={data} /><FinancialCharts history={data.monthlyHistory || []} /><RecentCommissions transactions={data.pendingTransactions || []} /></>}
    </section>
  );
}