import React from 'react';
import { Radio, Trophy } from 'lucide-react';
import CompetitionRanking from '@/components/competitions/CompetitionRanking';

export default function CompetitionLeaderboardSection({ competition }) {
  if (!competition) return null;

  return <section data-testid="live-competition-ranking" className="mt-16 rounded-3xl border border-yellow-200 bg-gradient-to-br from-yellow-50 to-white p-5 sm:p-8">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <span className="inline-flex items-center gap-2 text-sm font-bold text-purple-700"><Radio className="h-4 w-4 animate-pulse"/>Atualização em tempo real</span>
        <h2 className="mt-2 flex items-center gap-2 text-2xl font-bold text-gray-900 sm:text-3xl"><Trophy className="text-yellow-500"/>Artes mais votadas</h2>
        <p className="mt-1 text-gray-600">{competition.title} · o pódio é definido pelos votos da comunidade.</p>
      </div>
    </div>
    <CompetitionRanking competition={competition} showHeading={false} limit={6}/>
  </section>;
}