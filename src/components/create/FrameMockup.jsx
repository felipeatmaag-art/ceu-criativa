import React from 'react';
import { motion } from 'framer-motion';

export default function FrameMockup({ designImage, angle = 'front', isPoster = false }) {
  if (!designImage) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl"
    >
      {/* Parede elegante */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-200 via-gray-100 to-neutral-200" />
      
      {/* Textura de parede sutil */}
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
        }}
      />

      {/* Luz de ambiente/janela */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 50%)'
        }}
      />

      {/* Container do quadro */}
      <motion.div
        className="relative z-10"
        animate={{ 
          y: [0, -5, 0],
          rotateZ: [0, 0.3, 0, -0.3, 0]
        }}
        transition={{ 
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        whileHover={{ scale: 1.02, y: -8 }}
        style={{ 
          filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))'
        }}
      >
        {/* Fio de sustentação */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2">
          {/* Gancho */}
          <div className="relative">
            <div 
              className="w-3 h-4 mx-auto rounded-b-full"
              style={{
                background: 'linear-gradient(180deg, #9ca3af, #6b7280)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}
            />
            {/* Cordão */}
            <svg 
              width="60" 
              height="30" 
              viewBox="0 0 60 30" 
              className="absolute top-3 left-1/2 -translate-x-1/2"
            >
              <path
                d="M 30 0 L 10 28 M 30 0 L 50 28"
                stroke="#8b7355"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Moldura externa */}
        <div 
          className="relative p-5 rounded-sm"
          style={{
            background: 'linear-gradient(145deg, #2a1f1a 0%, #1a1410 50%, #2a1f1a 100%)',
            boxShadow: `
              0 20px 60px rgba(0,0,0,0.4),
              inset 0 1px 1px rgba(255,255,255,0.1),
              inset 0 -1px 1px rgba(0,0,0,0.5)
            `
          }}
        >
          {/* Textura de madeira */}
          <div 
            className="absolute inset-0 opacity-20 rounded-sm"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 8px,
                rgba(139,115,85,0.3) 8px,
                rgba(139,115,85,0.3) 9px
              )`
            }}
          />

          {/* Detalhes dourados nos cantos */}
          {['top-2 left-2', 'top-2 right-2', 'bottom-2 left-2', 'bottom-2 right-2'].map((pos, i) => (
            <div 
              key={i}
              className={`absolute ${pos} w-4 h-4`}
              style={{
                borderColor: 'rgba(212,175,55,0.4)',
                borderWidth: i < 2 ? '2px 0 0 2px' : '0 2px 2px 0',
                borderStyle: 'solid',
                borderRadius: i < 2 
                  ? (i === 0 ? '4px 0 0 0' : '0 4px 0 0')
                  : (i === 2 ? '0 0 0 4px' : '0 0 4px 0')
              }}
            />
          ))}

          {/* Passe-partout (passepartout) */}
          <div 
            className="relative p-6"
            style={{
              background: 'linear-gradient(135deg, #f8f6f2 0%, #ebe7df 50%, #f8f6f2 100%)',
              boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            {/* Borda interna decorativa */}
            <div 
              className="absolute inset-4 pointer-events-none"
              style={{
                border: '1px solid rgba(180,160,140,0.3)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)'
              }}
            />

            {/* Área da imagem com vidro */}
            <motion.div
              className="relative bg-white overflow-hidden"
              style={{ 
                width: '240px',
                height: '240px',
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.08)'
              }}
            >
              <img
                src={designImage}
                alt="Design"
                className="w-full h-full object-cover"
              />

              {/* Efeito de vidro */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `
                    linear-gradient(135deg, 
                      rgba(255,255,255,0.4) 0%, 
                      transparent 20%, 
                      transparent 50%, 
                      rgba(255,255,255,0.15) 55%, 
                      transparent 60%,
                      transparent 90%, 
                      rgba(255,255,255,0.1) 100%
                    )
                  `
                }}
              />

              {/* Reflexo de luz */}
              <motion.div 
                className="absolute top-4 right-4 w-16 h-24 opacity-25 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.8), transparent)',
                  filter: 'blur(6px)',
                  transform: 'rotate(-12deg)'
                }}
                animate={{
                  opacity: [0.2, 0.3, 0.2]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </motion.div>
          </div>

          {/* Brilho na moldura */}
          <div 
            className="absolute top-0 left-0 right-0 h-1/4 pointer-events-none rounded-t-sm"
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08), transparent)'
            }}
          />
        </div>
      </motion.div>

      {/* Sombra na parede */}
      <motion.div
        className="absolute z-0"
        style={{
          width: '320px',
          height: '320px',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.15) 0%, transparent 60%)',
          transform: 'translateY(20px) translateX(10px)',
          filter: 'blur(20px)'
        }}
        animate={{
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity }}
      />

      {/* Badge */}
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
        <span className="text-xs font-medium text-gray-600">Moldura em Madeira Nobre</span>
      </div>
    </motion.div>
  );
}