import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Sparkles, Trophy, Palette, Gift, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "Você é a Peça Fundamental",
      subtitle: "Sua arte, sua história, sua marca",
      description: "Transforme sua criatividade em renda. Cada estampa que você cria conecta com milhares de pessoas.",
      cta: "Começar Agora",
      ctaLink: "Create",
      icon: Palette,
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      gradient: "from-purple-600 via-pink-600 to-red-600"
    },
    {
      title: "Faça sua Camiseta com IA",
      subtitle: "Tecnologia + Criatividade = Seu Sucesso",
      description: "Use inteligência artificial para criar designs únicos em minutos. Ou envie suas próprias artes.",
      cta: "Criar com IA",
      ctaLink: "Create",
      icon: Sparkles,
      image: "https://images.unsplash.com/photo-1558769132-cb1aea672c11?w=800",
      gradient: "from-blue-600 via-purple-600 to-pink-600"
    },
    {
      title: "Participe de Concursos",
      subtitle: "Mostre seu talento e ganhe prêmios",
      description: "Competições com prêmios em dinheiro, destaque na plataforma e reconhecimento da comunidade.",
      cta: "Ver Competições",
      ctaLink: "Competitions",
      icon: Trophy,
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
      gradient: "from-yellow-600 via-orange-600 to-red-600"
    },
    {
      title: "Comissão Generosa",
      subtitle: "30% em cada venda é seu",
      description: "Sem taxas escondidas. Artistas merecem ser valorizados. Ganhe de verdade com sua arte.",
      cta: "Saiba Mais",
      ctaLink: "Create",
      icon: Gift,
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800",
      gradient: "from-green-600 via-emerald-600 to-teal-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={slides[currentSlide].image}
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].gradient} opacity-80`} />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
              className="text-white"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium mb-6">
                {React.createElement(slides[currentSlide].icon, { className: "w-4 h-4" })}
                {slides[currentSlide].subtitle}
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
                {slides[currentSlide].title}
              </h1>
              
              <p className="text-xl text-white/90 mb-8 max-w-lg leading-relaxed">
                {slides[currentSlide].description}
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to={createPageUrl(slides[currentSlide].ctaLink)}>
                  <Button 
                    size="lg" 
                    className="bg-white text-gray-900 hover:bg-gray-100 rounded-2xl px-8 h-14 text-lg font-semibold shadow-xl"
                  >
                    {slides[currentSlide].cta}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
              className="relative hidden lg:block"
            >
              <div className="relative aspect-square max-w-lg mx-auto">
                <div className="absolute inset-0 bg-white/20 backdrop-blur-xl rounded-[3rem] shadow-2xl" />
                <img
                  src={slides[currentSlide].image}
                  alt={slides[currentSlide].title}
                  className="relative w-full h-full object-cover rounded-[3rem] shadow-2xl"
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-12">
          <button
            onClick={prevSlide}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center text-white transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div className="flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide 
                    ? 'w-8 bg-white' 
                    : 'w-2 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextSlide}
            className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center text-white transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
}