import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompetitionLeaderboardSection from '@/components/competitions/CompetitionLeaderboardSection';

export default function Competitions() {
  const { data: competitions = [], isLoading } = useQuery({
    queryKey: ['competitions'],
    queryFn: () => base44.entities.Competition.list('-created_date', 20),
  });

  const activeCompetitions = competitions.filter(c => c.status === 'active' || c.status === 'voting');
  const upcomingCompetitions = competitions.filter(c => c.status === 'upcoming');
  const finishedCompetitions = competitions.filter(c => c.status === 'finished');
  const rankedCompetition = activeCompetitions.find(c => c.status === 'voting') || activeCompetitions[0] || finishedCompetitions[0];

  const CompetitionCard = ({ competition, index }) => {
    const daysLeft = differenceInDays(new Date(competition.end_date), new Date());
    const statusLabels = {
      upcoming: { label: 'Em Breve', color: 'bg-blue-100 text-blue-700' },
      active: { label: 'Ativa', color: 'bg-green-100 text-green-700' },
      voting: { label: 'Votação', color: 'bg-purple-100 text-purple-700' },
      finished: { label: 'Encerrada', color: 'bg-gray-100 text-gray-700' },
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        <Link to={createPageUrl(`CompetitionDetail?id=${competition.id}`)}>
          <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2">
            {/* Image */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={competition.cover_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"}
                alt={competition.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              
              {/* Status Badge */}
              <Badge className={`absolute top-4 left-4 ${statusLabels[competition.status]?.color}`}>
                {statusLabels[competition.status]?.label}
              </Badge>

              {/* Prize */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-2 text-white">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="font-bold text-lg">R$ {competition.prize_value?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                {competition.title}
              </h3>
              <p className="text-gray-500 mb-4 line-clamp-2">
                {competition.description || `Tema: ${competition.theme}`}
              </p>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {format(new Date(competition.start_date), "d MMM", { locale: ptBR })} - {format(new Date(competition.end_date), "d MMM", { locale: ptBR })}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {competition.participants_count || 0}
                </span>
              </div>

              {competition.status === 'active' && daysLeft > 0 && (
                <div className="flex items-center gap-2 text-purple-600 font-medium">
                  <Clock className="w-4 h-4" />
                  {daysLeft} dias restantes
                </div>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium mb-4">
            <Trophy className="w-4 h-4" />
            Concursos
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Mostre seu Talento
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Participe dos nossos concursos temáticos e concorra a prêmios incríveis
          </p>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm">
                <Skeleton className="h-56" />
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : competitions.length > 0 ? (
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="w-full max-w-md mx-auto grid grid-cols-3 h-12 rounded-xl bg-gray-100 p-1 mb-8">
              <TabsTrigger value="active" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
                Ativas ({activeCompetitions.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
                Em Breve ({upcomingCompetitions.length})
              </TabsTrigger>
              <TabsTrigger value="finished" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
                Encerradas ({finishedCompetitions.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active">
              {activeCompetitions.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeCompetitions.map((comp, i) => (
                    <CompetitionCard key={comp.id} competition={comp} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState message="Nenhum concurso ativo no momento" />
              )}
            </TabsContent>

            <TabsContent value="upcoming">
              {upcomingCompetitions.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingCompetitions.map((comp, i) => (
                    <CompetitionCard key={comp.id} competition={comp} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState message="Novos concursos em breve!" />
              )}
            </TabsContent>

            <TabsContent value="finished">
              {finishedCompetitions.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {finishedCompetitions.map((comp, i) => (
                    <CompetitionCard key={comp.id} competition={comp} index={i} />
                  ))}
                </div>
              ) : (
                <EmptyState message="Nenhum concurso encerrado ainda" />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <EmptyState message="Nenhum concurso disponível" />
        )}
        {!isLoading && <CompetitionLeaderboardSection competition={rankedCompetition} />}
      </div>
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20"
    >
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-yellow-100 flex items-center justify-center">
        <Trophy className="w-12 h-12 text-yellow-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {message}
      </h3>
      <p className="text-gray-500">
        Fique ligado para os próximos concursos!
      </p>
    </motion.div>
  );
}