import React from 'react';

/**
 * Mockup de caneca responsivo.
 * SVG escala com o container; o design é um <image> dentro do SVG.
 */
export default function MugMockup({ designImage }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Fundo ambiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/40 to-stone-100" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 40% 30%, rgba(255,255,255,0.7) 0%, transparent 55%)' }}
      />

      <svg
        viewBox="0 0 340 360"
        preserveAspectRatio="xMidYMid meet"
        className="relative z-10 w-full h-full drop-shadow-[0_25px_35px_rgba(0,0,0,0.25)]"
      >
        <defs>
          <linearGradient id="mug-body" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="35%" stopColor="#fafafa" />
            <stop offset="70%" stopColor="#f0f0f0" />
            <stop offset="100%" stopColor="#e0e0e0" />
          </linearGradient>
          <linearGradient id="mug-handle" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e8e8e8" />
            <stop offset="50%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#dcdcdc" />
          </linearGradient>
          <linearGradient id="mug-rim" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d8d8d8" />
            <stop offset="100%" stopColor="#f5f5f5" />
          </linearGradient>
          <clipPath id="mug-design-clip">
            <rect x="70" y="110" width="150" height="130" rx="4" />
          </clipPath>
        </defs>

        {/* Alça */}
        <path
          d="M 265 110 C 310 110, 330 150, 330 195 C 330 240, 310 280, 265 280"
          fill="none"
          stroke="url(#mug-handle)"
          strokeWidth="22"
          strokeLinecap="round"
        />
        <path
          d="M 265 116 C 303 116, 320 152, 320 195 C 320 238, 303 274, 265 274"
          fill="none"
          stroke="rgba(0,0,0,0.08)"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Corpo da caneca */}
        <path
          d="M 70 100
             L 70 270
             C 70 295, 95 305, 165 305
             C 235 305, 260 295, 260 270
             L 260 100
             C 260 94, 250 88, 165 88
             C 80 88, 70 94, 70 100 Z"
          fill="url(#mug-body)"
        />

        {/* Borda superior (topo da caneca) */}
        <ellipse cx="165" cy="95" rx="98" ry="20" fill="url(#mug-rim)" />
        {/* Interior */}
        <ellipse cx="165" cy="96" rx="90" ry="16" fill="#2a1a0a" />
        {/* Café */}
        <ellipse cx="165" cy="98" rx="82" ry="13" fill="#3d2817" />
        <ellipse cx="150" cy="96" rx="22" ry="4" fill="rgba(255,255,255,0.12)" />

        {/* Reflexo vertical esquerdo */}
        <path d="M 88 120 L 88 255 C 88 265, 96 270, 105 270" stroke="rgba(255,255,255,0.55)" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M 100 130 L 100 210" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Design aplicado */}
        {designImage && (
          <image
            href={designImage}
            x="70"
            y="110"
            width="150"
            height="130"
            preserveAspectRatio="xMidYMid meet"
            clipPath="url(#mug-design-clip)"
          />
        )}
      </svg>

      {/* Sombra no chão */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-44 h-8 rounded-full blur-2xl bg-black/20" />

      {/* Badge */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
        <span className="text-xs font-medium text-gray-600">Cerâmica Premium</span>
      </div>
    </div>
  );
}