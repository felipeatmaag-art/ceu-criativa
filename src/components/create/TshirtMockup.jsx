import React from 'react';

/**
 * Mockup de camiseta responsivo.
 * O SVG escala com o container e o design é um <image> dentro do próprio SVG,
 * garantindo alinhamento perfeito em qualquer tamanho.
 *
 * Suporta frente (`side="front"`) e verso (`side="back"`).
 */
export default function TshirtMockup({ designImage, color = 'white', side = 'front' }) {
  const palette = {
    white: { body: '#ffffff', shadow: '#e8e8e8', collar: '#dcdcdc', seam: 'rgba(0,0,0,0.06)' },
    black: { body: '#1c1c1c', shadow: '#0a0a0a', collar: '#2a2a2a', seam: 'rgba(255,255,255,0.08)' },
    navy:  { body: '#1e3a8a', shadow: '#162d6d', collar: '#2747a0', seam: 'rgba(255,255,255,0.08)' },
    gray:  { body: '#6b7280', shadow: '#4b5563', collar: '#7c8694', seam: 'rgba(255,255,255,0.08)' },
  };
  const c = palette[color] || palette.white;
  const isBack = side === 'back';

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Fundo estúdio */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-white" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.9) 0%, transparent 65%)' }}
      />

      <svg
        viewBox="0 0 500 500"
        preserveAspectRatio="xMidYMid meet"
        className="relative z-10 h-[94%] w-[94%] drop-shadow-[0_22px_34px_rgba(15,23,42,0.22)]"
        role="img"
        aria-label={`Camiseta ${isBack ? 'vista de costas' : 'vista de frente'}`}
      >
        <defs>
          <linearGradient id={`tshirt-body-${side}`} x1="0%" y1="15%" x2="100%" y2="85%">
            <stop offset="0%" stopColor={c.shadow} />
            <stop offset="18%" stopColor={c.body} />
            <stop offset="52%" stopColor={c.body} />
            <stop offset="84%" stopColor={c.body} />
            <stop offset="100%" stopColor={c.shadow} />
          </linearGradient>
          <linearGradient id={`tshirt-sleeve-l-${side}`} x1="100%" y1="20%" x2="0%" y2="90%">
            <stop offset="0%" stopColor={c.body} />
            <stop offset="100%" stopColor={c.shadow} />
          </linearGradient>
          <linearGradient id={`tshirt-sleeve-r-${side}`} x1="0%" y1="20%" x2="100%" y2="90%">
            <stop offset="0%" stopColor={c.body} />
            <stop offset="100%" stopColor={c.shadow} />
          </linearGradient>
          <linearGradient id={`tshirt-center-light-${side}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <clipPath id={`design-clip-${side}`}>
            <rect x="180" y="175" width="140" height="165" rx="4" />
          </clipPath>
          <clipPath id={`body-clip-${side}`}>
            <path d="M170 92 C188 72 207 61 226 56 C233 76 241 84 250 84 C259 84 267 76 274 56 C293 61 312 72 330 92 L350 188 L345 438 C315 451 285 456 250 456 C215 456 185 451 155 438 L150 188 Z" />
          </clipPath>
        </defs>

        {/* Manga esquerda */}
        <path
          d="M171 91 C145 94 116 104 78 124 C69 129 66 139 70 149 L99 220 C103 230 113 234 123 230 L157 216 L171 165 Z"
          fill={`url(#tshirt-sleeve-l-${side})`}
          stroke={c.seam}
          strokeWidth="1.5"
        />
        {/* Manga direita */}
        <path
          d="M329 91 C355 94 384 104 422 124 C431 129 434 139 430 149 L401 220 C397 230 387 234 377 230 L343 216 L329 165 Z"
          fill={`url(#tshirt-sleeve-r-${side})`}
          stroke={c.seam}
          strokeWidth="1.5"
        />

        {/* Corpo com proporção real de camiseta */}
        <path
          d="M170 92 C188 72 207 61 226 56 C233 76 241 84 250 84 C259 84 267 76 274 56 C293 61 312 72 330 92 C337 112 343 143 350 188 L345 438 C315 451 285 456 250 456 C215 456 185 451 155 438 L150 188 C157 143 163 112 170 92 Z"
          fill={`url(#tshirt-body-${side})`}
          stroke={c.seam}
          strokeWidth="1.5"
        />

        {/* Gola */}
        {isBack ? (
          <>
            <path d="M224 56 C232 63 240 66 250 66 C260 66 268 63 276 56 C272 78 263 88 250 88 C237 88 228 78 224 56 Z" fill={c.collar} />
            <path d="M226 59 C234 69 242 73 250 73 C258 73 266 69 274 59" stroke={c.seam} strokeWidth="2" fill="none" />
          </>
        ) : (
          <>
            <path d="M224 56 C232 63 240 66 250 66 C260 66 268 63 276 56 C272 84 263 98 250 98 C237 98 228 84 224 56 Z" fill={c.collar} />
            <path d="M226 59 C233 77 241 88 250 88 C259 88 267 77 274 59" stroke={c.seam} strokeWidth="2" fill="none" />
          </>
        )}

        {/* Volume e caimento do tecido */}
        <rect x="155" y="95" width="190" height="355" fill={`url(#tshirt-center-light-${side})`} clipPath={`url(#body-clip-${side})`} />
        <path d="M165 205 C177 225 179 260 173 306" stroke={c.seam} strokeWidth="2" fill="none" opacity="0.55" />
        <path d="M335 205 C323 225 321 260 327 306" stroke={c.seam} strokeWidth="2" fill="none" opacity="0.55" />
        <path d="M158 432 C218 444 282 444 342 432" stroke={c.seam} strokeWidth="2" fill="none" />
        <path d="M92 207 C109 211 127 207 145 198" stroke={c.seam} strokeWidth="2" fill="none" />
        <path d="M408 207 C391 211 373 207 355 198" stroke={c.seam} strokeWidth="2" fill="none" />

        {designImage && (
          <>
            <rect x="180" y="175" width="140" height="165" rx="4" fill="rgba(0,0,0,0.035)" />
            <image
              href={designImage}
              x="180"
              y="175"
              width="140"
              height="165"
              preserveAspectRatio="xMidYMid meet"
              clipPath={`url(#design-clip-${side})`}
              style={{ filter: color === 'black' || color === 'navy' ? 'brightness(1.08) contrast(1.05)' : 'none' }}
            />
            <rect x="180" y="175" width="140" height="165" rx="4" fill="rgba(255,255,255,0.035)" clipPath={`url(#design-clip-${side})`} />
          </>
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