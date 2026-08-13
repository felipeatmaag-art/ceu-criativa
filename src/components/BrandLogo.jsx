import React from 'react';

/**
 * Logotipo da marca Cei.
 * Wordmark com gradiente turquesa -> azul céu e tagline "vc também vai" em amarelo dourado.
 */
export default function BrandLogo({ size = 'md', showTagline = true, className = '' }) {
  const sizes = {
    sm: { word: 'text-2xl', tag: 'text-[9px]', tracking: 'tracking-[0.2em]' },
    md: { word: 'text-3xl', tag: 'text-[10px]', tracking: 'tracking-[0.25em]' },
    lg: { word: 'text-5xl', tag: 'text-sm', tracking: 'tracking-[0.3em]' },
  };
  const s = sizes[size] || sizes.md;

  return (
    <div className={`flex flex-col items-start leading-none ${className}`}>
      <span
        className={`${s.word} font-bold tracking-tight`}
        style={{
          background: 'linear-gradient(135deg, #47B5A7 0%, #70C6EA 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          fontFamily: "'Segoe UI', 'Nunito', system-ui, sans-serif",
        }}
      >
        Cei
      </span>
      {showTagline && (
        <span
          className={`${s.tag} font-semibold ${s.tracking} mt-0.5`}
          style={{ color: '#FFC72C' }}
        >
          vc também vai
        </span>
      )}
    </div>
  );
}