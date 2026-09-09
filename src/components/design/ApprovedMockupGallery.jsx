import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function ApprovedMockupGallery({ production }) {
  const [side, setSide] = useState('front');
  const sides = [['front', 'Frente'], ['back', 'Costas']].filter(([key]) => production[`mockup_${key}_url`]);
  const active = sides.find(([key]) => key === side) || sides[0];
  return <div className="space-y-4">
    <div className="flex gap-2">{sides.map(([key, label]) => <Button key={key} variant={active[0] === key ? 'default' : 'outline'} onClick={() => setSide(key)} className="rounded-xl">{label}</Button>)}</div>
    <div className="aspect-square overflow-hidden rounded-3xl bg-muted"><img src={production[`mockup_${active[0]}_url`]} alt={`Aplicação aprovada — ${active[1]}`} className="h-full w-full object-contain" /></div>
    <p className="text-sm text-muted-foreground">Aplicação aprovada pelo artista{production.color ? ` · ${production.color}` : ''}. Posição, tamanho e rotação preservados.</p>
  </div>;
}