import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Gift, Users, Share2, Trophy, Copy, Check, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';

export default function ReferralProgram() {
  const [copied, setCopied] = useState(false);
  const referralCode = "CEU2024";

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: loyaltyData } = useQuery({
    queryKey: ['loyalty', user?.email],
    queryFn: async () => {
      const records = await base44.entities.LoyaltyPoint.filter({ user_email: user.email });
      return records[0] || { points: 0, referrals_count: 0 };
    },
    enabled: !!user,
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rewards = [
    {
      icon: Sparkles,
      title: "+500 Pontos por Indicação",
      description: "Ganhe pontos cada vez que alguém se cadastrar com seu código",
      color: "from-emerald-500 to-green-600",
      points: 500
    },
    {
      icon: Gift,
      title: "Brindes Exclusivos",
      description: "Troque seus pontos por produtos oficiais da Céu",
      color: "from-pink-500 to-rose-600"
    },
    {
      icon: Trophy,
      title: "Recompensas Progressivas",
      description: "Quanto mais você indica, mais pontos você ganha",
      color: "from-yellow-500 to-orange-600"
    },
    {
      icon: Users,
      title: "Comunidade VIP",
      description: "Acesso exclusivo a eventos e lançamentos",
      color: "from-purple-500 to-indigo-600"
    }
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-white"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6">
              <Gift className="w-4 h-4" />
              Programa de Indicação
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-bold mb-6 leading-tight">
              Traga Amigos,
              <br />
              <span className="text-yellow-300">Ganhe Brindes</span>
            </h2>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Compartilhe a Céu com seus amigos artistas e ganhe <span className="text-emerald-400 font-bold">500 pontos</span> por cada indicação! 
              Troque seus pontos por brindes exclusivos.
            </p>

            {/* Points Stats */}
            {user && loyaltyData && (
              <div className="flex gap-4 mb-8">
                <div className="glass-card rounded-2xl p-4 flex-1">
                  <p className="text-emerald-400 text-3xl font-bold">{loyaltyData.points || 0}</p>
                  <p className="text-white/70 text-sm">Pontos Disponíveis</p>
                </div>
                <div className="glass-card rounded-2xl p-4 flex-1">
                  <p className="text-blue-400 text-3xl font-bold">{loyaltyData.referrals_count || 0}</p>
                  <p className="text-white/70 text-sm">Indicações Feitas</p>
                </div>
              </div>
            )}

            {/* Share Code */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8">
              <p className="text-white/80 text-sm mb-3">Seu código de indicação:</p>
              <div className="flex gap-3">
                <Input
                  value={referralCode}
                  readOnly
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/60 h-12 text-lg font-mono"
                />
                <Button
                  onClick={handleCopy}
                  className="bg-white text-purple-900 hover:bg-gray-100 h-12 px-6 rounded-xl"
                >
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            {/* Share Button */}
            <div className="flex gap-4">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 hover:from-yellow-500 hover:to-orange-600 rounded-2xl px-8 h-14 text-lg font-semibold hover-glow"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Compartilhar Agora
              </Button>
              <Link to={createPageUrl('Brindes')}>
                <Button 
                  size="lg"
                  variant="outline"
                  className="glass-card border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-2xl px-8 h-14 text-lg font-semibold hover-glow"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Ver Brindes
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Right Content - Rewards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            {rewards.map((reward, index) => {
              const Icon = reward.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/20 transition-all hover-glow">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${reward.color} flex items-center justify-center shrink-0 shadow-lg`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-white flex-1">
                          <h3 className="font-bold text-lg mb-1">{reward.title}</h3>
                          <p className="text-white/80 text-sm">{reward.description}</p>
                        </div>
                        {reward.points && (
                          <div className="text-emerald-400 font-bold text-xl">
                            +{reward.points}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}

            {/* Stats */}
            <Card className="bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border-white/30">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4 text-center text-white">
                  <div>
                    <p className="text-3xl font-bold mb-1">1K+</p>
                    <p className="text-xs text-white/80">Artistas Indicados</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold mb-1">500+</p>
                    <p className="text-xs text-white/80">Brindes Entregues</p>
                  </div>
                  <div>
                    <p className="text-3xl font-bold mb-1">R$ 50K</p>
                    <p className="text-xs text-white/80">Em Descontos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}