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
        viewBox="0 0 400 480"
        preserveAspectRatio="xMidYMid meet"
        className="relative z-10 h-full w-auto max-w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.18)]"
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
            <rect x="145" y="170" width="110" height="140" rx="6" />
          </clipPath>
        </defs>

        {/* Manga esquerda */}
        <path
          d="M 145 95 L 95 105 C 80 112, 76 135, 82 155 L 118 162 C 126 145, 136 125, 145 108 Z"
          fill="url(#tshirt-sleeve-l)"
        />
        {/* Manga direita */}
        <path
          d="M 255 95 L 305 105 C 320 112, 324 135, 318 155 L 282 162 C 274 145, 264 125, 255 108 Z"
          fill="url(#tshirt-sleeve-r)"
        />

        {/* Corpo */}
        <path
          d="M 145 95
             C 145 80, 165 65, 180 60
             L 192 55
             C 198 52, 202 52, 208 55
             L 220 60
             C 235 65, 255 80, 255 95
             L 278 165
             L 275 180
             L 270 450
             C 270 460, 263 465, 252 465
             L 148 465
             C 137 465, 130 460, 130 450
             L 125 180
             L 122 165
             Z"
          fill="url(#tshirt-body)"
        />

        {/* Gola */}
        <path
          d="M 180 60 C 188 73, 196 79, 200 79 C 204 79, 212 73, 220 60 C 216 55, 208 51, 200 51 C 192 51, 184 55, 180 60 Z"
          fill={c.collar}
        />
        <path
          d="M 178 62 C 188 75, 196 81, 200 81 C 204 81, 212 75, 222 62"
          stroke={c.seam}
          strokeWidth="1.5"
          fill="none"
        />

        {/* Costuras laterais */}
        <line x1="136" y1="180" x2="133" y2="450" stroke={c.seam} strokeWidth="1" strokeDasharray="3 3" />
        <line x1="264" y1="180" x2="267" y2="450" stroke={c.seam} strokeWidth="1" strokeDasharray="3 3" />

        {/* Highlight de luz */}
        <path d="M 155 105 C 168 135, 175 175, 170 250 L 160 250 C 156 175, 148 135, 140 105 Z" fill="rgba(255,255,255,0.10)" />

        {/* Sombra suave da estampa no tecido */}
        {designImage && (
          <rect x="145" y="170" width="110" height="140" rx="6" fill="rgba(0,0,0,0.03)" />
        )}

        {/* Design aplicado (dentro do SVG) */}
        {designImage && (
          <image
            href={designImage}
            x="145"
            y="170"
            width="110"
            height="140"
            preserveAspectRatio="xMidYMid meet"
            clipPath="url(#design-clip)"
            style={{ filter: color === 'black' || color === 'navy' ? 'brightness(1.08) contrast(1.05)' : 'none' }}
          />
        )}

        {/* Textura sutil do tecido sobre a estampa */}
        {designImage && (
          <rect x="145" y="170" width="110" height="140" rx="6" fill="rgba(255,255,255,0.04)" clipPath="url(#design-clip)" />
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