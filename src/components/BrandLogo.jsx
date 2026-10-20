import React from 'react';

/**
 * Logotipo da marca Céu (arquivo SVG oficial local no pacote).
 * Utiliza o arquivo local /logo-ceu.svg para máxima velocidade e independência de rede externa.
 */
export default function BrandLogo({ size = 'md', className = '' }) {
  const heights = { sm: 'h-8', md: 'h-10', lg: 'h-14' };
  const h = heights[size] || heights.md;
  return (
    <img
      src="/logo-ceu.svg"
      alt="Céu Criativa"
      className={`${h} w-auto ${className}`}
    />
  );
}
