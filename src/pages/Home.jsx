import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HeroCarousel from '@/components/home/HeroCarousel';
import ProductShowcase from '@/components/home/ProductShowcase';
import BentoShowcase from '@/components/home/BentoShowcase';
import FeaturedDesigns from '@/components/home/FeaturedDesigns';
import CommissionHighlight from '@/components/home/CommissionHighlight';
import HowItWorks from '@/components/home/HowItWorks';
import CompetitionBanner from '@/components/home/CompetitionBanner';
import ReferralProgram from '@/components/home/ReferralProgram';
import Testimonials from '@/components/home/Testimonials';
import ArtistSpotlight from '@/components/home/ArtistSpotlight';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Palette, Users, TrendingUp, Shield } from 'lucide-react';

export default function Home() {
  const { data: designs = [] } = useQuery({
    queryKey: ['featured-designs'],
    queryFn: () => base44.entities.Design.filter({ is_featured: true, status: 'aprovado' }, '-created_date', 8),
  });

  const { data: competitions = [] } = useQuery({
    queryKey: ['active-competitions'],
    queryFn: () => base44.entities.Competition.filter({ status: 'active' }, '-created_date', 1),
  });

  const activeCompetition = competitions[0];

  const features = [
    {
      icon: Palette,
      title: "IA Criativa",
      description: "Gere estampas únicas com inteligência artificial de ponta"
    },
    {
      icon: Users,
      title: "Comunidade",
      description: "Conecte-se com artistas e amantes de arte do mundo todo"
    },
    {
      icon: TrendingUp,
      title: "Comissões Justas",
      description: "Ganhe até 30% de comissão em cada venda dos seus designs"
    },
    {
      icon: Shield,
      title: "Qualidade Premium",
      description: "Produtos de alta qualidade impressos sob demanda"
    }
  ];

  return (
    <div>
      <HeroCarousel />
      
      <ProductShowcase />
      
      <BentoShowcase />
      
      <FeaturedDesigns 
        designs={designs} 
        title="Estampas em Destaque"
        subtitle="Descubra os designs mais amados pela comunidade"
      />
      
      <CommissionHighlight />
      
      <ArtistSpotlight />
      
      <HowItWorks />
      
      {activeCompetition && <CompetitionBanner competition={activeCompetition} />}
      
      <ReferralProgram />
      
      <Testimonials />

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
              Por que escolher a <span className="ceu-text-gradient">Céu</span>?
            </h2>
            <p className="text-xl text-gray-500 max-w-2xl mx-auto">
              Uma plataforma criada por artistas, para artistas
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center group"
                >
                  <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Pronto para criar?
            </h2>
            <p className="text-xl text-purple-100 mb-10 max-w-2xl mx-auto">
              Junte-se a milhares de artistas que já estão ganhando dinheiro com suas criações
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={createPageUrl('Create')}>
                <Button 
                  size="lg"
                  className="bg-white text-purple-700 hover:bg-gray-100 rounded-2xl px-10 h-14 text-lg font-semibold"
                >
                  Começar Agora
                </Button>
              </Link>
              <Link to={createPageUrl('Explore')}>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white/10 rounded-2xl px-10 h-14 text-lg font-semibold"
                >
                  Explorar Estampas
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}