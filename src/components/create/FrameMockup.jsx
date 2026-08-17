import React from 'react';

/**
 * Mockup de quadro responsivo.
 * Tudo escala junto com o container.
 */
export default function FrameMockup({ designImage }) {
  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Parede */}
      <div className="absolute inset-0 bg-gradient-to-br from-stone-200 via-gray-100 to-neutral-200" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.5) 0%, transparent 55%)' }}
      />

      <svg
        viewBox="0 0 340 340"
        preserveAspectRatio="xMidYMid meet"
        className="relative z-10 w-full h-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
      >
        <defs>
          <linearGradient id="frame-wood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2a1f1a" />
            <stop offset="50%" stopColor="#1a1410" />
            <stop offset="100%" stopColor="#2a1f1a" />
          </linearGradient>
          <linearGradient id="frame-glass" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
            <stop offset="20%" stopColor="transparent" />
            <stop offset="50%" stopColor="transparent" />
            <stop offset="55%" stopColor="rgba(255,255,255,0.15)" />
            <stop offset="60%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </linearGradient>
          <clipPath id="frame-image-clip">
            <rect x="60" y="60" width="220" height="220" rx="2" />
          </clipPath>
          <filter id="frame-inner-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
            <feOffset dx="0" dy="2" result="offsetblur" />
            <feFlood floodColor="rgba(0,0,0,0.25)" />
            <feComposite in2="offsetblur" operator="in" />
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Moldura externa */}
        <rect x="30" y="30" width="280" height="280" rx="3" fill="url(#frame-wood)" />

        {/* Passe-partout */}
        <rect x="50" y="50" width="240" height="240" fill="#f8f6f2" />
        <rect x="50" y="50" width="240" height="240" fill="none" stroke="rgba(180,160,140,0.3)" strokeWidth="1" />

        {/* Imagem */}
        <rect x="60" y="60" width="220" height="220" fill="#ffffff" />
        {designImage && (
          <image
            href={designImage}
            x="60"
            y="60"
            width="220"
            height="220"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#frame-image-clip)"
          />
        )}

        {/* Sombra interna da moldura */}
        <rect x="50" y="50" width="240" height="240" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="3" filter="url(#frame-inner-shadow)" />

        {/* Vidro / reflexo */}
        <rect x="60" y="60" width="220" height="220" fill="url(#frame-glass)" />

        {/* Brilho na moldura */}
        <rect x="30" y="30" width="280" height="70" rx="3" fill="rgba(255,255,255,0.06)" />
      </svg>

      {/* Sombra na parede */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-64 h-6 rounded-full blur-2xl bg-black/15" />

      {/* Badge */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
        <span className="text-xs font-medium text-gray-600">Moldura em Madeira Nobre</span>
      </div>
    </div>
  );
}