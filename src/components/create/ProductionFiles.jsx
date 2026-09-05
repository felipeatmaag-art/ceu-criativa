import React from 'react';
export default function ProductionFiles({ production }) {
  if (!production?.front) return null;
  return <div className="mt-3 space-y-1 text-xs text-muted-foreground">
    {['front', 'back'].map(side => production[side] && <div key={side}>
      <a className="font-medium text-foreground underline underline-offset-4" href={production[side].file_url} target="_blank" rel="noopener noreferrer">PNG {side === 'front' ? 'da frente' : 'das costas'}</a>
      <span> · {production[side].width} × {production[side].height} px · {production[side].effective_dpi} dpi na aplicação</span>
    </div>)}
    <p>Arquivo raster; prova técnica de DTF/silk pendente. Área de impressão estimada.</p>
  </div>;
}