import React from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Vote } from 'lucide-react';
export default function CompetitionEntryCard({ entry, rank, votes, voted, busy, canVote = true, onVote }) {
  return <article data-entry-id={entry.id} data-votes={votes} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
    <div className="relative aspect-square"><img src={entry.image_url} alt={entry.title} className="h-full w-full object-cover" />{rank < 4 && <span className="absolute left-3 top-3 rounded-full bg-ceu-sun px-3 py-1 text-sm font-bold text-ceu-navy"><Trophy className="mr-1 inline h-4 w-4" />#{rank}</span>}</div>
    <div className="p-4"><h3 className="font-bold text-foreground">{entry.title}</h3><p className="text-sm text-muted-foreground">por {entry.artist_name || 'Artista'}</p>
      <div className="mt-4 flex items-center justify-between"><strong>{votes} voto{votes === 1 ? '' : 's'}</strong><Button data-testid={`vote-${entry.id}`} onClick={() => onVote(entry.id)} disabled={!canVote || voted || busy} size="sm" className="rounded-full"><Vote />{!canVote ? 'Encerrado' : voted ? 'Votado' : 'Votar'}</Button></div>
    </div>
  </article>;
}