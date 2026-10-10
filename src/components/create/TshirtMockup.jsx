import React from 'react';

/**
 * Mockup de camiseta responsivo e fotorrealista.
 * Utiliza mockups dedicados de alta definição para cada cor (Branca, Preta, Azul Marinho, Cinza),
 * eliminando qualquer recorte artificial de clip-path ou manchas em mangas/golas.
 *
 * Suporta frente (`side="front"`) e verso (`side="back"`).
 */
export default function TshirtMockup({ designImage, color = 'white', side = 'front' }) {
  const normColor = (color || '').toString().toLowerCase().trim();
  const isBack = side === 'back';

  let tshirtImage;
  let isDark = false;

  if (normColor.includes('navy') || normColor.includes('azul')) {
    tshirtImage = isBack ? '/mockups/tshirt-navy-back.jpg' : '/mockups/tshirt-navy-front.png';
    isDark = true;
  } else if (normColor.includes('gray') || normColor.includes('cinza')) {
    tshirtImage = isBack ? '/mockups/tshirt-gray-back.jpg' : '/mockups/tshirt-gray-front.png';
    isDark = false;
  } else if (normColor.includes('black') || normColor.includes('pret') || normColor.includes('escuro')) {
    tshirtImage = isBack ? '/mockups/tshirt-black-back.jpg' : '/mockups/tshirt-black-front.png';
    isDark = true;
  } else {
    tshirtImage = isBack ? '/mockups/tshirt-white-back.jpg' : '/mockups/tshirt-white-front.png';
    isDark = false;
  }

  const colorLabels = {
    white: 'branca',
    branca: 'branca',
    black: 'preta',
    preta: 'preta',
    navy: 'azul-marinho',
    azul: 'azul-marinho',
    gray: 'cinza',
    cinza: 'cinza'
  };

  const designBlend = isDark ? 'screen' : 'multiply';
  const designArea = isBack
    ? 'left-[35%] top-[25%] h-[35%] w-[30%]'
    : 'left-[35%] top-[30%] h-[33%] w-[30%]';

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Fundo estúdio suave */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-white" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.9) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 h-[94%] w-[94%] max-w-[560px] overflow-hidden rounded-[2rem] flex items-center justify-center">
        <img
          src={tshirtImage}
          alt={`Camiseta ${colorLabels[normColor] || 'personalizada'} ${isBack ? 'vista de costas' : 'vista de frente'}`}
          className="h-full w-full object-contain"
          draggable={false}
        />
        {designImage && (
          <img
            src={designImage}
            alt="Arte aplicada à camiseta"
            className={`absolute ${designArea} object-contain`}
            style={{ mixBlendMode: designBlend, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.08))' }}
            draggable={false}
          />
        )}
      </div>

      {/* Sombra no chão */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-56 h-6 rounded-full blur-2xl bg-black/15" />

      {/* Badge */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
        <span className="text-xs font-medium text-gray-600">100% Algodão Premium</span>
      </div>
    </div>
  );
}
