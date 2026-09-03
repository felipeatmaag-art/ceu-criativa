import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import HeroCarousel from '@/components/home/HeroCarousel';
import ProductShowcase from '@/components/home/ProductShowcase';
import BentoShowcase from '@/components/home/BentoShowcase';
import FeaturedDesigns from '@/components/home/FeaturedDesigns';
import CommissionHighlight from '@/components/home/CommissionHighlight';
import HowItWorks from '@/components/home/HowItWorks';
import CreationStudio from '@/components/home/CreationStudio';
import HumanScenes from '@/components/home/HumanScenes';
import KioskExperience from '@/components/home/KioskExperience';
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
      title: "Criação",
      description: "Crie com IA ou envie sua própria arte, sempre com controle autoral"
    },
    {
      icon: Users,
      title: "Comunidade",
      description: "Conecte-se, compartilhe processos e cresça junto com outros artistas"
    },
    {
      icon: TrendingUp,
      title: "Monetização",
      description: "Venda sem estoque e receba com transparência por cada criação"
    },
    {
      icon: Shield,
      title: "Materialização",
      description: "Produção sob demanda com qualidade, cuidado e menos desperdício"
    }
  ];

  return (
    <div className="bg-ceu-cloud text-ceu-navy">
      <HeroCarousel />

      <div className="bg-ceu-navy">
        <ProductShowcase />
        <BentoShowcase />
      </div>
      
      <FeaturedDesigns 
        designs={designs} 
        title="Estampas em Destaque"
        subtitle="Descubra os designs mais amados pela comunidade"
      />
      
      <CommissionHighlight />
      
      <ArtistSpotlight />
      
      <HowItWorks />

      <CreationStudio />

      <HumanScenes />

      <KioskExperience />
      
      {activeCompetition && <CompetitionBanner competition={activeCompetition} />}
      
      <ReferralProgram />
      
      <Testimonials />

      {/* Features Section */}
      <section className="py-24 bg-ceu-cloud">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-block rounded-full bg-ceu-sky/30 px-4 py-2 text-sm font-bold text-ceu-navy mb-5">Nosso ecossistema</span>
            <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-ceu-navy mb-4">
              Tudo começa com você.
            </h2>
            <p className="text-xl text-ceu-navy/65 max-w-2xl mx-auto">
              Da primeira ideia ao produto na rua, a Céu conecta criação, comunidade, renda e produção.
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
                  className="text-left group rounded-[2rem] bg-white p-7 border border-ceu-sky/25 shadow-sm"
                >
                  <div className="w-14 h-14 mb-6 rounded-2xl bg-ceu-navy flex items-center justify-center group-hover:bg-ceu-aqua transition-colors duration-300">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-ceu-navy mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-ceu-navy/60 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-ceu-navy relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://media.base44.com/images/public/69431e0c00397efc6e14e9df/9e5688f28_Metallic_logo_floating_in_sunset_2026081722471.jpeg"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-ceu-cloud/25" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight text-ceu-navy mb-6">
              O próximo produto autoral pode ser seu.
            </h2>
            <p className="text-xl text-ceu-navy/70 mb-10 max-w-2xl mx-auto">
              Crie, visualize e publique sua arte em poucos cliques. A Céu cuida do caminho até a entrega.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to={createPageUrl('Create')}>
                <Button 
                  size="lg"
                  className="bg-ceu-navy text-white hover:bg-ceu-navy/90 rounded-full px-10 h-14 text-lg font-semibold"
                >
                  Começar Agora
                </Button>
              </Link>
              <Link to={createPageUrl('Explore')}>
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-ceu-navy text-ceu-navy hover:bg-white/20 rounded-full px-10 h-14 text-lg font-semibold"
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