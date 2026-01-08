import React from 'react';
import { motion } from 'framer-motion';

export default function TshirtMockup({ designImage, color = 'white' }) {
  const colorMap = {
    white: { bg: '#FFFFFF', sleeve: '#f5f5f5', shadow: 'rgba(0,0,0,0.08)', collar: '#e8e8e8' },
    black: { bg: '#1a1a1a', sleeve: '#0d0d0d', shadow: 'rgba(0,0,0,0.3)', collar: '#2a2a2a' },
    navy: { bg: '#1e3a8a', sleeve: '#162d6d', shadow: 'rgba(30,58,138,0.3)', collar: '#2747a0' },
    gray: { bg: '#6b7280', sleeve: '#4b5563', shadow: 'rgba(107,114,128,0.3)', collar: '#7c8694' }
  };

  const currentColor = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl"
    >
      {/* Background estúdio clean */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-white" />
      
      {/* Luz suave de estúdio */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.9) 0%, transparent 60%)'
        }}
      />

      {/* Container da camiseta */}
      <motion.div
        className="relative z-10"
        animate={{ 
          y: [0, -6, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        style={{ 
          filter: 'drop-shadow(0 25px 50px rgba(0,0,0,0.15))'
        }}
      >
        {/* SVG Camiseta Realista */}
        <svg 
          width="320" 
          height="380" 
          viewBox="0 0 320 380" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Definições de gradientes e filtros */}
          <defs>
            {/* Gradiente corpo principal */}
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentColor.bg} />
              <stop offset="50%" stopColor={currentColor.bg} />
              <stop offset="100%" stopColor={currentColor.sleeve} />
            </linearGradient>
            
            {/* Gradiente manga esquerda */}
            <linearGradient id="leftSleeveGradient" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={currentColor.bg} />
              <stop offset="100%" stopColor={currentColor.sleeve} />
            </linearGradient>
            
            {/* Gradiente manga direita */}
            <linearGradient id="rightSleeveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentColor.bg} />
              <stop offset="100%" stopColor={currentColor.sleeve} />
            </linearGradient>

            {/* Filtro de sombra interna */}
            <filter id="innerShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.1"/>
            </filter>

            {/* Padrão de textura de tecido */}
            <pattern id="fabricTexture" patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill="transparent"/>
              <rect width="1" height="1" fill="rgba(0,0,0,0.02)"/>
              <rect x="2" y="2" width="1" height="1" fill="rgba(255,255,255,0.02)"/>
            </pattern>
          </defs>

          {/* Manga Esquerda */}
          <path
            d="M 30 70 
               C 10 80, 5 100, 10 140 
               L 25 150 
               C 35 145, 45 130, 55 90 
               L 60 70 
               Z"
            fill="url(#leftSleeveGradient)"
            filter="url(#innerShadow)"
          />
          
          {/* Manga Direita */}
          <path
            d="M 290 70 
               C 310 80, 315 100, 310 140 
               L 295 150 
               C 285 145, 275 130, 265 90 
               L 260 70 
               Z"
            fill="url(#rightSleeveGradient)"
            filter="url(#innerShadow)"
          />

          {/* Corpo Principal */}
          <path
            d="M 60 60 
               C 60 50, 80 30, 120 25 
               L 130 20 
               C 145 15, 175 15, 190 20 
               L 200 25 
               C 240 30, 260 50, 260 60 
               L 265 90 
               C 275 130, 285 145, 295 150 
               L 295 155 
               L 280 160 
               L 275 350 
               C 275 365, 265 370, 250 370 
               L 70 370 
               C 55 370, 45 365, 45 350 
               L 40 160 
               L 25 155 
               L 25 150 
               C 35 145, 45 130, 55 90 
               Z"
            fill="url(#bodyGradient)"
            filter="url(#innerShadow)"
          />

          {/* Gola */}
          <path
            d="M 120 25 
               C 130 35, 145 42, 160 42 
               C 175 42, 190 35, 200 25 
               C 195 22, 185 18, 160 18 
               C 135 18, 125 22, 120 25 
               Z"
            fill={currentColor.collar}
          />
          
          {/* Linha da gola (costura) */}
          <path
            d="M 118 27 C 130 38, 145 45, 160 45 C 175 45, 190 38, 202 27"
            stroke={color === 'white' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}
            strokeWidth="1.5"
            fill="none"
          />

          {/* Costuras laterais */}
          <path
            d="M 55 160 L 55 360"
            stroke={color === 'white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <path
            d="M 265 160 L 265 360"
            stroke={color === 'white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
            strokeWidth="1"
            strokeDasharray="3 3"
          />

          {/* Textura de tecido overlay */}
          <rect x="40" y="20" width="240" height="360" fill="url(#fabricTexture)" opacity="0.5"/>

          {/* Highlight de luz */}
          <path
            d="M 80 60 C 100 80, 120 120, 110 200 L 100 200 C 95 120, 85 90, 70 60 Z"
            fill="rgba(255,255,255,0.15)"
          />
        </svg>

        {/* Design/Estampa posicionada */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{ 
            top: '95px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '150px',
            height: '150px'
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={designImage}
            alt="Design"
            className="w-full h-full object-contain"
            style={{
              filter: color === 'black' || color === 'navy' 
                ? 'brightness(1.1) drop-shadow(0 2px 8px rgba(0,0,0,0.3))' 
                : 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
              mixBlendMode: 'multiply'
            }}
          />
        </motion.div>
      </motion.div>

      {/* Sombra no chão */}
      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-64 h-8 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.2), transparent)' }}
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      {/* Badge de qualidade */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
        <span className="text-xs font-medium text-gray-600">100% Algodão Premium</span>
      </div>
    </motion.div>
  );
}