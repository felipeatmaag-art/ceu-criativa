import React from 'react';
import { motion } from 'framer-motion';

export default function FrameMockup({ designImage }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ perspective: '1800px' }}
    >
      {/* Parede realista com textura */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-200 via-gray-100 to-stone-200" />
      
      {/* Textura de parede pintada */}
      <div 
        className="absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2' numOctaves='4'/%3E%3CfeColorMatrix values='0 0 0 0 0, 0 0 0 0 0, 0 0 0 0 0, 0 0 0 0.5 0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

      {/* Luz ambiente na parede */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.4), transparent 50%)'
        }}
      />

      {/* Quadro emoldurado */}
      <motion.div
        className="relative z-10"
        initial={{ rotateY: -8, scale: 0.9 }}
        animate={{ 
          rotateY: [0, -1.5, 0],
          rotateZ: [0, 0.3, 0, -0.3, 0],
          y: [0, -10, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.02, rotateY: 3 }}
        style={{ 
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.35))'
        }}
      >
        {/* Corda/Fio de suspensão */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-start justify-center">
          {/* Gancho na parede */}
          <div 
            className="relative w-4 h-6 rounded-b-full bg-gradient-to-b from-gray-400 to-gray-500"
            style={{
              boxShadow: '0 2px 6px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)'
            }}
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-3 rounded-b-full bg-gray-600" />
          </div>
          
          {/* Fio */}
          <div 
            className="absolute top-6 left-1/2 -translate-x-1/2 w-[2px] h-10 bg-gradient-to-b from-gray-400 to-gray-500"
            style={{
              boxShadow: '1px 1px 2px rgba(0,0,0,0.2)'
            }}
          />
        </div>

        {/* Moldura de madeira escura (camada externa) */}
        <div 
          className="relative p-8 rounded-sm"
          style={{
            background: `
              linear-gradient(135deg, 
                #2d2416 0%, 
                #1a1410 20%, 
                #2d2416 40%, 
                #1a1410 60%, 
                #2d2416 80%, 
                #1a1410 100%
              )
            `,
            boxShadow: `
              0 25px 80px rgba(0,0,0,0.5),
              inset 0 2px 4px rgba(255,255,255,0.1),
              inset 0 -2px 4px rgba(0,0,0,0.8)
            `
          }}
        >
          {/* Textura de madeira na moldura */}
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none rounded-sm"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q 25 8, 50 10 T 100 10 L 100 12 Q 75 14, 50 12 T 0 12 Z M0 20 Q 25 22, 50 20 T 100 20 L 100 22 Q 75 20, 50 22 T 0 22 Z M0 30 Q 25 28, 50 30 T 100 30 L 100 32 Q 75 34, 50 32 T 0 32 Z' fill='%23000' opacity='0.3'/%3E%3C/svg%3E")`,
              backgroundSize: '100% 50px'
            }}
          />

          {/* Detalhes entalhados nos cantos */}
          <div className="absolute top-5 left-5 w-6 h-6">
            <div className="absolute inset-0 border-t-2 border-l-2 border-amber-700/40 rounded-tl-sm" />
            <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-amber-600/60 rounded-tl-sm" />
          </div>
          <div className="absolute top-5 right-5 w-6 h-6">
            <div className="absolute inset-0 border-t-2 border-r-2 border-amber-700/40 rounded-tr-sm" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-amber-600/60 rounded-tr-sm" />
          </div>
          <div className="absolute bottom-5 left-5 w-6 h-6">
            <div className="absolute inset-0 border-b-2 border-l-2 border-amber-700/40 rounded-bl-sm" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-amber-600/60 rounded-bl-sm" />
          </div>
          <div className="absolute bottom-5 right-5 w-6 h-6">
            <div className="absolute inset-0 border-b-2 border-r-2 border-amber-700/40 rounded-br-sm" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-amber-600/60 rounded-br-sm" />
          </div>

          {/* Moldura interna (paspatur/matboard bege) */}
          <div 
            className="relative p-6"
            style={{
              background: 'linear-gradient(135deg, #f5f1e8 0%, #e8e4db 50%, #f5f1e8 100%)',
              boxShadow: `
                inset 0 2px 8px rgba(0,0,0,0.15),
                inset 0 -2px 4px rgba(255,255,255,0.5)
              `
            }}
          >
            {/* Borda interna decorativa */}
            <div 
              className="absolute inset-5 pointer-events-none border border-gray-300/50"
              style={{
                boxShadow: 'inset 0 0 0 1px rgba(200,180,150,0.3)'
              }}
            />

            {/* Imagem/Design */}
            <motion.div
              className="relative bg-white overflow-hidden"
              style={{ 
                width: '280px',
                height: '280px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={designImage}
                alt="Design"
                className="w-full h-full object-cover"
                style={{
                  imageRendering: 'high-quality'
                }}
              />

              {/* Vidro protetor com reflexos realistas */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(255,255,255,0.5) 0%, 
                      transparent 15%, 
                      transparent 45%, 
                      rgba(255,255,255,0.25) 50%, 
                      transparent 55%,
                      transparent 85%, 
                      rgba(255,255,255,0.15) 100%
                    )
                  `,
                  mixBlendMode: 'overlay'
                }}
              />

              {/* Reflexo da janela */}
              <motion.div 
                className="absolute top-8 right-8 w-20 h-32 opacity-20 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.8), transparent)',
                  filter: 'blur(8px)',
                  transform: 'rotate(-15deg)'
                }}
                animate={{
                  opacity: [0.15, 0.25, 0.15]
                }}
                transition={{ duration: 5, repeat: Infinity }}
              />

              {/* Textura do vidro */}
              <div 
                className="absolute inset-0 opacity-[0.015] pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='glassNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='2'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23glassNoise)'/%3E%3C/svg%3E")`
                }}
              />
            </motion.div>
          </div>

          {/* Brilho na moldura */}
          <div 
            className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none rounded-t-sm"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08), transparent)'
            }}
          />
        </div>
      </motion.div>

      {/* Sombra projetada na parede */}
      <motion.div
        className="absolute z-0 rounded-sm"
        style={{
          width: '330px',
          height: '330px',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 40%, transparent 70%)',
          transform: 'translateZ(-50px) translateY(25px) translateX(15px)',
          filter: 'blur(25px)'
        }}
        animate={{
          opacity: [0.4, 0.6, 0.4],
          scale: [1, 1.03, 1]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />
    </motion.div>
  );
}