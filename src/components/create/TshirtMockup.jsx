import React from 'react';
import { motion } from 'framer-motion';

export default function TshirtMockup({ designImage, color = 'white' }) {
  const colorMap = {
    white: { bg: '#FFFFFF', shadow: 'rgba(0,0,0,0.15)', border: '#e5e5e5' },
    black: { bg: '#1a1a1a', shadow: 'rgba(0,0,0,0.5)', border: '#000000' },
    navy: { bg: '#1e3a8a', shadow: 'rgba(30,58,138,0.4)', border: '#1e40af' },
    gray: { bg: '#6b7280', shadow: 'rgba(107,114,128,0.4)', border: '#4b5563' }
  };

  const currentColor = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ perspective: '1200px' }}
    >
      {/* Background com textura */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-gray-50 to-stone-100" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Pessoa com camiseta (silhueta realista) */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0.9, rotateY: -10 }}
        animate={{ 
          scale: 1,
          rotateY: 0,
          y: [0, -8, 0]
        }}
        transition={{ 
          scale: { duration: 0.6 },
          rotateY: { duration: 0.6 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ 
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.25))'
        }}
      >
        {/* Corpo/Torso */}
        <div className="relative" style={{ width: '280px', height: '380px' }}>
          {/* Ombros */}
          <div 
            className="absolute top-0 left-0 right-0 h-20 rounded-t-[100px]"
            style={{ 
              background: `linear-gradient(180deg, ${currentColor.bg} 0%, ${currentColor.bg} 100%)`,
              boxShadow: `inset 0 2px 20px ${currentColor.shadow}, 0 10px 30px ${currentColor.shadow}`
            }}
          />
          
          {/* Manga Esquerda */}
          <div 
            className="absolute left-0 top-8 w-20 h-28 rounded-l-[40px] rounded-br-[20px]"
            style={{ 
              background: `linear-gradient(135deg, ${currentColor.bg} 0%, ${currentColor.bg} 100%)`,
              filter: 'brightness(0.8)',
              boxShadow: `inset -5px 5px 15px ${currentColor.shadow}`,
              transform: 'rotateZ(-5deg) translateX(-8px)'
            }}
          />

          {/* Manga Direita */}
          <div 
            className="absolute right-0 top-8 w-20 h-28 rounded-r-[40px] rounded-bl-[20px]"
            style={{ 
              background: `linear-gradient(225deg, ${currentColor.bg} 0%, ${currentColor.bg} 100%)`,
              filter: 'brightness(0.75)',
              boxShadow: `inset 5px 5px 15px ${currentColor.shadow}`,
              transform: 'rotateZ(5deg) translateX(8px)'
            }}
          />

          {/* Corpo Principal da Camiseta */}
          <div 
            className="absolute top-12 left-10 right-10 bottom-0 rounded-t-[80px] rounded-b-[20px]"
            style={{ 
              background: `linear-gradient(180deg, ${currentColor.bg} 0%, ${currentColor.bg} 95%, rgba(0,0,0,0.05) 100%)`,
              boxShadow: `
                inset 0 10px 30px ${currentColor.shadow},
                inset 0 -10px 20px rgba(0,0,0,0.1),
                0 20px 60px ${currentColor.shadow}
              `
            }}
          >
            {/* Gola em V */}
            <div 
              className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-16"
              style={{ 
                background: currentColor.bg,
                clipPath: 'polygon(50% 0%, 0% 0%, 50% 100%)',
                filter: 'brightness(0.85)',
                boxShadow: `inset 0 2px 10px ${currentColor.shadow}`
              }}
            />

            {/* Costuras */}
            <div 
              className="absolute top-4 left-0 right-0 h-[1px] opacity-20"
              style={{ background: currentColor.border }}
            />

            {/* Design/Print */}
            <motion.div
              className="absolute top-20 left-1/2 -translate-x-1/2 flex items-center justify-center"
              style={{ width: '180px', height: '180px' }}
              whileHover={{ scale: 1.08, rotateZ: 2 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="w-full h-full p-4"
                style={{
                  filter: `
                    ${color === 'black' || color === 'navy' ? 'brightness(1.3)' : 'brightness(1)'}
                    drop-shadow(0 4px 12px rgba(0,0,0,0.2))
                  `
                }}
              >
                <img
                  src={designImage}
                  alt="Design"
                  className="w-full h-full object-contain"
                  style={{
                    transform: 'perspective(600px) rotateY(0deg)',
                    imageRendering: 'high-quality'
                  }}
                />
              </div>
            </motion.div>

            {/* Textura de tecido */}
            <div 
              className="absolute inset-0 rounded-t-[80px] rounded-b-[20px] opacity-[0.08] pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
                backgroundSize: '100px 100px'
              }}
            />

            {/* Highlight/Luz */}
            <div 
              className="absolute inset-0 rounded-t-[80px] rounded-b-[20px] pointer-events-none"
              style={{
                background: 'linear-gradient(140deg, rgba(255,255,255,0.3) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.1) 100%)'
              }}
            />
          </div>

          {/* Dobras realistas */}
          <div 
            className="absolute top-32 left-16 w-1 h-24 opacity-10"
            style={{ 
              background: 'linear-gradient(180deg, transparent, black, transparent)',
              transform: 'rotateZ(-2deg)'
            }}
          />
          <div 
            className="absolute top-32 right-16 w-1 h-24 opacity-10"
            style={{ 
              background: 'linear-gradient(180deg, transparent, black, transparent)',
              transform: 'rotateZ(2deg)'
            }}
          />
        </div>
      </motion.div>

      {/* Sombra no chão */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-72 h-12 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.3), transparent)' }}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </motion.div>
  );
}