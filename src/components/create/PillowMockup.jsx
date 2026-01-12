import React from 'react';
import { motion } from 'framer-motion';

export default function PillowMockup({ designImage, angle = 'front' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ perspective: '1400px' }}
    >
      {/* Background - sofá/ambiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-rose-100" />
      <div 
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h40v40H0z M40 40h40v40H40z' fill='%23d97706' opacity='0.1'/%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px'
        }}
      />

      {/* Almofada */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0.9, rotateY: angle === 'angled' ? -20 : 0, rotateZ: -8 }}
        animate={{ 
          rotateY: angle === 'front' ? [0, -5, 0] : angle === 'angled' ? [-18, -22, -18] : 0,
          rotateZ: [-8, -10, -8],
          y: [0, -8, 0]
        }}
        transition={{ 
          rotateY: { duration: 7, repeat: Infinity, ease: "easeInOut" },
          rotateZ: { duration: 5, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ 
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.3))'
        }}
      >
        <div className="relative" style={{ width: '320px', height: '320px' }}>
          {/* Corpo da almofada */}
          <div 
            className="absolute inset-0 rounded-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f8f8 50%, #ffffff 100%)',
              boxShadow: `
                inset -15px -15px 40px rgba(0,0,0,0.12),
                inset 15px 15px 40px rgba(255,255,255,0.8),
                0 25px 60px rgba(0,0,0,0.25)
              `,
              transform: 'translateZ(20px)'
            }}
          >
            {/* Design na almofada */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center p-8"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="w-full h-full"
                style={{
                  filter: 'drop-shadow(0 4px 15px rgba(0,0,0,0.15))'
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

            {/* Textura de tecido macio */}
            <div 
              className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='150' height='150' viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='softFabric'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' /%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23softFabric)' opacity='0.5'/%3E%3C/svg%3E")`,
                backgroundSize: '150px 150px'
              }}
            />

            {/* Costuras decorativas */}
            <div 
              className="absolute top-6 left-6 right-6 bottom-6 rounded-2xl border-2 border-gray-200/40 pointer-events-none"
              style={{
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
              }}
            />

            {/* Efeito de enchimento (acolchoado) */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i}
                  className="absolute rounded-full opacity-5"
                  style={{
                    width: '120px',
                    height: '120px',
                    background: 'radial-gradient(circle, black, transparent)',
                    top: `${20 + (i % 2) * 50}%`,
                    left: `${20 + Math.floor(i / 2) * 50}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                />
              ))}
            </div>

            {/* Luz e volume */}
            <div 
              className="absolute inset-0 pointer-events-none rounded-3xl"
              style={{
                background: `
                  radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.6), transparent 50%),
                  radial-gradient(ellipse at 70% 70%, rgba(0,0,0,0.08), transparent 50%)
                `
              }}
            />
          </div>

          {/* Lateral da almofada (profundidade) */}
          <div 
            className="absolute -right-4 top-4 bottom-4 w-6 rounded-r-3xl"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.15))',
              transform: 'rotateY(90deg) translateZ(-10px)',
              transformOrigin: 'left'
            }}
          />
          <div 
            className="absolute left-4 right-4 -bottom-4 h-6 rounded-b-3xl"
            style={{
              background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.15))',
              transform: 'rotateX(-90deg) translateZ(-10px)',
              transformOrigin: 'top'
            }}
          />
        </div>
      </motion.div>

      {/* Sombra no chão/sofá */}
      <motion.div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 w-80 h-20 rounded-full blur-3xl"
        style={{ 
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.35), transparent)',
          transform: 'rotateX(85deg)'
        }}
        animate={{ 
          scale: [1, 1.08, 1],
          opacity: [0.35, 0.45, 0.35]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
    </motion.div>
  );
}