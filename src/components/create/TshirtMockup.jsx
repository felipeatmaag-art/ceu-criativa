import React from 'react';
import { motion } from 'framer-motion';

export default function TshirtMockup({ designImage, color = 'white' }) {
  const colorMap = {
    white: '#FFFFFF',
    black: '#1a1a1a',
    navy: '#1e3a8a',
    gray: '#6b7280'
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
    >
      {/* Fundo com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 rounded-2xl" />
      
      {/* Sombra da camiseta */}
      <motion.div
        className="absolute w-72 h-96 rounded-3xl blur-3xl opacity-40"
        style={{ backgroundColor: colorMap[color] }}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Camiseta */}
      <motion.div
        className="relative z-10"
        animate={{ 
          y: [0, -10, 0],
          rotateY: [0, 5, 0]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Corpo da camiseta */}
        <div 
          className="relative w-64 h-80 rounded-t-[3rem] shadow-2xl"
          style={{ 
            backgroundColor: colorMap[color],
            boxShadow: `0 25px 50px -12px ${colorMap[color]}40`
          }}
        >
          {/* Gola */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-8 rounded-b-full"
            style={{ 
              backgroundColor: color === 'white' ? '#f0f0f0' : colorMap[color],
              filter: 'brightness(0.9)'
            }}
          />
          
          {/* Mangas */}
          <div 
            className="absolute -left-8 top-12 w-16 h-32 rounded-l-3xl"
            style={{ 
              backgroundColor: colorMap[color],
              filter: 'brightness(0.85)'
            }}
          />
          <div 
            className="absolute -right-8 top-12 w-16 h-32 rounded-r-3xl"
            style={{ 
              backgroundColor: colorMap[color],
              filter: 'brightness(0.85)'
            }}
          />

          {/* Design na camiseta */}
          <motion.div
            className="absolute top-20 left-1/2 -translate-x-1/2 w-48 h-48 flex items-center justify-center p-4"
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
          >
            <img
              src={designImage}
              alt="Design"
              className="w-full h-full object-contain drop-shadow-lg"
              style={{
                filter: color === 'black' ? 'brightness(1.2)' : 'none'
              }}
            />
          </motion.div>

          {/* Luz e reflexo */}
          <div 
            className="absolute inset-0 rounded-t-[3rem] opacity-20"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 50%)'
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}