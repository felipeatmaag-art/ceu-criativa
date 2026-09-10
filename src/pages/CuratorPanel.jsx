import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import CurationDesignCard from '@/components/curation/CurationDesignCard';
import ReviewDesignDialog from '@/components/curation/ReviewDesignDialog';
import CuratorAccessGate from '@/components/curation/CuratorAccessGate';

export default function CuratorPanel() {
  const cache = useQueryClient(), [selected, setSelected] = useState(null), [decision, setDecision] = useState('review'), [message, setMessage] = useState('');
  const { data: designs = [], isLoading, isError } = useQuery({ queryKey: ['curation-pending'], queryFn: () => base44.entities.Design.filter({ status: 'pendente' }, '-created_date', 100) });
  useEffect(() => base44.entities.Design.subscribe(() => cache.invalidateQueries({ queryKey: ['curation-pending'] })), [cache]);
  const openReview = (design, nextDecision) => { setSelected(design); setDecision(nextDecision); };
  const confirm = async note => { const user = await base44.auth.me(); await base44.entities.Design.update(selected.id, { status: decision, review_note: note, reviewed_by: user.full_name || user.email, reviewed_at: new Date().toISOString() }); setMessage(decision === 'aprovado' ? 'Estampa aprovada e liberada na plataforma.' : 'Estampa rejeitada e devolvida ao artista.'); setSelected(null); await cache.invalidateQueries({ queryKey: ['curation-pending'] }); };
  return <CuratorAccessGate><div className="min-h-screen bg-muted/30 py-10"><main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><header className="mb-8"><span className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700"><ShieldCheck className="h-5 w-5"/>Equipe de curadoria</span><h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Aprovação de estampas</h1><p className="mt-2 text-muted-foreground">Revise as artes pendentes antes de liberá-las para venda.</p></header>{message && <p role="status" className="mb-6 rounded-2xl bg-emerald-50 p-4 text-emerald-800">{message}</p>}{isLoading ? <div className="h-52 animate-pulse rounded-3xl bg-muted"/> : isError ? <p className="rounded-2xl bg-destructive/10 p-6 text-destructive">Não foi possível carregar a fila de aprovação.</p> : designs.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{designs.map(design => <CurationDesignCard key={design.id} design={design} onReview={openReview}/>)}</div> : <div className="rounded-3xl border bg-card p-12 text-center"><ShieldCheck className="mx-auto h-10 w-10 text-emerald-600"/><h2 className="mt-4 text-xl font-bold">Fila zerada</h2><p className="mt-2 text-muted-foreground">Nenhuma estampa aguardando aprovação.</p></div>}<ReviewDesignDialog design={selected} decision={decision} open={!!selected} onClose={() => setSelected(null)} onConfirm={confirm}/></main></div></CuratorAccessGate>;
}