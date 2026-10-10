import React from 'react';

export default function CatalogProductMockup({ product, side = 'front', color }) {
  const normColor = (color || '').toString().toLowerCase().trim();
  const isApparel = product?.type === 'camiseta' || product?.type === 'baby_look' || (!product?.type && !product);

  const isNavy = normColor.includes('navy') || normColor.includes('azul');
  const isGray = normColor.includes('gray') || normColor.includes('cinza');
  const isBlack = normColor.includes('black') || normColor.includes('pret') || normColor.includes('escuro');

  const variant = product?.product_color_variants?.find((item) => {
    const itemNorm = (item.name || '').toString().toLowerCase().trim();
    if (itemNorm === normColor) return true;
    if (isNavy && (itemNorm.includes('navy') || itemNorm.includes('azul'))) return true;
    if (isGray && (itemNorm.includes('gray') || itemNorm.includes('cinza'))) return true;
    if (isBlack && (itemNorm.includes('black') || itemNorm.includes('pret'))) return true;
    if (!isNavy && !isGray && !isBlack && (itemNorm.includes('branc') || itemNorm.includes('white'))) return true;
    return false;
  });

  let defaultFront = '/mockups/tshirt-white-front.png';
  let defaultBack = '/mockups/tshirt-white-back.jpg';

  if (isNavy) {
    defaultFront = '/mockups/tshirt-navy-front.png';
    defaultBack = '/mockups/tshirt-navy-back.jpg';
  } else if (isGray) {
    defaultFront = '/mockups/tshirt-gray-front.png';
    defaultBack = '/mockups/tshirt-gray-back.jpg';
  } else if (isBlack) {
    defaultFront = '/mockups/tshirt-black-front.png';
    defaultBack = '/mockups/tshirt-black-back.jpg';
  }

  let image;
  if (isApparel) {
    image = side === 'back'
      ? (variant?.back_url || product?.back_model_url || defaultBack)
      : (variant?.front_url || defaultFront);
  } else {
    image = side === 'back'
      ? variant?.back_url || product?.back_model_url || product?.front_model_url
      : variant?.front_url || product?.front_model_url;
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-ceu-cloud p-4">
      <img
        src={image}
        alt={`${product?.name || 'Produto'} ${color || ''} ${side === 'back' ? 'costas' : 'frente'}`}
        draggable={false}
        className="h-full w-full object-contain"
      />
    </div>
  );
}
