import React from 'react';

export default function CatalogProductMockup({ product, side = 'front' }) {
  const image = side === 'back' ? product.back_model_url || product.front_model_url : product.front_model_url;
  return <div className="flex h-full w-full items-center justify-center bg-ceu-cloud p-4"><img src={image} alt={`${product.name} ${side === 'back' ? 'costas' : 'frente'}`} draggable={false} className="h-full w-full object-contain" /></div>;
}