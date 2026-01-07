import React from 'react';
import { motion } from 'framer-motion';

export default function MugMockup({ designImage }) {
  return (
    <motion.div
      initial={{ opacity: 0, rotateY: -90 }}
      animate={{ opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full h-full flex items-center justify-center"
      whileHover={{ scale: 1.05 }}
    >
      {/* Fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-yellow-50 to-pink-100 rounded-2xl" />
      
      {/* Vapor da caneca (animado) */}
      <motion.div
        className="absolute top-12 left-1/2 -translate-x-1/2 w-24 h-32 opacity-40"
        animate={{
          y: [-20, -60],
          opacity: [0.4, 0],
          scale: [1, 1.5]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
      >
        <div className="w-full h-full bg-gradient-to-t from-gray-300 to-transparent blur-xl rounded-full" />
      </motion.div>

      {/* Caneca */}
      <motion.div
        className="relative z-10"
        animate={{ 
          rotateY: [0, -8, 0],
          y: [0, -8, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div className="relative">
          {/* Corpo da caneca */}
          <div className="relative w-48 h-56 bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Borda superior */}
            <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-100 to-white" />
            
            {/* Design na caneca */}
            <motion.div
              className="absolute top-12 left-1/2 -translate-x-1/2 w-36 h-36 flex items-center justify-center p-2"
              whileHover={{ scale: 1.15, rotateZ: 5 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={designImage}
                alt="Design"
                className="w-full h-full object-contain drop-shadow-xl"
              />
            </motion.div>

            {/* Reflexo de luz */}
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                background: 'linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.6) 40%, transparent 60%)'
              }}
            />
            
            {/* Sombra interna */}
            <div 
              className="absolute inset-0 rounded-2xl pointer-events-none"
              style={{
                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>

          {/* Alça da caneca */}
          <motion.div
            className="absolute top-16 -right-6 w-12 h-20 border-8 border-white rounded-r-full shadow-xl"
            style={{
              borderLeftColor: 'transparent',
              filter: 'drop-shadow(-4px 4px 8px rgba(0,0,0,0.2))'
            }}
            animate={{ rotateZ: [0, -5, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
          />

          {/* Sombra da caneca */}
          <motion.div
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-8 bg-black/20 rounded-full blur-xl"
            animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}