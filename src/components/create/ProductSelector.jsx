import React from 'react';
import { Shirt, Coffee, Frame } from 'lucide-react';

const icons = { camiseta: Shirt, baby_look: Shirt, caneca: Coffee, quadro: Frame };

export default function ProductSelector({ products, prices, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {products.map((product) => {
        const Icon = icons[product.value];
        const selected = value === product.value;
        return (
          <button
            key={product.value}
            type="button"
            onClick={() => onChange(product.value)}
            className={`group rounded-2xl border p-5 text-left transition-all active:scale-95 ${selected ? 'border-ceu-navy bg-ceu-navy text-ceu-cloud shadow-lg' : 'border-ceu-navy/15 bg-card text-ceu-navy hover:border-ceu-navy/40'}`}
          >
            <Icon className={`mb-8 h-7 w-7 ${selected ? 'text-ceu-cloud' : 'text-ceu-navy'}`} strokeWidth={1.5} />
            <span className="block text-sm font-bold">{product.label}</span>
            <span className={`mt-1 block text-xs ${selected ? 'text-ceu-cloud/65' : 'text-ceu-navy/50'}`}>R$ {prices[product.value].toFixed(2)}</span>
          </button>
        );
      })}
    </div>
  );
}