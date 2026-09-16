import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, Users, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import CompetitionUploadForm from '@/components/competitions/CompetitionUploadForm';
import CompetitionRanking from '@/components/competitions/CompetitionRanking';

export default function CompetitionDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const competitionId = urlParams.get('id');

  const { data: competition, isLoading } = useQuery({
    queryKey: ['competition', competitionId],
    queryFn: async () => {
      const competitions = await base44.entities.Competition.filter({ id: competitionId });
      return competitions[0];
    },
    enabled: !!competitionId,
  });

  const statusLabels = {
    upcoming: { label: 'Em Breve', color: 'bg-blue-100 text-blue-700' },
    active: { label: 'Ativa', color: 'bg-green-100 text-green-700' },
    voting: { label: 'Votação', color: 'bg-purple-100 text-purple-700' },
    finished: { label: 'Encerrada', color: 'bg-gray-100 text-gray-700' },
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4">
          <Skeleton className="h-96 rounded-3xl mb-8" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full" />
        </div>
      </div>
    );
  }

  if (!competition) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Concurso não encontrado</h2>
          <Link to={createPageUrl('Competitions')}>
            <Button>Voltar para Concursos</Button>
          </Link>
        </div>
      </div>
    );
  }

  const status = statusLabels[competition.status] || statusLabels.active;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to={createPageUrl('Competitions')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Link>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-96 rounded-3xl overflow-hidden mb-8"
        >
          <img
            src={competition.cover_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200"}
            alt={competition.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          <div className="absolute bottom-8 left-8 right-8">
            <Badge className={`${status.color} mb-4`}>
              {status.label}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              {competition.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-white/90">
              <span className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-xl text-yellow-400">R$ {competition.prize_value?.toLocaleString()}</span>
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {format(new Date(competition.start_date), "d MMM", { locale: ptBR })} - {format(new Date(competition.end_date), "d MMM yyyy", { locale: ptBR })}
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {competition.participants_count || 0} participantes
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Theme */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Tema</h2>
              <div className="text-3xl font-bold ceu-text-gradient mb-4">
                {competition.theme}
              </div>
              <p className="text-gray-600 leading-relaxed">
                {competition.description}
              </p>
            </div>

            {/* Prize */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-8 border border-yellow-200">
              <div className="flex items-center gap-3 mb-4">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <h2 className="text-2xl font-bold text-gray-900">Prêmio</h2>
              </div>
              <p className="text-5xl font-bold text-yellow-600 mb-2">
                R$ {competition.prize_value?.toLocaleString()}
              </p>
              {competition.prize_description && (
                <p className="text-gray-600">{competition.prize_description}</p>
              )}
            </div>

            {/* Rules */}
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Regras</h2>
              <ul className="space-y-3 text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>O design deve seguir o tema do concurso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Você pode usar IA ou fazer upload da sua arte</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Cada artista pode enviar até 3 designs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>O vencedor será escolhido por votação da comunidade</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 mt-1">•</span>
                  <span>Resultados serão divulgados após o período de votação</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participate */}
            {competition.status === 'active' && <CompetitionUploadForm competition={competition} />}

            {/* Info */}
            <div className="bg-purple-50 rounded-3xl p-6 border border-purple-200">
              <h3 className="font-bold text-lg mb-4">Informações</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Status</p>
                  <Badge className={`${status.color} mt-1`}>{status.label}</Badge>
                </div>
                <div>
                  <p className="text-gray-500">Início</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(competition.start_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Término</p>
                  <p className="font-medium text-gray-900">
                    {format(new Date(competition.end_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Participantes</p>
                  <p className="font-medium text-gray-900">{competition.participants_count || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <CompetitionRanking competition={competition} />
      </div>
    </div>
  );
}