import React from 'react';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';

export default function ProductModelUploads({ files, onChange }) {
  const upload = (side, label, required) => (
    <label className="block cursor-pointer rounded-2xl border border-dashed border-ceu-navy/25 bg-ceu-cloud p-5 text-center active:scale-95">
      <Upload className="mx-auto mb-2 h-5 w-5 text-ceu-navy" />
      <span className="block text-sm font-semibold text-ceu-navy">{label}</span>
      <span className="mt-1 block text-xs text-muted-foreground">{files[side]?.name || 'PNG, JPG ou WEBP'}</span>
      <input type="file" accept="image/*" required={required} className="sr-only" onChange={(event) => onChange(side, event.target.files?.[0] || null)} />
    </label>
  );
  return <div className="grid gap-4 sm:grid-cols-2"><div><Label className="mb-2 block">Foto de frente *</Label>{upload('front', 'Enviar foto da frente', true)}</div><div><Label className="mb-2 block">Foto de costas</Label>{upload('back', 'Enviar foto das costas', false)}</div></div>;
}