import React from 'react';
import { motion } from 'framer-motion';

export default function EcobagMockup({ designImage, angle = 'front' }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden"
      style={{ perspective: '1500px' }}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50" />
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0 L60 30 L30 60 L0 30 Z' fill='%2310b981' opacity='0.1'/%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px'
        }}
      />

      {/* Ecobag */}
      <motion.div
        className="relative z-10"
        initial={{ scale: 0.9, rotateY: angle === 'angled' ? -15 : 0 }}
        animate={{ 
          rotateY: angle === 'front' ? [0, -3, 0] : angle === 'angled' ? [-12, -15, -12] : 0,
          y: [0, -10, 0, -8, 0]
        }}
        transition={{ 
          rotateY: { duration: 6, repeat: Infinity, ease: "easeInOut" },
          y: { duration: 5, repeat: Infinity, ease: "easeInOut" }
        }}
        style={{ 
          transformStyle: 'preserve-3d',
          filter: 'drop-shadow(0 25px 45px rgba(0,0,0,0.2))'
        }}
      >
        <div className="relative" style={{ width: '280px', height: '350px' }}>
          {/* Alças */}
          <div className="absolute -top-12 left-16 w-20 h-32">
            <div 
              className="w-full h-full border-8 border-[#f5f1e8] rounded-t-[80px]"
              style={{
                borderBottom: 'none',
                boxShadow: 'inset -2px 2px 8px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)',
                filter: 'brightness(0.95)'
              }}
            />
          </div>
          <div className="absolute -top-12 right-16 w-20 h-32">
            <div 
              className="w-full h-full border-8 border-[#f5f1e8] rounded-t-[80px]"
              style={{
                borderBottom: 'none',
                boxShadow: 'inset 2px 2px 8px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.1)',
                filter: 'brightness(0.92)'
              }}
            />
          </div>

          {/* Corpo da ecobag */}
          <div 
            className="absolute top-0 left-0 right-0 bottom-0 rounded-b-3xl overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #fdfcf9 0%, #f5f1e8 100%)',
              boxShadow: `
                inset -10px 0 25px rgba(0,0,0,0.08),
                inset 10px 0 25px rgba(255,255,255,0.5),
                0 20px 50px rgba(0,0,0,0.15)
              `
            }}
          >
            {/* Design na ecobag */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ width: '200px', height: '200px' }}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.3 }}
            >
              <div 
                className="w-full h-full p-4"
                style={{
                  filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))'
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

            {/* Textura de tecido */}
            <div 
              className="absolute inset-0 opacity-[0.12] pointer-events-none mix-blend-overlay"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='fabricNoise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23fabricNoise)' opacity='0.4'/%3E%3C/svg%3E")`,
                backgroundSize: '80px 80px'
              }}
            />

            {/* Dobras e vincos */}
            <div 
              className="absolute top-1/4 left-4 right-4 h-[1px] bg-black/5"
              style={{ transform: 'rotateZ(-1deg)' }}
            />
            <div 
              className="absolute top-3/4 left-4 right-4 h-[1px] bg-black/5"
              style={{ transform: 'rotateZ(1deg)' }}
            />

            {/* Luz e sombras */}
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(130deg, rgba(255,255,255,0.6) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.2) 100%)'
              }}
            />
            
            {/* Sombra lateral */}
            <div 
              className="absolute right-0 top-0 bottom-0 w-20 pointer-events-none"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08))'
              }}
            />
          </div>

          {/* Base da ecobag */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-4 rounded-b-3xl"
            style={{
              background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.1))',
              boxShadow: 'inset 0 -2px 6px rgba(0,0,0,0.15)'
            }}
          />
        </div>
      </motion.div>

      {/* Sombra no chão */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-72 h-16 rounded-full blur-2xl"
        style={{ 
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.25), transparent)',
          transform: 'rotateX(80deg)'
        }}
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.4, 0.3]
        }}
        transition={{ duration: 5, repeat: Infinity }}
      />
    </motion.div>
  );
}