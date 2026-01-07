import React from 'react';
import { motion } from 'framer-motion';

export default function FrameMockup({ designImage }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, rotateX: -20 }}
      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-full flex items-center justify-center"
      whileHover={{ scale: 1.03, rotateY: 5 }}
      style={{ perspective: '1000px' }}
    >
      {/* Fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-slate-100 rounded-2xl" />
      
      {/* Parede texturizada */}
      <div 
        className="absolute inset-0 opacity-10 rounded-2xl"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%239C92AC" fill-opacity="0.4"%3E%3Cpath d="M0 0h20L0 20z"/%3E%3C/g%3E%3C/svg%3E")'
        }}
      />

      {/* Quadro */}
      <motion.div
        className="relative z-10"
        animate={{ 
          y: [0, -15, 0],
          rotateZ: [0, -1, 0, 1, 0]
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Moldura externa */}
        <div className="relative p-6 bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-lg shadow-2xl">
          {/* Moldura interna (efeito chanfrado) */}
          <div className="relative p-3 bg-gradient-to-br from-gray-700 to-gray-800 rounded-sm">
            {/* Imagem do design */}
            <motion.div
              className="relative w-64 h-64 bg-white rounded-sm overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={designImage}
                alt="Design"
                className="w-full h-full object-cover"
              />
              
              {/* Vidro protetor (reflexo) */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.2) 100%)'
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
                }}
                transition={{ duration: 8, repeat: Infinity }}
              />
            </motion.div>

            {/* Borda interna dourada */}
            <div 
              className="absolute inset-2 pointer-events-none rounded-sm"
              style={{
                boxShadow: 'inset 0 0 0 1px rgba(255,215,0,0.3)'
              }}
            />
          </div>

          {/* Detalhes da moldura (cantos decorativos) */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-amber-600/50 rounded-tl" />
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-amber-600/50 rounded-tr" />
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-amber-600/50 rounded-bl" />
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-amber-600/50 rounded-br" />
        </div>

        {/* Gancho na parede */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-3 bg-gray-400 rounded-t-full shadow-md" />
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-1 h-4 bg-gray-500" />

        {/* Sombra do quadro */}
        <motion.div
          className="absolute inset-0 -z-10 rounded-lg blur-2xl"
          style={{
            background: 'rgba(0,0,0,0.4)',
            transform: 'translateY(20px) translateZ(-10px) scale(0.95)'
          }}
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scale: [0.95, 1, 0.95]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        />
      </motion.div>
    </motion.div>
  );
}