import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Gift,
  Palette,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { createPageUrl } from '@/utils';

const SLIDES = [
  {
    eyebrow: 'Criar × Materializar',
    title: 'Sua ideia vira matéria.',
    description: 'Crie uma estampa autoral, visualize o resultado e transforme sua arte em uma peça real — tudo em poucos cliques.',
    icon: Palette,
    image: 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/d745a5f29_Clothing_warehouse_and_modern_fa_2026081520441-Copia.jpeg',
  },
  {
    eyebrow: 'Tecnologia com propósito',
    title: 'IA com alma autoral.',
    description: 'Use inteligência artificial como ferramenta criativa ou envie sua própria arte. O controle continua sendo seu.',
    icon: Sparkles,
    image: 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/3622ebebb_AI_creation_studio_mockups_2K_20260814131222.jpeg',
  },
  {
    eyebrow: 'Comunidade Céu',
    title: 'Criar junto leva mais longe.',
    description: 'Compartilhe processos, participe de concursos e encontre uma comunidade que valoriza a expressão de cada artista.',
    icon: Trophy,
    image: 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/029ad947b_Artisans_personalizing_customize_202608181036.jpeg',
  },
  {
    eyebrow: 'Comércio justo',
    title: 'Sua arte também é renda.',
    description: 'Venda produtos sem estoque e acompanhe seus resultados com transparência. A produção e a entrega ficam com a Céu.',
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
    const timer = setInterval(() => setCurrentSlide((slide) => (slide + 1) % SLIDES.length), 7000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;
  const changeSlide = (direction) => setCurrentSlide((currentSlide + direction + SLIDES.length) % SLIDES.length);

  return (
    <section ref={heroRef} className="relative min-h-[580px] lg:min-h-[660px] h-auto lg:h-[calc(100svh-4.5rem)] overflow-hidden bg-ceu-navy text-white flex flex-col justify-between">
      {/* Background Image Carousel with Parallax */}
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

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-ceu-navy via-ceu-navy/75 to-ceu-navy/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-ceu-navy/95 via-transparent to-ceu-navy/40" />

      {/* Hero Content */}
      <motion.div style={{ y: contentY, opacity: contentOpacity }} className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col justify-center px-5 pt-16 pb-20 sm:px-8 lg:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.55 }}
            className="max-w-4xl"
          >
            <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-[0.18em] text-ceu-sky">
              <Icon className="h-4 w-4" />
              {slide.eyebrow}
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.94] tracking-[-0.05em] text-white">
              {slide.title}
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-xl lg:text-2xl leading-relaxed text-white/85">
              {slide.description}
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to={createPageUrl('Create')}
                className="group inline-flex items-center gap-2 rounded-full bg-ceu-aqua px-8 py-4 text-base font-bold text-ceu-navy shadow-lg transition-all hover:bg-ceu-sky hover:shadow-ceu-aqua/25"
              >
                Começar a criar
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to={createPageUrl('Explore')}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-8 py-4 text-base font-bold text-white backdrop-blur transition-all hover:bg-white/20"
              >
                Explorar catálogo
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Slider Controls */}
      <div className="relative z-20 mx-auto w-full max-w-7xl px-5 pb-6 sm:px-8 lg:px-10 flex items-center justify-between gap-5">
        <div className="flex items-center gap-2">
          {SLIDES.map((item, index) => (
            <button
              key={item.title}
              aria-label={`Ir para slide ${index + 1}`}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-14 bg-ceu-aqua' : 'w-5 bg-white/40'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <button
            aria-label="Slide anterior"
            onClick={() => changeSlide(-1)}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/30 bg-ceu-navy/25 text-white backdrop-blur hover:bg-white/15 cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            aria-label="Próximo slide"
            onClick={() => changeSlide(1)}
            className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-white text-ceu-navy hover:bg-ceu-sky cursor-pointer"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
