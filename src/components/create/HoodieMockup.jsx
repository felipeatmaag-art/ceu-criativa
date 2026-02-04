import React from 'react';
import { motion } from 'framer-motion';

export default function HoodieMockup({ designImage, color = 'white', angle = 'front' }) {
  const colorMap = {
    white: { bg: '#f5f5f5', sleeve: '#e8e8e8', shadow: 'rgba(0,0,0,0.08)', hood: '#efefef' },
    black: { bg: '#1a1a1a', sleeve: '#0d0d0d', shadow: 'rgba(0,0,0,0.3)', hood: '#2a2a2a' },
    navy: { bg: '#1e3a8a', sleeve: '#162d6d', shadow: 'rgba(30,58,138,0.3)', hood: '#2747a0' },
    gray: { bg: '#6b7280', sleeve: '#4b5563', shadow: 'rgba(107,114,128,0.3)', hood: '#7c8694' }
  };

  const currentColor = colorMap[color] || colorMap.white;

  if (!designImage) return null;

  const isAngled = angle === 'angled';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-white" />
      
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.9) 0%, transparent 60%)'
        }}
      />

      <motion.div
        className="relative z-10"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ 
          filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.2))',
          transform: isAngled ? 'rotateY(-15deg) rotateZ(-3deg)' : 'rotateY(0deg)',
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        <svg 
          width="360" 
          height="420" 
          viewBox="0 0 360 420" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="hoodieBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={currentColor.bg} />
              <stop offset="50%" stopColor={currentColor.bg} />
              <stop offset="100%" stopColor={currentColor.sleeve} />
            </linearGradient>
            
            <linearGradient id="hoodGradient" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor={currentColor.hood} />
              <stop offset="100%" stopColor={currentColor.sleeve} />
            </linearGradient>

            <filter id="fabricShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#000" floodOpacity="0.15"/>
            </filter>

            <pattern id="hoodieFabric" patternUnits="userSpaceOnUse" width="3" height="3">
              <rect width="3" height="3" fill="transparent"/>
              <rect width="1" height="1" fill="rgba(0,0,0,0.03)"/>
            </pattern>
          </defs>

          {/* Manga Esquerda */}
          <path
            d="M 25 80 
               C 5 90, 0 110, 5 160 
               L 20 180 
               C 30 175, 40 155, 55 100 
               L 65 80 
               Z"
            fill="url(#hoodieBody)"
            filter="url(#fabricShadow)"
          />
          
          {/* Manga Direita */}
          <path
            d="M 335 80 
               C 355 90, 360 110, 355 160 
               L 340 180 
               C 330 175, 320 155, 305 100 
               L 295 80 
               Z"
            fill="url(#hoodieBody)"
            filter="url(#fabricShadow)"
          />

          {/* Capuz - parte de trás */}
          <ellipse 
            cx="180" 
            cy="40" 
            rx="70" 
            ry="35"
            fill="url(#hoodGradient)"
            opacity="0.9"
          />

          {/* Corpo Principal */}
          <path
            d="M 65 70 
               C 65 55, 90 35, 140 30 
               L 150 25 
               C 165 20, 195 20, 210 25 
               L 220 30 
               C 270 35, 295 55, 295 70 
               L 305 100 
               C 315 145, 330 175, 340 180 
               L 340 190 
               L 320 195 
               L 310 390 
               C 310 405, 295 410, 275 410 
               L 85 410 
               C 65 410, 50 405, 50 390 
               L 40 195 
               L 20 190 
               L 20 180 
               C 30 175, 45 145, 55 100 
               Z"
            fill="url(#hoodieBody)"
            filter="url(#fabricShadow)"
          />

          {/* Capuz - abertura frontal */}
          <path
            d="M 140 30 
               C 150 45, 165 55, 180 55 
               C 195 55, 210 45, 220 30"
            stroke={currentColor.hood}
            strokeWidth="2"
            fill="none"
          />

          {/* Cordões do capuz */}
          <path
            d="M 160 55 L 160 80 M 200 55 L 200 80"
            stroke={color === 'white' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.3)'}
            strokeWidth="2"
          />
          <circle cx="160" cy="83" r="3" fill={color === 'white' ? '#888' : '#ccc'} />
          <circle cx="200" cy="83" r="3" fill={color === 'white' ? '#888' : '#ccc'} />

          {/* Bolso canguru */}
          <path
            d="M 120 200 
               C 120 190, 140 185, 180 185 
               C 220 185, 240 190, 240 200 
               L 240 240 
               C 240 250, 220 255, 180 255 
               C 140 255, 120 250, 120 240 
               Z"
            fill={currentColor.sleeve}
            opacity="0.6"
          />
          <path
            d="M 125 200 C 140 205, 220 205, 235 200"
            stroke={color === 'white' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'}
            strokeWidth="2"
            fill="none"
          />

          {/* Costuras */}
          <path
            d="M 60 180 L 60 385"
            stroke={color === 'white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <path
            d="M 300 180 L 300 385"
            stroke={color === 'white' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Textura de tecido */}
          <rect x="40" y="25" width="280" height="395" fill="url(#hoodieFabric)" opacity="0.5"/>

          {/* Highlight */}
          <path
            d="M 85 80 C 110 100, 130 150, 120 250 L 110 250 C 100 150, 90 110, 75 80 Z"
            fill="rgba(255,255,255,0.12)"
          />
        </svg>

        {/* Design/Estampa */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{ 
            top: isAngled ? '110px' : '120px',
            left: isAngled ? '48%' : '50%',
            transform: isAngled ? 'translateX(-50%) rotateY(-5deg)' : 'translateX(-50%)',
            width: '140px',
            height: '140px'
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
                ? 'brightness(1.15) drop-shadow(0 3px 10px rgba(0,0,0,0.4))' 
                : 'drop-shadow(0 3px 10px rgba(0,0,0,0.2))',
              mixBlendMode: 'multiply'
            }}
          />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 w-72 h-10 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.25), transparent)' }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
        <span className="text-xs font-medium text-gray-600">Moletom Premium</span>
      </div>
    </motion.div>
  );
}