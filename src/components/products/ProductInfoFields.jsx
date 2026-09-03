import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProductInfoFields({ material, fit, onMaterialChange, onFitChange }) {
  return <div className="mt-4 grid gap-3 sm:grid-cols-2"><div><Label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ceu-navy/60">Material</Label><Input value={material} onChange={(event) => onMaterialChange(event.target.value)} placeholder="Ex.: Algodão" className="rounded-xl" /></div><div><Label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ceu-navy/60">Modelagem / Fit</Label><Input value={fit} onChange={(event) => onFitChange(event.target.value)} placeholder="Ex.: Oversized" className="rounded-xl" /></div></div>;
}