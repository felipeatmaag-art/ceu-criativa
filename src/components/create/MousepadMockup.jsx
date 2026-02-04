import React from 'react';
import { motion } from 'framer-motion';

export default function MousepadMockup({ designImage, angle = 'front' }) {
  if (!designImage) return null;

  const isAngled = angle === 'angled';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-gray-100 to-stone-100" />
      
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`
        }}
      />

      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.6) 0%, transparent 50%)'
        }}
      />

      {/* Mesa/superfície */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 40px,
            rgba(139,90,43,0.1) 40px,
            rgba(139,90,43,0.1) 41px
          )`
        }}
      />

      <motion.div
        className="relative z-10"
        animate={{ 
          y: [0, -3, 0],
          rotateX: isAngled ? [45, 47, 45] : [55, 57, 55]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        style={{ 
          perspective: '1200px',
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 25px 40px rgba(0,0,0,0.25))'
        }}
      >
        <svg 
          width="400" 
          height="320" 
          viewBox="0 0 400 320" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ 
            transform: isAngled 
              ? 'rotateX(50deg) rotateZ(-5deg)' 
              : 'rotateX(60deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          <defs>
            <linearGradient id="mousepadTop" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f8f9fa" />
              <stop offset="100%" stopColor="#e9ecef" />
            </linearGradient>
            
            <linearGradient id="mousepadBottom" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#495057" />
              <stop offset="100%" stopColor="#212529" />
            </linearGradient>

            <filter id="padShadow">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="#000" floodOpacity="0.3"/>
            </filter>

            <pattern id="rubberTexture" patternUnits="userSpaceOnUse" width="4" height="4">
              <rect width="4" height="4" fill="transparent"/>
              <circle cx="2" cy="2" r="0.5" fill="rgba(0,0,0,0.1)"/>
            </pattern>
          </defs>

          {/* Camada inferior (borracha) */}
          <path
            d="M 35 105
               L 30 280
               C 30 285, 35 290, 45 290
               L 355 290
               C 365 290, 370 285, 370 280
               L 365 105
               Z"
            fill="url(#mousepadBottom)"
            opacity="0.9"
          />
          <rect x="30" y="105" width="340" height="185" fill="url(#rubberTexture)" opacity="0.4" />

          {/* Superfície principal do mousepad */}
          <path
            d="M 40 30
               C 40 25, 45 20, 55 20
               L 345 20
               C 355 20, 360 25, 360 30
               L 365 100
               C 365 105, 360 110, 350 110
               L 50 110
               C 40 110, 35 105, 35 100
               Z"
            fill="url(#mousepadTop)"
            filter="url(#padShadow)"
          />

          {/* Bordas costuradas */}
          <path
            d="M 40 30
               C 40 25, 45 20, 55 20
               L 345 20
               C 355 20, 360 25, 360 30
               L 365 100
               C 365 105, 360 110, 350 110
               L 50 110
               C 40 110, 35 105, 35 100
               Z"
            fill="none"
            stroke="#6c757d"
            strokeWidth="2"
            strokeDasharray="4 2"
            opacity="0.6"
          />

          {/* Detalhe de profundidade */}
          <path
            d="M 50 110 L 55 115 L 345 115 L 350 110"
            fill="#adb5bd"
            opacity="0.5"
          />

          {/* Reflexo superior */}
          <path
            d="M 55 25 
               L 340 25
               L 335 35
               L 60 35
               Z"
            fill="rgba(255,255,255,0.3)"
          />

          {/* Linhas de textura da superfície */}
          {[30, 45, 60, 75, 90].map((y, i) => (
            <line
              key={i}
              x1="50"
              y1={y}
              x2="350"
              y2={y}
              stroke="rgba(0,0,0,0.02)"
              strokeWidth="1"
            />
          ))}
        </svg>

        {/* Design na superfície do mousepad */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{ 
            top: isAngled ? '15px' : '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px',
            height: '75px',
            perspective: '1000px'
          }}
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.3 }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              transform: 'rotateX(0deg)',
              transformStyle: 'preserve-3d',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            <img
              src={designImage}
              alt="Design"
              className="w-full h-full object-cover"
              style={{
                filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.1))',
                imageRendering: '-webkit-optimize-contrast'
              }}
            />
          </div>
        </motion.div>

        {/* Mouse (opcional, para contexto) */}
        <motion.div
          className="absolute"
          style={{
            top: isAngled ? '40px' : '35px',
            right: isAngled ? '65px' : '80px',
            width: '50px',
            height: '70px'
          }}
          animate={{
            y: [0, -2, 0],
            x: [0, 3, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 50 70" fill="none">
            <defs>
              <linearGradient id="mouseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8f9fa" />
                <stop offset="100%" stopColor="#dee2e6" />
              </linearGradient>
            </defs>
            <path
              d="M 10 15
                 C 10 8, 15 5, 25 5
                 C 35 5, 40 8, 40 15
                 L 40 55
                 C 40 62, 35 65, 25 65
                 C 15 65, 10 62, 10 55
                 Z"
              fill="url(#mouseGradient)"
              filter="drop-shadow(0 4px 8px rgba(0,0,0,0.2))"
            />
            <line x1="25" y1="10" x2="25" y2="20" stroke="#adb5bd" strokeWidth="2" strokeLinecap="round" />
            <circle cx="25" cy="15" r="3" fill="#6c757d" opacity="0.3" />
          </svg>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute"
        style={{
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '360px',
          height: '30px',
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.2), transparent)',
          filter: 'blur(15px)'
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
        <span className="text-xs font-medium text-gray-600">Mousepad XL - Base Antiderrapante</span>
      </div>
    </motion.div>
  );
}