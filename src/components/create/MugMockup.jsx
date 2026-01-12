import React from 'react';
import { motion } from 'framer-motion';

export default function MugMockup({ designImage, angle = 'front' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl"
    >
      {/* Background ambiente aconchegante */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/50 to-stone-100" />
      
      {/* Textura de madeira sutil */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 20px,
            rgba(139,90,43,0.1) 20px,
            rgba(139,90,43,0.1) 21px
          )`
        }}
      />

      {/* Luz ambiente */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.6) 0%, transparent 50%)'
        }}
      />

      {/* Vapor animado */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute z-20"
          style={{
            top: '60px',
            left: `${45 + i * 5}%`,
          }}
          initial={{ opacity: 0 }}
          animate={{
            y: [-20, -80],
            x: [(i - 1.5) * 8, (i - 1.5) * 20],
            opacity: [0, 0.6, 0],
            scale: [0.5, 1.2]
          }}
          transition={{ 
            duration: 2.5,
            delay: i * 0.5,
            repeat: Infinity,
            ease: "easeOut"
          }}
        >
          <div 
            className="w-8 h-12 rounded-full blur-xl"
            style={{
              background: 'radial-gradient(ellipse, rgba(255,255,255,0.8), transparent)'
            }}
          />
        </motion.div>
      ))}

      {/* Container da caneca */}
      <motion.div
        className="relative z-10"
        animate={{ 
          y: [0, -4, 0],
          rotateY: [0, -2, 0]
        }}
        transition={{ 
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ 
          perspective: '1000px',
          filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.25))'
        }}
      >
        {/* SVG Caneca Realista */}
        <svg 
          width="280" 
          height="320" 
          viewBox="0 0 280 320" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradiente corpo */}
            <linearGradient id="mugBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="30%" stopColor="#fafafa" />
              <stop offset="70%" stopColor="#f5f5f5" />
              <stop offset="100%" stopColor="#eeeeee" />
            </linearGradient>
            
            {/* Gradiente interior */}
            <linearGradient id="mugInterior" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2a1a0a" />
              <stop offset="100%" stopColor="#1a0f05" />
            </linearGradient>

            {/* Gradiente café */}
            <radialGradient id="coffeeGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3d2817" />
              <stop offset="100%" stopColor="#251509" />
            </radialGradient>

            {/* Gradiente alça */}
            <linearGradient id="handleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f0f0f0" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e8e8e8" />
            </linearGradient>

            {/* Reflexo */}
            <linearGradient id="reflection" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
            </linearGradient>
          </defs>

          {/* Corpo da caneca */}
          <path
            d="M 50 50 
               L 50 260 
               C 50 280, 70 290, 140 290 
               C 210 290, 230 280, 230 260 
               L 230 50 
               C 230 45, 220 40, 140 40 
               C 60 40, 50 45, 50 50 
               Z"
            fill="url(#mugBody)"
          />

          {/* Interior da caneca */}
          <ellipse cx="140" cy="55" rx="85" ry="18" fill="url(#mugInterior)" />
          
          {/* Café */}
          <ellipse cx="140" cy="60" rx="75" ry="14" fill="url(#coffeeGradient)" />
          
          {/* Reflexo no café */}
          <ellipse cx="120" cy="58" rx="20" ry="4" fill="rgba(255,255,255,0.15)" />

          {/* Borda superior */}
          <ellipse 
            cx="140" 
            cy="50" 
            rx="90" 
            ry="20" 
            fill="none" 
            stroke="#e0e0e0" 
            strokeWidth="8"
          />
          <ellipse 
            cx="140" 
            cy="50" 
            rx="90" 
            ry="20" 
            fill="none" 
            stroke="url(#reflection)" 
            strokeWidth="3"
          />

          {/* Alça */}
          <path
            d="M 230 90 
               C 260 90, 280 120, 280 160 
               C 280 200, 260 230, 230 230"
            fill="none"
            stroke="url(#handleGradient)"
            strokeWidth="18"
            strokeLinecap="round"
          />
          
          {/* Sombra interna da alça */}
          <path
            d="M 230 95 
               C 255 95, 272 120, 272 160 
               C 272 200, 255 225, 230 225"
            fill="none"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Reflexos na caneca */}
          <path
            d="M 70 70 L 70 250 C 70 260, 80 265, 90 265"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />
          
          <path
            d="M 85 80 L 85 200"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </svg>

        {/* Design/Estampa na caneca */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{ 
            top: '110px',
            left: '50%',
            transform: 'translateX(-55%)',
            width: '130px',
            height: '130px'
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <div 
            style={{
              width: '100%',
              height: '100%',
              transform: 'perspective(500px) rotateY(-8deg)',
            }}
          >
            <img
              src={designImage}
              alt="Design"
              className="w-full h-full object-contain"
              style={{
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                borderRadius: '4px'
              }}
            />
          </div>
        </motion.div>
      </motion.div>

      {/* Sombra no chão */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-10 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.25), transparent)' }}
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      {/* Badge */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
        <span className="text-xs font-medium text-gray-600">Cerâmica Premium</span>
      </div>
    </motion.div>
  );
}