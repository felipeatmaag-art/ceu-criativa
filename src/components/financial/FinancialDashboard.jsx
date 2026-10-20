import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { WalletCards, KeyRound, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import FinancialMetrics from '@/components/financial/FinancialMetrics';
import FinancialCharts from '@/components/financial/FinancialCharts';
import RecentCommissions from '@/components/financial/RecentCommissions';
import FinancialReportButton from '@/components/financial/FinancialReportButton';
import PayoutRequestButton from '@/components/financial/PayoutRequestButton';
import PixKeyConfigForm from '@/components/financial/PixKeyConfigForm';
import { Button } from '@/components/ui/button';

export default function FinancialDashboard() {
  const [showPixConfig, setShowPixConfig] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['artist-financial-summary'],
    queryFn: async () => (await base44.functions.invoke('getArtistFinancialSummary', {})).data
  });

  const hasConfiguredPix = !!data?.pixKey;

  return (
    <section className="mb-8 space-y-6" aria-labelledby="financial-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-ceu-aqua mb-2">
            <WalletCards className="w-5 h-5" />
            <span className="text-sm font-semibold">Financeiro do Artista</span>
          </div>
          <h2 id="financial-title" className="text-2xl font-bold text-foreground">
            Seu Saldo e Repasses Pix
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            A Céu Criativa (Atma) recebe as vendas centralmente e transfere suas comissões via Pix.
          </p>
        </div>

        {data && (
          <div className="flex flex-wrap items-end justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPixConfig(!showPixConfig)}
              className="rounded-full border-slate-300 text-xs font-bold gap-1.5 h-10 px-4"
            >
              <KeyRound className="w-4 h-4 text-emerald-600" />
              <span>{hasConfiguredPix ? 'Alterar Chave Pix' : 'Cadastrar Chave Pix'}</span>
              {showPixConfig ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </Button>

            <FinancialReportButton summary={data} />
            <PayoutRequestButton available={data.available} />
          </div>
        )}
      </div>

      {/* CARD STATUS DA CHAVE PIX */}
      {data && (
        <div className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          hasConfiguredPix 
            ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
            : 'bg-amber-50/80 border-amber-300 text-amber-950'
        }`}>
          <div className="flex items-center gap-2.5">
            {hasConfiguredPix ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            )}
            <div>
              <span className="font-extrabold">
                {hasConfiguredPix ? 'Chave Pix para Recebimento de Repasses:' : 'Atenção: Nenhuma chave Pix cadastrada!'}
              </span>{' '}
              {hasConfiguredPix ? (
                <code className="bg-white px-2 py-0.5 rounded font-mono font-bold text-emerald-900 border border-emerald-300">
                  {data.pixKey}
                </code>
              ) : (
                <span className="text-amber-900">
                  Cadastre sua chave Pix abaixo para a Atma poder transferir seus ganhos.
                </span>
              )}
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPixConfig(!showPixConfig)}
            className="text-xs font-bold text-slate-800 hover:text-emerald-700 p-0 h-auto underline self-start sm:self-auto"
          >
            {hasConfiguredPix ? (showPixConfig ? 'Ocultar Formulário' : 'Editar Preferências Pix') : 'Cadastrar Agora ↓'}
          </Button>
        </div>
      )}

      {/* FORMULÁRIO DE CADASTRO/EDIÇÃO DE CHAVE PIX */}
      {(showPixConfig || (!hasConfiguredPix && data)) && (
        <PixKeyConfigForm
          initialData={data || {}}
          onSaveSuccess={() => {
            refetch();
            setShowPixConfig(false);
          }}
          className="ring-2 ring-emerald-500/20"
        />
      )}

      {isLoading && <div className="h-32 rounded-2xl bg-muted animate-pulse" />}
      {isError && (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-5 text-sm text-destructive">
          Não foi possível carregar seu resumo financeiro.
        </div>
      )}

      {data && (
        <>
          <FinancialMetrics summary={data} />
          <FinancialCharts history={data.monthlyHistory || []} />
          <RecentCommissions transactions={data.pendingTransactions || []} />
        </>
      )}
    </section>
  );
}
