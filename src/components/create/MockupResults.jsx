import React from 'react';
import { Check } from 'lucide-react';

export default function MockupResults({ results }) {
  if (!results.length) return null;
  return (
    <div className="mt-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground"><Check className="w-4 h-4 text-ceu-aqua" />Imagens prontas para o catálogo</div>
      <div className="grid grid-cols-2 gap-3">
        {results.map((item) => (
          <div key={item.angle} className="overflow-hidden rounded-2xl border bg-card">
            <img src={item.url} alt={`Mockup ${item.label}`} className="aspect-square w-full object-cover" />
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}