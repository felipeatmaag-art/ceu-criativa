import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const mockups = [
    {
      image: "https://media.base44.com/images/public/69431e0c00397efc6e14e9df/6c96fe84d_generated_image.png",
      person: "Pedro Martins",
      design: "Ilustrador digital"
    },
    {
      image: "https://media.base44.com/images/public/69431e0c00397efc6e14e9df/c06b9e096_generated_image.png",
      person: "Helena Costa",
      design: "Artista têxtil"
    },
    {
      image: "https://media.base44.com/images/public/69431e0c00397efc6e14e9df/8cf1d4a39_generated_image.png",
      person: "José Andrade",
      design: "Tatuador e desenhista"
    },
    {
      image: "https://media.base44.com/images/public/69431e0c00397efc6e14e9df/36e125828_generated_image.png",
      person: "Marina Alves",
      design: "Designer de estampas"
    },
    {
      image: "https://media.base44.com/images/public/69431e0c00397efc6e14e9df/a727149e8_generated_image.png",
      person: "Camila Rocha",
      design: "Artista visual"
    },
    {
      image: "https://media.base44.com/images/public/69431e0c00397efc6e14e9df/7a5d3a418_generated_image.png",
      person: "Rafael Nunes",
      design: "Serigrafista"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockups.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [mockups.length]);

  const visibleMockups = [
    mockups[(currentIndex - 1 + mockups.length) % mockups.length],
    mockups[currentIndex],
    mockups[(currentIndex + 1) % mockups.length]
  ];

  return (
    <section className="py-24 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full glass-card text-emerald-400 text-sm font-medium mb-4 hover-glow">
            Talentos Céu
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4">
            Artistas da Comunidade
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Pessoas criativas que transformam experiências, traços e ideias em arte
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative">
          <div className="flex items-center justify-center gap-4 lg:gap-8">
            {visibleMockups.map((mockup, index) => (
              <motion.div
                key={`${currentIndex}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: index === 1 ? 1 : 0.4,
                  scale: index === 1 ? 1 : 0.85,
                  y: index === 1 ? 0 : 20
                }}
                transition={{ duration: 0.5 }}
                className={`relative ${
                  index === 1 ? 'z-10' : 'z-0 hidden lg:block'
                }`}
              >
                <div className={`relative rounded-3xl overflow-hidden glass-card hover-glow ${
                  index === 1 ? 'w-80 h-[500px]' : 'w-64 h-[400px]'
                }`}>
                  <img
                    src={mockup.image}
                    alt={mockup.person}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="font-bold text-xl mb-1 text-white">{mockup.person}</p>
                    <p className="text-sm font-medium text-emerald-400">{mockup.design}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            aria-label="Artista anterior"
            onClick={() => setCurrentIndex((prev) => (prev - 1 + mockups.length) % mockups.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-card hover-glow flex items-center justify-center transition-all z-20"
          >
            <ChevronLeft className="w-6 h-6 text-emerald-400" />
          </button>
          <button
            aria-label="Próximo artista"
            onClick={() => setCurrentIndex((prev) => (prev + 1) % mockups.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full glass-card hover-glow flex items-center justify-center transition-all z-20"
          >
            <ChevronRight className="w-6 h-6 text-emerald-400" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {mockups.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'w-8 bg-emerald-500 shadow-lg shadow-emerald-500/50' 
                    : 'w-2 bg-gray-600 hover:bg-emerald-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}