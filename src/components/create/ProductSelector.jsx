import React from 'react';
import { Shirt, Coffee, Frame, ShoppingBag, Badge } from 'lucide-react';

const icons = { camiseta: Shirt, baby_look: Shirt, caneca: Coffee, quadro: Frame, ecobag: ShoppingBag, logo_uniforme: Badge };

export default function ProductSelector({ products, value, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {products.map((product) => {
        const Icon = icons[product.type || product.value] || Shirt;
        const selected = value === product.value;
        return (
          <button
            key={product.value}
            type="button"
            onClick={() => onChange(product.value)}
            className={`group rounded-2xl border p-5 text-left transition-all active:scale-95 ${selected ? 'border-ceu-navy bg-ceu-navy text-ceu-cloud shadow-lg' : 'border-ceu-navy/15 bg-card text-ceu-navy hover:border-ceu-navy/40'}`}
          >
            {product.image ? <img src={product.image} alt="" className="mb-4 h-16 w-full rounded-xl bg-ceu-cloud object-contain" /> : <Icon className={`mb-8 h-7 w-7 ${selected ? 'text-ceu-cloud' : 'text-ceu-navy'}`} strokeWidth={1.5} />}
            <span className="block text-sm font-bold">{product.label}</span>
            <span className={`mt-1 block text-xs ${selected ? 'text-ceu-cloud/65' : 'text-ceu-navy/50'}`}>R$ {Number(product.price).toFixed(2)}</span>
          </button>
        );
      })}
    </div>
  );
}