import React from 'react';
import { motion } from 'framer-motion';

export default function CapMockup({ designImage, color = 'white', angle = 'front' }) {
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
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-50 to-indigo-100" />
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      {/* Boné */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0.9, rotateY: angle === 'angled' ? -20 : 0 }}
        animate={{ 
          scale: 1,
          rotateY: angle === 'front' ? [0, -2, 0] : angle === 'angled' ? [-15, -18, -15] : angle === 'worn' ? [0, -3, 0] : 0,
          y: [0, -6, 0]
        }}
        transition={{ 
          scale: { duration: 0.6 },
          rotateY: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ 
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 20px 35px rgba(0,0,0,0.25))'
        }}
      >
        <div className="relative" style={{ width: '300px', height: '200px' }}>
          {/* Aba do boné */}
          <div 
            className="absolute bottom-12 left-1/2 -translate-x-1/2 rounded-[60px]"
            style={{ 
              width: '220px',
              height: '100px',
              background: `linear-gradient(180deg, ${currentColor.bg} 0%, ${currentColor.bg} 100%)`,
              boxShadow: `
                inset 0 -10px 30px ${currentColor.shadow},
                0 15px 40px ${currentColor.shadow}
              `,
              filter: 'brightness(0.85)',
              transform: 'perspective(400px) rotateX(15deg)'
            }}
          >
            {/* Costuras na aba */}
            <div className="absolute top-2 left-8 right-8 h-[1px] bg-black/10" />
            <div className="absolute bottom-2 left-8 right-8 h-[1px] bg-black/10" />
          </div>

          {/* Copa do boné (parte principal) */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2"
            style={{ 
              width: '250px',
              height: '140px'
            }}
          >
            {/* Painéis do boné */}
            <div 
              className="absolute inset-0 rounded-t-[120px] overflow-hidden"
              style={{
                background: `linear-gradient(180deg, ${currentColor.bg} 0%, ${currentColor.bg} 100%)`,
                boxShadow: `
                  inset -8px 0 20px ${currentColor.shadow},
                  inset 8px 0 20px rgba(255,255,255,0.3),
                  0 10px 30px ${currentColor.shadow}
                `
              }}
            >
              {/* Painel frontal (design) */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ width: '140px', height: '90px' }}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="w-full h-full p-2"
                  style={{
                    filter: `
                      ${color === 'black' || color === 'navy' ? 'brightness(1.3)' : 'brightness(1)'}
                      drop-shadow(0 2px 8px rgba(0,0,0,0.2))
                    `
                  }}
                >
                  <img
                    src={designImage}
                    alt="Design"
                    className="w-full h-full object-contain"
                    style={{
                      transform: 'perspective(400px) rotateY(0deg)',
                      imageRendering: 'high-quality'
                    }}
                  />
                </div>
              </motion.div>

              {/* Divisões dos painéis */}
              <div className="absolute top-0 left-1/3 w-[1px] h-full bg-black/10" />
              <div className="absolute top-0 left-2/3 w-[1px] h-full bg-black/10" />

              {/* Botão no topo */}
              <div 
                className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
                style={{
                  background: currentColor.bg,
                  boxShadow: `0 2px 8px ${currentColor.shadow}, inset 0 1px 2px rgba(255,255,255,0.3)`,
                  filter: 'brightness(0.9)'
                }}
              />

              {/* Textura de tecido */}
              <div 
                className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.3'/%3E%3C/svg%3E")`,
                  backgroundSize: '100px 100px'
                }}
              />

              {/* Luz */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(140deg, rgba(255,255,255,0.4) 0%, transparent 40%, transparent 70%, rgba(255,255,255,0.1) 100%)'
                }}
              />
            </div>

            {/* Ajustador traseiro */}
            <div 
              className="absolute bottom-8 left-1/2 -translate-x-1/2 w-16 h-6 rounded-md opacity-80"
              style={{
                background: `linear-gradient(90deg, ${currentColor.bg} 0%, ${currentColor.bg} 100%)`,
                boxShadow: `inset 0 2px 6px ${currentColor.shadow}`,
                filter: 'brightness(0.7)',
                transform: 'rotateX(-20deg)'
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Sombra no chão */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-64 h-12 rounded-full blur-2xl"
        style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.3), transparent)' }}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
}