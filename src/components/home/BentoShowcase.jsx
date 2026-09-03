import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Trophy, TrendingUp, Zap, Heart } from 'lucide-react';

export default function BentoShowcase() {
  const bentoItems = [
    {
      span: 'bento-span-6',
      row: 'bento-row-2',
      title: 'Criatividade sem Limites',
      description: 'Use IA ou faça upload das suas próprias artes. Você decide como criar.',
      icon: Sparkles,
      gradient: 'from-emerald-500 to-blue-500',
      image: 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/4791d6c1f_Dashboard_app_showing_earnings_g_202608161225-Copia.jpeg'
    },
    {
      span: 'bento-span-6',
      title: 'Comunidade de 50K+ Artistas',
      description: 'Junte-se a uma comunidade vibrante de criadores de todo o Brasil.',
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
      stat: '50K+',
      statLabel: 'Artistas Ativos'
    },
    {
      span: 'bento-span-4',
      title: 'Competições Mensais',
      description: 'Ganhe prêmios e reconhecimento.',
      icon: Trophy,
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      span: 'bento-span-4',
      title: 'Vendas em Alta',
      description: 'R$ 2M vendidos este ano.',
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      span: 'bento-span-4',
      title: 'Entregas Rápidas',
      description: 'Produção e envio em até 5 dias.',
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <section className="py-24 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Tudo que Você Precisa em um Só Lugar
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Ferramentas poderosas para transformar sua criatividade em negócio
          </p>
        </motion.div>

        <div className="bento-grid">
          {bentoItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${item.span} ${item.row || ''} glass-card rounded-3xl p-6 lg:p-8 hover-glow group cursor-pointer relative overflow-hidden`}
              >
                {/* Background Image if exists */}
                {item.image && (
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed mb-4">
                    {item.description}
                  </p>

                  {item.stat && (
                    <div className="mt-6">
                      <p className="text-5xl font-bold ceu-text-gradient">
                        {item.stat}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">{item.statLabel}</p>
                    </div>
                  )}
                </div>

                {/* Hover Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}