import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProductFitSelector from '@/components/products/ProductFitSelector';

export default function ProductInfoFields({ material, fit, onMaterialChange, onFitChange }) {
  return (
    <div className="mt-4 space-y-4">
      <div>
        <Label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">
          Material do Tecido
        </Label>
        <Input
          value={material || ''}
          onChange={(event) => onMaterialChange(event.target.value)}
          placeholder="Ex.: 100% Algodão Penteado 30.1, Poliéster, Dry Fit..."
          className="rounded-xl bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-800 text-sm h-10"
        />
      </div>

      <div>
        <ProductFitSelector value={fit} onChange={onFitChange} />
      </div>
    </div>
  );
}
