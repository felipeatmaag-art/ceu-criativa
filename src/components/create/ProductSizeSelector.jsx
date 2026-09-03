import React from 'react';
import { Label } from '@/components/ui/label';

export default function ProductSizeSelector({ options, value, onChange }) {
  return (
    <div>
      <Label className="mb-3 block text-sm font-semibold text-gray-900">Tamanho</Label>
      <div className="flex flex-wrap gap-3">
        {options.map((size) => (
          <button
            key={size}
            type="button"
            onClick={() => onChange(size)}
            aria-pressed={value === size}
            className={`min-w-12 rounded-full border px-4 py-3 text-sm font-semibold transition-all active:scale-95 ${value === size ? 'border-ceu-navy bg-ceu-navy text-ceu-cloud' : 'border-ceu-navy/15 bg-card text-ceu-navy hover:border-ceu-navy/40'}`}
          >
            {size}
          </button>
        ))}
      </div>
    </div>
  );
}