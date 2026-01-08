import React from 'react';
import { motion } from 'framer-motion';

export default function MugMockup({ designImage }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ perspective: '1500px' }}
    >
      {/* Background com mesa de madeira */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-50 via-orange-50 to-amber-100" />
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0 L100 0 L100 3 L0 3 Z M0 10 L100 10 L100 13 L0 13 Z M0 20 L100 20 L100 23 L0 23 Z M0 30 L100 30 L100 33 L0 33 Z' fill='%23D97706' opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: '100px 100px'
        }}
      />

      {/* Vapor da caneca (mais realista) */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-8 left-1/2 -translate-x-1/2 w-16 h-28"
          initial={{ opacity: 0 }}
          animate={{
            y: [-10, -70],
            x: [0, (i - 1) * 15, (i - 1) * 25],
            opacity: [0, 0.4, 0],
            scale: [0.8, 1.5]
          }}
          transition={{ 
            duration: 3,
            delay: i * 0.8,
            repeat: Infinity,
            ease: "easeOut"
          }}
        >
          <div 
            className="w-full h-full rounded-full blur-2xl"
            style={{
              background: 'radial-gradient(ellipse, rgba(200,200,200,0.6), transparent)'
            }}
          />
        </motion.div>
      ))}

      {/* Caneca */}
      <motion.div
        className="relative z-10"
        initial={{ rotateY: -15, scale: 0.9 }}
        animate={{ 
          rotateY: [0, -3, 0],
          y: [0, -6, 0]
        }}
        transition={{ 
          rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ 
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 25px 40px rgba(0,0,0,0.3))'
        }}
      >
        {/* Corpo da caneca */}
        <div 
          className="relative rounded-2xl overflow-visible"
          style={{ 
            width: '200px',
            height: '240px',
            transform: 'rotateY(-2deg)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Interior escuro (topo) */}
          <div 
            className="absolute top-0 left-0 right-0 h-12 rounded-t-2xl overflow-hidden"
            style={{
              background: 'radial-gradient(ellipse at center, #3a2a1a 0%, #1a1410 70%)',
              boxShadow: 'inset 0 5px 20px rgba(0,0,0,0.8)'
            }}
          >
            {/* Líquido (café) */}
            <div 
              className="absolute bottom-0 left-3 right-3 h-2 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #4a3428 0%, #2a1a10 100%)',
                boxShadow: '0 -2px 10px rgba(0,0,0,0.5)'
              }}
            />
          </div>

          {/* Superfície principal da caneca */}
          <div 
            className="absolute top-6 left-0 right-0 bottom-0 rounded-2xl"
            style={{
              background: 'linear-gradient(120deg, #ffffff 0%, #f8f8f8 50%, #ffffff 100%)',
              boxShadow: `
                inset -8px 0 20px rgba(0,0,0,0.08),
                inset 8px 0 20px rgba(255,255,255,0.8),
                0 20px 60px rgba(0,0,0,0.25)
              `
            }}
          >
            {/* Design na caneca (área curva) */}
            <motion.div
              className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center justify-center"
              style={{ 
                width: '150px',
                height: '150px'
              }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="w-full h-full p-3"
                style={{
                  transform: 'perspective(600px) rotateY(-5deg)',
                  filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))'
                }}
              >
                <img
                  src={designImage}
                  alt="Design"
                  className="w-full h-full object-contain"
                  style={{
                    imageRendering: 'high-quality'
                  }}
                />
              </div>
            </motion.div>

            {/* Reflexo principal (luz da janela) */}
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(255,255,255,0.9) 0%, 
                    transparent 15%, 
                    transparent 40%, 
                    rgba(255,255,255,0.4) 50%, 
                    transparent 60%,
                    transparent 85%,
                    rgba(255,255,255,0.2) 100%
                  )
                `,
                mixBlendMode: 'overlay'
              }}
            />

            {/* Reflexo secundário */}
            <div 
              className="absolute right-4 top-20 w-8 h-32 rounded-full blur-sm opacity-60 pointer-events-none"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.6), transparent)'
              }}
            />

            {/* Borda superior brilhante */}
            <div 
              className="absolute top-0 left-0 right-0 h-2 rounded-t-2xl"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.8), transparent)'
              }}
            />
          </div>

          {/* Alça da caneca (3D realista) */}
          <div
            className="absolute top-12 -right-12 w-16 h-28"
            style={{
              transform: 'rotateY(15deg) translateZ(10px)',
              transformStyle: 'preserve-3d'
            }}
          >
            {/* Parte externa da alça */}
            <div 
              className="absolute inset-0 border-[10px] border-white rounded-r-[50px] rounded-l-[30px]"
              style={{
                borderLeftColor: 'transparent',
                background: 'linear-gradient(90deg, transparent 40%, rgba(255,255,255,0.1) 100%)',
                boxShadow: `
                  inset -4px 0 12px rgba(0,0,0,0.15),
                  inset 4px 4px 12px rgba(255,255,255,0.9),
                  -5px 8px 20px rgba(0,0,0,0.2)
                `,
                filter: 'drop-shadow(-3px 5px 8px rgba(0,0,0,0.15))'
              }}
            />
            
            {/* Highlight na alça */}
            <div 
              className="absolute right-1 top-4 w-2 h-16 rounded-full opacity-60"
              style={{
                background: 'linear-gradient(180deg, rgba(255,255,255,0.9), transparent)'
              }}
            />
          </div>

          {/* Textura de cerâmica */}
          <div 
            className="absolute inset-0 rounded-2xl opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundSize: '100px 100px'
            }}
          />
        </div>
      </motion.div>

      {/* Sombra no chão (mesa) */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 w-56 h-16 rounded-full blur-2xl"
        style={{ 
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)',
          transform: 'rotateX(80deg)'
        }}
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.4, 0.5, 0.4]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
}