import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ChevronLeft, ChevronRight, Gift, Palette, Sparkles, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';

const SLIDES = [
  {
    eyebrow: 'Criar × Materializar',
    title: 'Sua ideia vira matéria.',
    description: 'Crie uma estampa autoral, visualize o resultado e transforme sua arte em uma peça real — tudo em poucos cliques.',
    cta: 'Criar minha estampa',
    ctaLink: 'Create',
    icon: Palette,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200',
    accent: 'bg-ceu-sun',
  },
  {
    eyebrow: 'Tecnologia com propósito',
    title: 'IA com alma autoral.',
    description: 'Use inteligência artificial como ferramenta criativa ou envie sua própria arte. O controle continua sendo seu.',
    cta: 'Criar com IA',
    ctaLink: 'Create',
    icon: Sparkles,
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea672c11?w=1200',
    accent: 'bg-ceu-aqua',
  },
  {
    eyebrow: 'Comunidade Céu',
    title: 'Criar junto leva mais longe.',
    description: 'Compartilhe processos, participe de concursos e encontre uma comunidade que valoriza a expressão de cada artista.',
    cta: 'Ver competições',
    ctaLink: 'Competitions',
    icon: Trophy,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200',
    accent: 'bg-ceu-coral',
  },
  {
    eyebrow: 'Comércio justo',
    title: 'Sua arte também é renda.',
    description: 'Venda produtos sem estoque e acompanhe seus resultados com transparência. A produção e a entrega ficam com a Céu.',
    cta: 'Começar agora',
    ctaLink: 'Create',
    icon: Gift,
    image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200',
    accent: 'bg-ceu-sun',
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((slide) => (slide + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;
  const changeSlide = (direction) => setCurrentSlide((currentSlide + direction + SLIDES.length) % SLIDES.length);

  return (
    <section className="relative overflow-hidden bg-ceu-cloud py-12 sm:py-16 lg:py-20">
      <div className="absolute -left-24 top-8 h-72 w-72 rounded-full border-[42px] border-ceu-sky/20" />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={`copy-${currentSlide}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45 }}
            className="relative z-10"
          >
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-ceu-sky/40 bg-white/80 px-4 py-2 text-sm font-semibold text-ceu-navy shadow-sm backdrop-blur">
              <Icon className="h-4 w-4 text-ceu-aqua" />
              {slide.eyebrow}
            </div>
            <h1 className="max-w-2xl text-5xl font-black leading-[0.98] tracking-[-0.04em] text-ceu-navy sm:text-6xl lg:text-7xl">
              {slide.title}
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-relaxed text-ceu-navy/70 sm:text-xl">
              {slide.description}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link to={createPageUrl(slide.ctaLink)}>
                <Button size="lg" className="h-14 rounded-full bg-ceu-navy px-7 text-base text-white shadow-xl shadow-ceu-navy/15 hover:bg-ceu-aqua">
                  {slide.cta}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to={createPageUrl('Explore')} className="text-sm font-bold text-ceu-navy underline decoration-ceu-sun decoration-4 underline-offset-8">
                Explorar a comunidade
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={`image-${currentSlide}`}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.55 }}
            className="relative"
          >
            <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full ${slide.accent}`} />
            <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full border-[20px] border-ceu-aqua" />
            <div className="relative overflow-hidden rounded-[2.5rem] bg-ceu-navy p-2 shadow-2xl shadow-ceu-navy/20 sm:rounded-[4rem]">
              <div className="relative aspect-[5/4] overflow-hidden rounded-[2rem] sm:rounded-[3.5rem]">
                <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-ceu-navy/80 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white sm:bottom-8 sm:left-8 sm:right-8">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-ceu-sky">Céu Criativa</p>
                    <p className="mt-1 text-xl font-semibold">Você também vai.</p>
                  </div>
                  <span className="rounded-full bg-white/15 px-4 py-2 text-xs backdrop-blur">Autoral por essência</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative mx-auto mt-10 flex max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <button aria-label="Slide anterior" onClick={() => changeSlide(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-ceu-navy/15 text-ceu-navy hover:bg-white">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="flex flex-1 gap-2">
          {SLIDES.map((item, index) => (
            <button key={item.title} aria-label={`Ir para slide ${index + 1}`} onClick={() => setCurrentSlide(index)} className={`h-1.5 rounded-full transition-all ${index === currentSlide ? 'w-14 bg-ceu-aqua' : 'w-5 bg-ceu-navy/15'}`} />
          ))}
        </div>
        <button aria-label="Próximo slide" onClick={() => changeSlide(1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-ceu-navy text-white hover:bg-ceu-aqua">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}