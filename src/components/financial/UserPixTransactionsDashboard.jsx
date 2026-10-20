import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { 
  WalletCards, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  KeyRound, 
  RefreshCw, 
  FileText, 
  ShoppingBag, 
  Copy, 
  Check,
  QrCode,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import PixKeyConfigForm from '@/components/financial/PixKeyConfigForm';

/**
 * UserPixTransactionsDashboard
 * Painel completo para o usuário logado visualizar:
 * - Saldo disponível e em processamento
 * - Chave Pix cadastrada para receber repasses da Atma
 * - Histórico de transações de vendas comissões
 * - Status de repasses Pix solicitados e comprovantes
 */
export default function UserPixTransactionsDashboard({ className = '' }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showPixEditor, setShowPixEditor] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [copiedKey, setCopiedKey] = useState(false);

  // Busca dados financeiros do backend
  const { data: summary, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['artist-financial-summary'],
    queryFn: async () => {
      const res = await base44.functions.invoke('getArtistFinancialSummary', {});
      return res.data;
    }
  });

  // Mutação para solicitar repasse Pix
  const payoutMutation = useMutation({
    mutationFn: async () => {
      const res = await base44.functions.invoke('requestArtistPayout', {
        amount: summary?.available || 0
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['artist-financial-summary'] });
    }
  });

  const available = summary?.available || 0;
  const processing = summary?.processing || 0;
  const totalCommissions = summary?.totalCommissions || 0;
  const salesCount = summary?.salesCount || 0;
  const pixKey = user?.pix_key || summary?.pixKey || '';
  const pixKeyType = user?.pix_key_type || 'Chave Pix';
  const payoutRequests = summary?.payoutRequests || [];
  const pendingTransactions = summary?.pendingTransactions || [];

  const handleCopyPix = () => {
    if (!pixKey) return;
    navigator.clipboard.writeText(pixKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* 1. CABEÇALHO COM CARDS DE SALDO E STATUS PIX */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card Saldo Disponível */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 shadow-lg shadow-emerald-900/10 relative overflow-hidden flex flex-col justify-between min-h-[170px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 flex items-center gap-1.5">
              <WalletCards className="w-4 h-4" />
              Saldo Disponível para Pix
            </span>
            <span className="text-[10px] bg-white/20 font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
              Instantâneo
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl sm:text-4xl font-black tracking-tight">
              R$ {available.toFixed(2)}
            </div>
            <p className="text-xs text-emerald-100 mt-1">
              Ganhos acumulados prontos para resgate
            </p>
          </div>

          <div className="pt-2">
            <Button
              type="button"
              disabled={available <= 0 || !pixKey || payoutMutation.isPending}
              onClick={() => payoutMutation.mutate()}
              className="w-full h-10 rounded-xl bg-white text-emerald-900 hover:bg-emerald-50 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              <span>
                {payoutMutation.isPending 
                  ? 'Processando Repasse...' 
                  : available > 0 
                  ? `Resgatar R$ ${available.toFixed(2)} via Pix` 
                  : 'Sem saldo mínimo para resgate'}
              </span>
            </Button>
          </div>
        </div>

        {/* Card Em Processamento */}
        <div className="rounded-3xl bg-slate-900 border border-slate-800 text-white p-6 shadow-sm flex flex-col justify-between min-h-[170px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" />
              Em Processamento
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-400 font-bold px-2 py-0.5 rounded-full border border-amber-500/20">
              Aguardando
            </span>
          </div>

          <div className="my-3">
            <div className="text-3xl font-black text-amber-400 tracking-tight">
              R$ {processing.toFixed(2)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Vendas recentes com pagamento pendente
            </p>
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-800/80">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Total de vendas registradas: <strong>{salesCount}</strong></span>
          </div>
        </div>

        {/* Card Chave Pix Cadastrada para Recebimento */}
        <div className="rounded-3xl bg-white border border-slate-200 text-slate-900 p-6 shadow-sm flex flex-col justify-between min-h-[170px]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-600" />
              Chave Pix Cadastrada
            </span>
            {pixKey ? (
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-bold">
                ✓ Ativa
              </Badge>
            ) : (
              <Badge className="bg-amber-50 text-amber-800 border-amber-300 text-[10px] font-bold">
                Pendente
              </Badge>
            )}
          </div>

          <div className="my-2">
            {pixKey ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 font-mono text-xs text-slate-800">
                  <span className="truncate">{pixKey}</span>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="p-1 hover:text-emerald-700 text-slate-400 transition-colors"
                    title="Copiar Chave Pix"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  {user?.pix_holder_name ? `Titular: ${user.pix_holder_name}` : 'A Céu Criativa transfere para esta chave.'}
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
                Nenhuma chave Pix configurada! Cadastre para receber repasses.
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPixEditor(!showPixEditor)}
              className="w-full rounded-xl text-xs font-bold border-slate-300 hover:bg-slate-50 text-slate-700 h-9"
            >
              {pixKey ? (showPixEditor ? 'Fechar Formulário' : 'Alterar Chave Pix') : 'Cadastrar Chave Pix Agora'}
            </Button>
          </div>
        </div>
      </div>

      {/* FORMULÁRIO DE CONFIGURAÇÃO DE CHAVE PIX (QUANDO EXPANDIDO OU QUANDO NÃO HÁ CHAVE) */}
      {(showPixEditor || !pixKey) && (
        <PixKeyConfigForm
          initialData={user || {}}
          onSaveSuccess={() => {
            setShowPixEditor(false);
            refetch();
          }}
          className="border-emerald-200 ring-2 ring-emerald-500/20"
        />
      )}

      {/* 2. TRANSAÇÕES E VENDAS RECENTES */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
              Vendas &amp; Comissões Recentes
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Histórico de vendas de estampas autorais e os repasses calculados em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              className="h-9 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </Button>
          </div>
        </div>

        {/* LISTAGEM DE TRANSAÇÕES */}
        {isLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">
            Carregando transações...
          </div>
        ) : pendingTransactions.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {pendingTransactions.map((tx) => (
              <div key={tx.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center justify-center font-bold">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      Pedido #{tx.order_number}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{new Date(tx.created_at).toLocaleDateString('pt-BR')}</span>
                      <span>•</span>
                      <span>Pagamento via Pix</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <div className="font-extrabold text-emerald-700 text-sm">
                      + R$ {Number(tx.commission || 0).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Sua comissão líquida
                    </div>
                  </div>

                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-bold">
                    Liberado para Pix
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 mx-auto flex items-center justify-center text-slate-400">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <p className="text-xs font-semibold text-slate-700">
              Nenhuma venda registrada neste momento
            </p>
            <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
              Assim que um cliente comprar sua estampa no site, a comissão aparecerá automaticamente aqui com status de repasse.
            </p>
          </div>
        )}
      </div>

      {/* 3. HISTÓRICO DE REPASSES PIX SOLICITADOS / PAGOS */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="pb-3 border-b border-slate-100">
          <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            Histórico de Repasses Pix
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprovantes e solicitações de transferências bancárias efetuadas pela Céu Criativa (Atma).
          </p>
        </div>

        {payoutRequests.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {payoutRequests.map((payout) => (
              <div key={payout.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                    payout.status === 'paid' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {payout.status === 'paid' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">
                      Repasse de R$ {Number(payout.amount || 0).toFixed(2)}
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      Chave Pix: {payout.pix_key}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">
                    {new Date(payout.created_date).toLocaleDateString('pt-BR')}
                  </span>
                  <Badge className={`text-[10px] font-bold ${
                    payout.status === 'paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-amber-50 text-amber-800 border-amber-300'
                  }`}>
                    {payout.status === 'paid' ? '✓ Transferido no Pix' : '⏳ Aguardando Envio'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            Nenhum repasse solicitado ainda.
          </div>
        )}
      </div>

    </div>
  );
}
