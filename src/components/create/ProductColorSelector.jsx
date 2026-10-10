import React from 'react';
import { Label } from '@/components/ui/label';

function isColorSelected(currentVal, colorOption) {
  if (!currentVal || !colorOption) return false;
  if (currentVal === colorOption.name) return true;
  const v = currentVal.toString().toLowerCase().trim();
  const o = (colorOption.name || '').toString().toLowerCase().trim();
  if (v === o) return true;
  if ((v.includes('navy') || v.includes('azul')) && (o.includes('navy') || o.includes('azul'))) return true;
  if ((v.includes('gray') || v.includes('cinza')) && (o.includes('gray') || o.includes('cinza'))) return true;
  if ((v.includes('branc') || v.includes('white')) && (o.includes('branc') || o.includes('white'))) return true;
  if ((v.includes('pret') || v.includes('black')) && (o.includes('pret') || o.includes('black'))) return true;
  return false;
}

export default function ProductColorSelector({ options = [], value, onChange, label = 'Cor do produto', compact = false }) {
  if (compact) {
    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        {options.map((color) => {
          const selected = isColorSelected(value, color);
          return (
            <button
              type="button"
              key={color.name}
              onClick={() => onChange(color.name)}
              className={`relative h-6 w-6 rounded-full border transition-transform hover:scale-110 ${
                selected ? 'ring-2 ring-gray-900 ring-offset-1 scale-105' : 'ring-1 ring-gray-200'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.label || color.name}
              aria-label={color.label || color.name}
            >
              {selected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className={`h-1.5 w-1.5 rounded-full border ${color.hex === '#ffffff' || color.hex === '#FFFFFF' ? 'border-gray-900 bg-gray-900' : 'border-white bg-white'}`} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {label && <Label className="mb-3 block text-sm font-semibold text-gray-900">{label}</Label>}
      <div className="flex flex-wrap gap-3">
        {options.map((color) => {
          const selected = isColorSelected(value, color);
          return (
            <button
              type="button"
              key={color.name}
              onClick={() => onChange(color.name)}
              className={`relative h-12 w-12 rounded-full border transition-transform hover:scale-110 ${
                selected ? 'ring-2 ring-gray-900 ring-offset-2 scale-110 shadow-md' : 'ring-1 ring-gray-200'
              }`}
              style={{ backgroundColor: color.hex }}
              title={color.label || color.name}
              aria-label={color.label || color.name}
            >
              {selected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className={`h-2.5 w-2.5 rounded-full border ${color.hex === '#ffffff' || color.hex === '#FFFFFF' ? 'border-gray-900 bg-gray-900' : 'border-white bg-white'}`} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
