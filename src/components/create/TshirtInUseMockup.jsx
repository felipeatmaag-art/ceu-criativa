import React from 'react';
import { motion } from 'framer-motion';

export default function TshirtInUseMockup({ designImage, color = 'white' }) {
  const colorMap = {
    white: '#FFFFFF',
    black: '#1a1a1a',
    navy: '#1e3a8a',
    gray: '#6b7280'
  };

  const currentColor = colorMap[color] || colorMap.white;

  if (!designImage) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl"
    >
      {/* Background - ambiente urbano/casual */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/30 to-rose-50/40" />
      
      {/* Textura de parede desfocada */}
      <div 
        className="absolute inset-0 opacity-30 blur-sm"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 35px,
            rgba(139,90,43,0.03) 35px,
            rgba(139,90,43,0.03) 36px
          )`
        }}
      />

      {/* Luz ambiente suave */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.8) 0%, transparent 50%)'
        }}
      />

      <motion.div
        className="relative z-10"
        animate={{ 
          y: [0, -8, 0],
          x: [0, 3, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ 
          filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.15))',
          transform: 'scale(1.1)'
        }}
      >
        <svg 
          width="380" 
          height="480" 
          viewBox="0 0 380 480" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="skinTone" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f4c6a8" />
              <stop offset="100%" stopColor="#e8b298" />
            </linearGradient>

            <linearGradient id="tshirtInUse" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentColor} />
              <stop offset="50%" stopColor={currentColor} />
              <stop offset="100%" stopColor={color === 'white' ? '#f5f5f5' : '#0d0d0d'} />
            </linearGradient>

            <filter id="personShadow">
              <feDropShadow dx="0" dy="25" stdDeviation="30" floodColor="#000" floodOpacity="0.2"/>
            </filter>

            <clipPath id="tshirtClip">
              <path d="M 70 140 L 60 180 L 55 300 L 50 420 L 120 420 L 120 180 L 100 140 Z M 280 140 L 290 180 L 295 300 L 300 420 L 230 420 L 230 180 L 250 140 Z M 100 140 C 100 130, 130 110, 175 110 C 220 110, 250 130, 250 140 L 250 180 C 260 200, 290 250, 295 300 L 295 420 C 295 435, 280 440, 260 440 L 90 440 C 70 440, 55 435, 55 420 L 55 300 C 60 250, 90 200, 100 180 Z"/>
            </clipPath>

            <pattern id="fabricTexture" patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill="transparent"/>
              <rect width="1" height="1" fill="rgba(0,0,0,0.02)"/>
            </pattern>
          </defs>

          {/* Pescoço */}
          <ellipse 
            cx="175" 
            cy="95" 
            rx="30" 
            ry="35"
            fill="url(#skinTone)"
          />

          {/* Rosto parcial (parte inferior) */}
          <path
            d="M 145 60 
               C 145 40, 155 25, 175 25 
               C 195 25, 205 40, 205 60
               L 205 85
               C 205 95, 195 100, 175 100
               C 155 100, 145 95, 145 85
               Z"
            fill="url(#skinTone)"
          />

          {/* Sombra do queixo */}
          <ellipse 
            cx="175" 
            cy="85" 
            rx="25" 
            ry="8"
            fill="rgba(0,0,0,0.05)"
          />

          {/* Braço esquerdo */}
          <path
            d="M 60 180 
               C 50 200, 45 240, 48 280
               L 48 320
               C 48 335, 52 345, 60 345
               L 75 345
               C 80 340, 85 320, 85 300
               L 90 260
               C 92 230, 85 200, 75 180
               Z"
            fill="url(#skinTone)"
            filter="url(#personShadow)"
          />

          {/* Mão esquerda - posição casual */}
          <ellipse 
            cx="60" 
            cy="360" 
            rx="18" 
            ry="22"
            fill="url(#skinTone)"
            transform="rotate(-10 60 360)"
          />

          {/* Braço direito */}
          <path
            d="M 290 180 
               C 300 200, 305 240, 302 280
               L 302 320
               C 302 335, 298 345, 290 345
               L 275 345
               C 270 340, 265 320, 265 300
               L 260 260
               C 258 230, 265 200, 275 180
               Z"
            fill="url(#skinTone)"
            filter="url(#personShadow)"
          />

          {/* Mão direita - posição casual */}
          <ellipse 
            cx="290" 
            cy="360" 
            rx="18" 
            ry="22"
            fill="url(#skinTone)"
            transform="rotate(10 290 360)"
          />

          {/* Camiseta - corpo principal */}
          <path
            d="M 70 140 
               L 60 180 
               L 55 300 
               L 50 420 
               L 120 420 
               L 120 180 
               L 100 140 
               Z 
               M 280 140 
               L 290 180 
               L 295 300 
               L 300 420 
               L 230 420 
               L 230 180 
               L 250 140 
               Z 
               M 100 140 
               C 100 130, 130 110, 175 110 
               C 220 110, 250 130, 250 140 
               L 250 180 
               C 260 200, 290 250, 295 300 
               L 295 420 
               C 295 435, 280 440, 260 440 
               L 90 440 
               C 70 440, 55 435, 55 420 
               L 55 300 
               C 60 250, 90 200, 100 180 
               Z"
            fill="url(#tshirtInUse)"
            filter="url(#personShadow)"
          />

          {/* Gola */}
          <path
            d="M 140 110 
               C 150 120, 160 125, 175 125 
               C 190 125, 200 120, 210 110"
            fill="none"
            stroke={color === 'white' ? '#e0e0e0' : '#2a2a2a'}
            strokeWidth="3"
          />

          {/* Textura de tecido */}
          <rect x="50" y="110" width="250" height="340" fill="url(#fabricTexture)" clipPath="url(#tshirtClip)" opacity="0.5"/>

          {/* Costuras */}
          <path
            d="M 65 180 L 65 410"
            stroke={color === 'white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <path
            d="M 285 180 L 285 410"
            stroke={color === 'white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Highlights de luz */}
          <path
            d="M 90 150 C 110 180, 130 240, 120 320 L 110 320 C 100 240, 95 190, 80 150 Z"
            fill="rgba(255,255,255,0.12)"
          />

          {/* Jeans/calça (parte superior) */}
          <path
            d="M 90 440 
               L 85 470
               L 120 470
               L 120 440
               Z
               M 260 440
               L 265 470
               L 230 470
               L 230 440
               Z"
            fill="#1e3a5f"
            opacity="0.8"
          />
        </svg>

        {/* Design/Estampa na camiseta */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{ 
            top: '180px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '160px',
            height: '160px'
          }}
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={designImage}
            alt="Design"
            className="w-full h-full object-contain"
            style={{
              filter: color === 'black' || color === 'navy' 
                ? 'brightness(1.15) drop-shadow(0 4px 12px rgba(0,0,0,0.4))' 
                : 'drop-shadow(0 4px 12px rgba(0,0,0,0.2))',
              mixBlendMode: 'multiply'
            }}
          />
        </motion.div>
      </motion.div>

      {/* Sombra no chão */}
      <motion.div
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-64 h-12 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.2), transparent)' }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
        <span className="text-xs font-medium text-gray-600">Visão em Uso</span>
      </div>
    </motion.div>
  );
}