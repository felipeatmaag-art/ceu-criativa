import React from 'react';
import { motion } from 'framer-motion';

export default function MugInHandMockup({ designImage }) {
  if (!designImage) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative w-full h-full flex items-center justify-center overflow-hidden rounded-2xl"
    >
      {/* Background - ambiente aconchegante */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-50" />
      
      {/* Textura bokeh/desfoque */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Luz suave ambiente */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.9) 0%, transparent 55%)'
        }}
      />

      <motion.div
        className="relative z-10"
        animate={{ 
          y: [0, -6, 0],
          rotate: [0, 1, 0]
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        style={{ 
          filter: 'drop-shadow(0 30px 50px rgba(0,0,0,0.25))'
        }}
      >
        <svg 
          width="360" 
          height="420" 
          viewBox="0 0 360 420" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="handSkin" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f4c6a8" />
              <stop offset="50%" stopColor="#e8b298" />
              <stop offset="100%" stopColor="#dda588" />
            </linearGradient>

            <linearGradient id="mugInHand" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#fafafa" />
              <stop offset="100%" stopColor="#f0f0f0" />
            </linearGradient>

            <linearGradient id="coffee" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6f4e37" />
              <stop offset="100%" stopColor="#4a3123" />
            </linearGradient>

            <filter id="handShadow">
              <feDropShadow dx="0" dy="15" stdDeviation="20" floodColor="#000" floodOpacity="0.3"/>
            </filter>

            <radialGradient id="steamGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* Vapor saindo da caneca */}
          {[...Array(5)].map((_, i) => (
            <motion.ellipse
              key={i}
              cx={165 + (i - 2) * 8}
              cy={90}
              rx="8"
              ry="15"
              fill="url(#steamGradient)"
              initial={{ opacity: 0, y: 0 }}
              animate={{
                opacity: [0, 0.5, 0],
                y: [-10, -60],
                scale: [0.8, 1.3]
              }}
              transition={{
                duration: 2.5,
                delay: i * 0.4,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          ))}

          {/* Antebraço */}
          <path
            d="M 20 350
               C 20 330, 30 310, 50 300
               L 100 280
               C 120 275, 140 280, 150 295
               L 170 320
               C 175 330, 180 345, 180 360
               L 180 400
               C 180 410, 170 415, 160 415
               L 40 415
               C 25 415, 20 410, 20 400
               Z"
            fill="url(#handSkin)"
            filter="url(#handShadow)"
          />

          {/* Mão - palma */}
          <path
            d="M 140 250
               C 130 240, 125 230, 125 220
               L 130 180
               C 132 170, 140 165, 150 165
               L 180 165
               C 190 165, 198 170, 200 180
               L 205 220
               C 205 235, 195 250, 180 260
               L 150 260
               C 145 260, 142 255, 140 250
               Z"
            fill="url(#handSkin)"
            filter="url(#handShadow)"
          />

          {/* Dedos segurando a alça */}
          {/* Polegar */}
          <path
            d="M 125 220
               C 115 215, 105 210, 100 200
               L 95 175
               C 93 165, 100 160, 110 160
               L 125 165
               C 128 165, 130 170, 130 180
               L 130 210
               C 130 215, 128 218, 125 220
               Z"
            fill="url(#handSkin)"
          />

          {/* Indicador na alça */}
          <path
            d="M 205 200
               C 210 195, 218 192, 225 192
               L 240 195
               C 245 196, 248 200, 248 205
               L 247 225
               C 247 230, 243 233, 238 233
               L 220 230
               C 215 229, 210 225, 208 220
               L 205 205
               Z"
            fill="url(#handSkin)"
          />

          {/* Caneca - corpo principal */}
          <path
            d="M 130 120
               L 125 300
               C 125 310, 135 315, 150 315
               L 210 315
               C 225 315, 235 310, 235 300
               L 230 120
               C 230 110, 220 105, 200 105
               L 160 105
               C 140 105, 130 110, 130 120
               Z"
            fill="url(#mugInHand)"
            filter="url(#handShadow)"
          />

          {/* Borda da caneca */}
          <ellipse 
            cx="180" 
            cy="115" 
            rx="55" 
            ry="15"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="4"
          />

          {/* Interior - café */}
          <ellipse 
            cx="180" 
            cy="120" 
            rx="50" 
            ry="12"
            fill="url(#coffee)"
          />
          
          {/* Reflexo no café */}
          <ellipse 
            cx="165" 
            cy="118" 
            rx="18" 
            ry="4"
            fill="rgba(255,255,255,0.2)"
          />

          {/* Alça da caneca */}
          <path
            d="M 235 150
               C 260 150, 275 175, 275 210
               C 275 245, 260 270, 235 270"
            fill="none"
            stroke="#e8e8e8"
            strokeWidth="18"
            strokeLinecap="round"
          />
          
          {/* Sombra interna da alça */}
          <path
            d="M 237 160
               C 255 160, 267 180, 267 210
               C 267 240, 255 260, 237 260"
            fill="none"
            stroke="rgba(0,0,0,0.05)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Reflexos na caneca */}
          <path
            d="M 140 130 L 140 290 C 140 295, 145 298, 150 298"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="8"
            strokeLinecap="round"
            fill="none"
          />

          <path
            d="M 155 140 L 155 260"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Sombras e detalhes nos dedos */}
          <path
            d="M 130 185 C 132 190, 135 193, 140 193"
            stroke="rgba(0,0,0,0.1)"
            strokeWidth="2"
            fill="none"
          />

          {/* Unha do polegar */}
          <ellipse 
            cx="115" 
            cy="168" 
            rx="5" 
            ry="6"
            fill="rgba(255,255,255,0.3)"
          />

          {/* Linha de dobra da mão */}
          <path
            d="M 145 250 C 155 252, 165 252, 175 250"
            stroke="rgba(0,0,0,0.08)"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>

        {/* Design/Estampa na caneca */}
        <motion.div
          className="absolute flex items-center justify-center"
          style={{ 
            top: '155px',
            left: '50%',
            transform: 'translateX(-52%) rotateY(-5deg)',
            width: '90px',
            height: '100px'
          }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          <img
            src={designImage}
            alt="Design"
            className="w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
              borderRadius: '4px'
            }}
          />
        </motion.div>
      </motion.div>

      {/* Sombra suave no chão */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-56 h-16 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.25), transparent)' }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.35, 0.45, 0.35] }}
        transition={{ duration: 5, repeat: Infinity }}
      />

      <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
        <span className="text-xs font-medium text-gray-600">Momento Café</span>
      </div>
    </motion.div>
  );
}