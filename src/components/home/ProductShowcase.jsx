import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const mockups = [
    {
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800",
      person: "Jovem Criativa",
      design: "Arte Urbana"
    },
    {
      image: "https://images.unsplash.com/photo-1558769132-cb1aea672c11?w=800",
      person: "Artista Digital",
      design: "Geometria Moderna"
    },
    {
      image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
      person: "Designer de Moda",
      design: "Natureza Abstrata"
    },
    {
      image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800",
      person: "Ilustrador",
      design: "Força Feminina"
    },
    {
      image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800",
      person: "Street Artist",
      design: "Cultura Pop"
    },
    {
      image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800",
      person: "Artista Visual",
      design: "Minimalismo"
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
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
            Vista a Arte
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            Suas Estampas em Pessoas Reais
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Cada camiseta conta uma história. Veja como suas artes ganham vida
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
                <div className={`relative rounded-3xl overflow-hidden shadow-2xl ${
                  index === 1 ? 'w-80 h-[500px]' : 'w-64 h-[400px]'
                }`}>
                  <img
                    src={mockup.image}
                    alt={mockup.person}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <p className="font-bold text-lg mb-1">{mockup.design}</p>
                    <p className="text-sm text-white/80">por {mockup.person}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + mockups.length) % mockups.length)}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all z-20"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % mockups.length)}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center hover:bg-gray-50 transition-all z-20"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {mockups.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex 
                    ? 'w-8 bg-purple-600' 
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}