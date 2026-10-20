import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Check, CheckCircle2, Clock, WalletCards } from 'lucide-react';

const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export default function AdminPayoutRequestsManager({ payouts = [] }) {
  const [copiedId, setCopiedId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();

  const handleCopyPix = (pixKey, id) => {
    if (!pixKey) return;
    navigator.clipboard.writeText(pixKey);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleConfirmPayout = async (payoutId, artistName, amount) => {
    if (!window.confirm(`Confirmar que o Pix de ${money(amount)} foi enviado para ${artistName}?`)) {
      return;
    }
    setLoadingId(payoutId);
    setFeedback('');
    try {
      await base44.functions.invoke('confirmArtistPayout', { payoutId });
      setFeedback(`✓ Repasse de ${money(amount)} para ${artistName} marcado como PAGO!`);
      await queryClient.invalidateQueries({ queryKey: ['platform-financial-summary'] });
      setTimeout(() => setFeedback(''), 5000);
    } catch (err) {
      console.error('Erro ao confirmar repasse:', err);
      setFeedback('Erro ao confirmar repasse.');
    } finally {
      setLoadingId(null);
    }
  };

  const pendingPayouts = payouts.filter(p => p.status === 'pending');
  const completedPayouts = payouts.filter(p => p.status === 'paid');

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 font-semibold text-xs uppercase tracking-wider">
            <WalletCards className="w-4 h-4" />
            <span>Repasses Pix da Plataforma Atma</span>
          </div>
          <h3 className="font-bold text-foreground text-lg">Solicitações de Repasse para Artistas</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            A Atma recebe o Pix dos clientes no checkout e repassa a comissão para a Chave Pix cadastrada do criador.
          </p>
        </div>

        {pendingPayouts.length > 0 && (
          <Badge className="bg-amber-500/10 text-amber-800 border-amber-300 font-bold px-3 py-1">
            <Clock className="w-3.5 h-3.5 mr-1" />
            {pendingPayouts.length} {pendingPayouts.length === 1 ? 'repasse pendente' : 'repasses pendentes'}
          </Badge>
        )}
      </div>

      {feedback && (
        <div className="mx-5 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="p-5 space-y-6">
        {/* PENDENTES */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Aguardando Transferência Pix ({pendingPayouts.length})
          </h4>

          {pendingPayouts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
              Nenhuma solicitação de repasse pendente no momento.
            </div>
          ) : (
            <div className="divide-y rounded-xl border border-amber-200/60 bg-amber-50/20 overflow-hidden">
              {pendingPayouts.map((payout) => (
                <div key={payout.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{payout.artistName}</span>
                      <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300">
                        Pendente
                      </Badge>
                    </div>
                    {payout.artistEmail && (
                      <p className="text-xs text-slate-500">{payout.artistEmail}</p>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-xs font-semibold text-slate-600">Chave Pix:</span>
                      <code className="text-xs font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800">
                        {payout.pixKey || 'Chave Pix não informada'}
                      </code>
                      {payout.pixKey && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyPix(payout.pixKey, payout.id)}
                          className="h-7 px-2 text-xs text-slate-600 hover:text-emerald-700"
                          title="Copiar Chave Pix para o app do seu banco"
                        >
                          {copiedId === payout.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600 mr-1" />
                              <span className="text-emerald-600 font-bold">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 mr-1" />
                              <span>Copiar Pix</span>
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-center">
                    <div className="text-right">
                      <span className="text-xs text-slate-500 block">Valor a Repassar</span>
                      <span className="text-lg font-black text-slate-900">{money(payout.amount)}</span>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleConfirmPayout(payout.id, payout.artistName, payout.amount)}
                      disabled={loadingId === payout.id}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 shadow-sm shadow-emerald-600/30"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1.5" />
                      {loadingId === payout.id ? 'Baixando...' : 'Marcar como Pago no Pix'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CONCLUÍDOS */}
        {completedPayouts.length > 0 && (
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Repasses Realizados Recentemente ({completedPayouts.length})
            </h4>

            <div className="divide-y rounded-xl border border-slate-200 overflow-hidden">
              {completedPayouts.slice(0, 10).map((payout) => (
                <div key={payout.id} className="p-3.5 flex items-center justify-between text-xs bg-slate-50/40">
                  <div>
                    <span className="font-semibold text-slate-800">{payout.artistName}</span>
                    <span className="text-slate-400 mx-2">·</span>
                    <span className="font-mono text-slate-500">Pix: {payout.pixKey}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-emerald-700">{money(payout.amount)}</span>
                    <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                      Pago
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
