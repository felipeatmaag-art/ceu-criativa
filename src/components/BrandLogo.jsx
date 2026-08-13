import React from 'react';

/**
 * Logotipo da marca Céu (arquivo SVG oficial).
 * Renderiza o SVG vetorial, que escala com nitidez em qualquer tamanho.
 */
const LOGO_URL = 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/df6e955fb_logo.svg';

export default function BrandLogo({ size = 'md', className = '' }) {
  const heights = { sm: 'h-8', md: 'h-10', lg: 'h-14' };
  const h = heights[size] || heights.md;

  return (
    <img
      src={LOGO_URL}
      alt="Céu"
      className={`${h} w-auto ${className}`}
    />
  );
}