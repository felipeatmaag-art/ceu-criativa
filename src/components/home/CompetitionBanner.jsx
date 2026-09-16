import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Trophy, Clock, Users, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { differenceInDays } from 'date-fns';

export default function CompetitionBanner({ competition }) {
  if (!competition) return null;

  const daysLeft = differenceInDays(new Date(competition.end_date), new Date());

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-[#1A1A2E] via-[#16213E] to-[#0F3460]"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          {/* Glowing Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-[120px] opacity-30" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-500 rounded-full filter blur-[120px] opacity-20" />

          <div className="relative grid lg:grid-cols-2 gap-8 p-8 lg:p-16 items-center">
            {/* Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400/20 text-yellow-400 text-sm font-medium mb-6">
                <Trophy className="w-4 h-4" />
                Competição Ativa
              </div>
              
              <h2 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
                {competition.title}
              </h2>
              
              <p className="text-lg text-gray-300 mb-8 max-w-lg">
                {competition.description || `Participe da nossa competição temática "${competition.theme}" e concorra a prêmios incríveis!`}
              </p>

              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Prêmio</p>
                    <p className="font-bold">R$ {competition.prize_value?.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Tempo restante</p>
                    <p className="font-bold">{daysLeft > 0 ? `${daysLeft} dias` : 'Último dia!'}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Participantes</p>
                    <p className="font-bold">{competition.participants_count || 0}</p>
                  </div>
                </div>
              </div>

              <Link to={createPageUrl(`CompetitionDetail?id=${competition.id}`)}>
                <Button 
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100 rounded-2xl px-8 h-14 text-lg"
                >
                  Participar Agora
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Image */}
            <div className="relative hidden lg:block">
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="relative"
              >
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/20">
                  <img
                    src={competition.cover_image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600"}
                    alt={competition.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Floating Badge */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🏆</span>
                    <div>
                      <p className="text-sm text-gray-500">Tema</p>
                      <p className="font-bold text-gray-900">{competition.theme}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}