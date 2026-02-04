import React from 'react';
import { motion } from 'framer-motion';

export default function TravelMugMockup({ designImage, angle = 'front' }) {
  if (!designImage) return null;

  const isAngled = angle === 'angled';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-stone-50 to-zinc-100" />
      
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 25px,
            rgba(139,90,43,0.03) 25px,
            rgba(139,90,43,0.03) 26px
          )`
        }}
      />

      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.7) 0%, transparent 50%)'
        }}
      />

      <motion.div
        className="relative z-10"
        animate={{ y: [0, -5, 0], rotateY: isAngled ? [-12, -10, -12] : [0, 0, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ 
          perspective: '1000px',
          filter: 'drop-shadow(0 35px 50px rgba(0,0,0,0.3))'
        }}
      >
        <svg 
          width="240" 
          height="380" 
          viewBox="0 0 240 380" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ transform: isAngled ? 'rotateY(-15deg)' : 'rotateY(0deg)' }}
        >
          <defs>
            <linearGradient id="travelMugBody" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#f8f9fa" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f1f3f5" />
            </linearGradient>
            
            <linearGradient id="travelMugLid" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2a2a2a" />
              <stop offset="50%" stopColor="#1a1a1a" />
              <stop offset="100%" stopColor="#2a2a2a" />
            </linearGradient>

            <radialGradient id="metalShine" cx="30%" cy="30%" r="70%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            <filter id="mugShadow">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#000" floodOpacity="0.2"/>
            </filter>
          </defs>

          {/* Base da caneca */}
          <ellipse 
            cx="120" 
            cy="350" 
            rx="55" 
            ry="12"
            fill="#e9ecef"
          />
          <ellipse 
            cx="120" 
            cy="348" 
            rx="50" 
            ry="10"
            fill="#1a1a1a"
          />

          {/* Corpo principal */}
          <path
            d="M 65 120 
               L 55 340 
               C 55 345, 60 350, 70 350 
               L 170 350 
               C 180 350, 185 345, 185 340 
               L 175 120 
               Z"
            fill="url(#travelMugBody)"
            filter="url(#mugShadow)"
          />

          {/* Linhas de contorno do metal */}
          <path
            d="M 65 120 L 175 120"
            stroke="#dee2e6"
            strokeWidth="2"
          />
          <path
            d="M 55 340 L 185 340"
            stroke="#dee2e6"
            strokeWidth="2"
          />

          {/* Tampa */}
          <ellipse 
            cx="120" 
            cy="120" 
            rx="60" 
            ry="15"
            fill="url(#travelMugLid)"
          />
          
          {/* Anel da tampa */}
          <ellipse 
            cx="120" 
            cy="115" 
            rx="65" 
            ry="18"
            fill="none"
            stroke="#333"
            strokeWidth="3"
          />

          {/* Botão de abertura */}
          <rect 
            x="105" 
            y="95" 
            width="30" 
            height="25" 
            rx="5"
            fill="#2a2a2a"
          />
          <rect 
            x="108" 
            y="98" 
            width="24" 
            height="19" 
            rx="3"
            fill="#444"
          />
          <circle cx="120" cy="107" r="3" fill="#888" />

          {/* Abertura para beber */}
          <ellipse 
            cx="120" 
            cy="120" 
            rx="8" 
            ry="3"
            fill="#1a1a1a"
          />

          {/* Alça */}
          <path
            d="M 185 160 
               C 220 160, 235 200, 235 240 
               C 235 280, 220 320, 185 320"
            fill="none"
            stroke="url(#travelMugLid)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          
          <path
            d="M 188 165 
               C 215 165, 227 200, 227 240 
               C 227 280, 215 315, 188 315"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Reflexos metálicos */}
          <rect 
            x="65" 
            y="120" 
            width="110" 
            height="230"
            fill="url(#metalShine)"
            opacity="0.6"
          />

          <path
            d="M 75 140 L 75 320"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Banda decorativa */}
          <rect 
            x="60" 
            y="200" 
            width="120" 
            height="3"
            fill="#dee2e6"
          />
          <rect 
            x="60" 
            y="280" 
            width="120" 
            height="3"
            fill="#dee2e6"
          />
        </svg>

        {/* Design/Estampa na caneca */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{ 
            top: isAngled ? '165px' : '175px',
            left: isAngled ? '46%' : '50%',
            transform: isAngled ? 'translateX(-50%) rotateY(-8deg)' : 'translateX(-50%)',
            width: '110px',
            height: '110px'
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={designImage}
            alt="Design"
            className="w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
              borderRadius: '6px'
            }}
          />
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-12 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.3), transparent)' }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.35, 0.45, 0.35] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
        <span className="text-xs font-medium text-gray-600">Caneca Térmica 500ml</span>
      </div>
    </motion.div>
  );
}