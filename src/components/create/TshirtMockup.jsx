import React from 'react';

/**
 * Mockup de camiseta responsivo.
 * O SVG escala com o container e o design é um <image> dentro do próprio SVG,
 * garantindo alinhamento perfeito em qualquer tamanho.
 */
export default function TshirtMockup({ designImage, color = 'white' }) {
  const palette = {
    white: { body: '#ffffff', shadow: '#e8e8e8', collar: '#dcdcdc', seam: 'rgba(0,0,0,0.06)' },
    black: { body: '#1c1c1c', shadow: '#0a0a0a', collar: '#2a2a2a', seam: 'rgba(255,255,255,0.08)' },
    navy:  { body: '#1e3a8a', shadow: '#162d6d', collar: '#2747a0', seam: 'rgba(255,255,255,0.08)' },
    gray:  { body: '#6b7280', shadow: '#4b5563', collar: '#7c8694', seam: 'rgba(255,255,255,0.08)' },
  };
  const c = palette[color] || palette.white;

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Fundo estúdio */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-white" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.9) 0%, transparent 65%)' }}
      />

      <svg
        viewBox="0 0 400 420"
        preserveAspectRatio="xMidYMid meet"
        className="relative z-10 w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
      >
        <defs>
          <linearGradient id="tshirt-body" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c.body} />
            <stop offset="55%" stopColor={c.body} />
            <stop offset="100%" stopColor={c.shadow} />
          </linearGradient>
          <linearGradient id="tshirt-sleeve-l" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={c.body} />
            <stop offset="100%" stopColor={c.shadow} />
          </linearGradient>
          <linearGradient id="tshirt-sleeve-r" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.body} />
            <stop offset="100%" stopColor={c.shadow} />
          </linearGradient>
          <clipPath id="design-clip">
            <rect x="140" y="150" width="120" height="130" rx="6" />
          </clipPath>
        </defs>

        {/* Manga esquerda */}
        <path
          d="M 120 90 L 60 110 C 40 120, 38 150, 50 175 L 95 185 C 105 165, 115 140, 120 110 Z"
          fill="url(#tshirt-sleeve-l)"
        />
        {/* Manga direita */}
        <path
          d="M 280 90 L 340 110 C 360 120, 362 150, 350 175 L 305 185 C 295 165, 285 140, 280 110 Z"
          fill="url(#tshirt-sleeve-r)"
        />

        {/* Corpo */}
        <path
          d="M 120 90
             C 120 75, 145 60, 170 55
             L 185 50
             C 195 47, 205 47, 215 50
             L 230 55
             C 255 60, 280 75, 280 90
             L 305 185
             L 300 200
             L 295 390
             C 295 400, 287 405, 275 405
             L 125 405
             C 113 405, 105 400, 105 390
             L 100 200
             L 95 185
             Z"
          fill="url(#tshirt-body)"
        />

        {/* Gola */}
        <path
          d="M 170 55 C 180 68, 195 74, 200 74 C 205 74, 220 68, 230 55 C 225 50, 213 46, 200 46 C 187 46, 175 50, 170 55 Z"
          fill={c.collar}
        />
        <path
          d="M 168 57 C 180 70, 195 76, 200 76 C 205 76, 220 70, 232 57"
          stroke={c.seam}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Costuras laterais */}
        <line x1="112" y1="200" x2="108" y2="395" stroke={c.seam} strokeWidth="1" strokeDasharray="3 3" />
        <line x1="288" y1="200" x2="292" y2="395" stroke={c.seam} strokeWidth="1" strokeDasharray="3 3" />

        {/* Highlight de luz */}
        <path d="M 135 100 C 150 130, 158 170, 152 240 L 142 240 C 138 170, 130 130, 120 100 Z" fill="rgba(255,255,255,0.10)" />

        {/* Design aplicado (dentro do SVG) */}
        {designImage && (
          <image
            href={designImage}
            x="140"
            y="150"
            width="120"
            height="130"
            preserveAspectRatio="xMidYMid meet"
            clipPath="url(#design-clip)"
            style={{ filter: color === 'black' || color === 'navy' ? 'brightness(1.08)' : 'none' }}
          />
        )}
      </svg>

      {/* Sombra no chão */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-56 h-6 rounded-full blur-2xl bg-black/15" />

      {/* Badge */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
        <span className="text-xs font-medium text-gray-600">100% Algodão Premium</span>
      </div>
    </div>
  );
}