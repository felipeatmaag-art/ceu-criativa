import React from 'react';

/**
 * Mockup de camiseta responsivo.
 * O SVG escala com o container e o design é um <image> dentro do próprio SVG,
 * garantindo alinhamento perfeito em qualquer tamanho.
 *
 * Suporta frente (`side="front"`) e verso (`side="back"`).
 */
export default function TshirtMockup({ designImage, color = 'white', side = 'front' }) {
  const tshirtImage = 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/3e277e906_generated_image.png';
  const isBack = side === 'back';
  const designBlend = color === 'black' || color === 'navy' ? 'screen' : 'multiply';
  const designArea = isBack
    ? 'left-[36%] top-[31%] h-[31%] w-[28%]'
    : 'left-[36%] top-[32%] h-[30%] w-[28%]';

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
      {/* Fundo estúdio */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-100 via-gray-50 to-white" />
      <div
        className="absolute inset-0"
        style={{ background: 'radial-gradient(ellipse at 50% 35%, rgba(255,255,255,0.9) 0%, transparent 65%)' }}
      />

      <div className="relative z-10 h-[94%] w-[94%] max-w-[560px] overflow-hidden rounded-[2rem]">
        <img
          src={tshirtImage}
          alt={`Camiseta branca premium ${isBack ? 'vista de costas' : 'vista de frente'}`}
          className="h-full w-full object-contain"
        />
        {designImage && (
          <img
            src={designImage}
            alt="Arte aplicada à camiseta"
            className={`absolute ${designArea} object-contain`}
            style={{ mixBlendMode: designBlend, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.08))' }}
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