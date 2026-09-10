import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import CompetitionEntryCard from '@/components/competitions/CompetitionEntryCard';
export default function CompetitionRanking({ competition, showHeading = true, limit }) {
  const cache = useQueryClient(), [busy, setBusy] = useState('');
  const voterKey = useMemo(() => { const key = localStorage.getItem('ceu-voter-key') || crypto.randomUUID(); localStorage.setItem('ceu-voter-key', key); return key; }, []);
  const { data: entries = [], isLoading } = useQuery({ queryKey: ['competition-entries', competition.id], queryFn: () => base44.entities.CompetitionSubmission.filter({ competition_id: competition.id, status: 'approved' }, '-created_date', 100) });
  const { data: votes = [] } = useQuery({ queryKey: ['competition-votes', competition.id], queryFn: () => base44.entities.CompetitionVote.filter({ competition_id: competition.id }, '-created_date', 500) });
  useEffect(() => {
    const refreshEntries = () => cache.invalidateQueries({ queryKey: ['competition-entries', competition.id] });
    const refreshVotes = () => cache.invalidateQueries({ queryKey: ['competition-votes', competition.id] });
    const unsubscribeEntries = base44.entities.CompetitionSubmission.subscribe(refreshEntries);
    const unsubscribeVotes = base44.entities.CompetitionVote.subscribe(refreshVotes);
    return () => { unsubscribeEntries(); unsubscribeVotes(); };
  }, [cache, competition.id]);
  const counts = votes.reduce((map, vote) => ({ ...map, [vote.submission_id]: (map[vote.submission_id] || 0) + 1 }), {});
  const ranking = [...entries].sort((a, b) => (counts[b.id] || 0) - (counts[a.id] || 0) || new Date(a.created_date) - new Date(b.created_date));
  const visibleRanking = limit ? ranking.slice(0, limit) : ranking;
  const mine = new Set(votes.filter(vote => vote.voter_key === voterKey).map(vote => vote.submission_id));
  const canVote = competition.status === 'active' || competition.status === 'voting';
  const vote = async submissionId => { if (!canVote || mine.has(submissionId)) return; setBusy(submissionId); await base44.entities.CompetitionVote.create({ competition_id: competition.id, submission_id: submissionId, voter_key: voterKey }); await cache.invalidateQueries({ queryKey: ['competition-votes', competition.id] }); setBusy(''); };
  if (isLoading) return <div className="h-40 animate-pulse rounded-2xl bg-muted" />;
  return <section className="mt-8">{showHeading && <><h2 className="text-2xl font-bold text-foreground">Ranking da comunidade</h2><p className="mt-1 text-sm text-muted-foreground">A classificação é atualizada automaticamente a cada voto.</p></>}{visibleRanking.length ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visibleRanking.map((entry, index) => <CompetitionEntryCard key={entry.id} entry={entry} rank={index + 1} votes={counts[entry.id] || 0} voted={mine.has(entry.id)} busy={busy === entry.id} canVote={canVote} onVote={vote} />)}</div> : <p className="mt-5 rounded-2xl bg-muted p-6 text-muted-foreground">Ainda não há artes neste concurso.</p>}</section>;
}