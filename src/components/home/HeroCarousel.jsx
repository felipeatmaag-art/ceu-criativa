import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
    image: 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/d745a5f29_Clothing_warehouse_and_modern_fa_2026081520441-Copia.jpeg',
  },
  {
    eyebrow: 'Tecnologia com propósito',
    title: 'IA com alma autoral.',
    description: 'Use inteligência artificial como ferramenta criativa ou envie sua própria arte. O controle continua sendo seu.',
    cta: 'Criar com IA',
    ctaLink: 'Create',
    icon: Sparkles,
    image: 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/3622ebebb_AI_creation_studio_mockups_2K_20260814131222.jpeg',
  },
  {
    eyebrow: 'Comunidade Céu',
    title: 'Criar junto leva mais longe.',
    description: 'Compartilhe processos, participe de concursos e encontre uma comunidade que valoriza a expressão de cada artista.',
    cta: 'Ver competições',
    ctaLink: 'Competitions',
    icon: Trophy,
    image: 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/029ad947b_Artisans_personalizing_customize_202608181036.jpeg',
  },
  {
    eyebrow: 'Comércio justo',
    title: 'Sua arte também é renda.',
    description: 'Venda produtos sem estoque e acompanhe seus resultados com transparência. A produção e a entrega ficam com a Céu.',
    cta: 'Começar agora',
    ctaLink: 'Create',
    icon: Gift,
    image: 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/864130525_Man_smiling_at_smartphone_screen_202608171950jpeg_202608172008-Copia.jpeg',
  },
];

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '22%']);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '38%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((slide) => (slide + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;
  const changeSlide = (direction) => setCurrentSlide((currentSlide + direction + SLIDES.length) % SLIDES.length);

  return (
    <section ref={heroRef} className="relative min-h-[640px] h-[calc(100svh-5rem)] overflow-hidden bg-ceu-navy text-white">
      <motion.div style={{ y: backgroundY }} className="absolute -inset-y-[12%] inset-x-0">
        <AnimatePresence mode="sync">
          <motion.img
            key={slide.image}
            src={slide.image}
            alt=""
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-r from-ceu-navy via-ceu-navy/65 to-ceu-navy/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-ceu-navy/80 via-transparent to-ceu-navy/20" />

      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-5 py-16 sm:px-8 lg:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.55 }}
            className="max-w-3xl"
          >
            <div className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.18em] text-ceu-sky">
              <Icon className="h-4 w-4" />
              {slide.eyebrow}
            </div>
            <h1 className="text-5xl font-black leading-[0.92] tracking-[-0.05em] text-white sm:text-6xl lg:text-8xl">
              {slide.title}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl lg:text-2xl">
              {slide.description}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <Link to={createPageUrl(slide.ctaLink)}>
                <Button size="lg" className="h-14 rounded-full bg-ceu-aqua px-8 text-base font-bold text-ceu-navy shadow-xl hover:bg-ceu-sky">
                  {slide.cta}<ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to={createPageUrl('Explore')} className="text-sm font-bold text-white underline decoration-ceu-sun decoration-4 underline-offset-8">
                Explorar a comunidade
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      <div className="absolute bottom-7 left-5 right-5 z-20 mx-auto flex max-w-7xl items-center justify-between gap-5 sm:bottom-9 sm:left-8 sm:right-8 lg:left-10 lg:right-10">
        <div className="flex items-center gap-2">
          {SLIDES.map((item, index) => (
            <button key={item.title} aria-label={`Ir para slide ${index + 1}`} onClick={() => setCurrentSlide(index)} className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-14 bg-ceu-aqua' : 'w-5 bg-white/40'}`} />
          ))}
        </div>
        <div className="flex gap-2">
          <button aria-label="Slide anterior" onClick={() => changeSlide(-1)} className="flex h-11 w-11 items-center justify-center rounded-full border border-white/30 bg-ceu-navy/25 text-white backdrop-blur hover:bg-white/15"><ChevronLeft className="h-5 w-5" /></button>
          <button aria-label="Próximo slide" onClick={() => changeSlide(1)} className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-ceu-navy hover:bg-ceu-sky"><ChevronRight className="h-5 w-5" /></button>
        </div>
      </div>
    </section>
  );
}