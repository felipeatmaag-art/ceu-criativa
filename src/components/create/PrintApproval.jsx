import React from 'react';
import { getArtworkMetadata } from '@/components/create/artworkMetadata';
import { PRINT_AREA, printGeometry } from '@/components/create/printGeometry';
export default function PrintApproval({ front, back, transforms, approved, onChange, disabled }) {
  return <div className="rounded-xl border border-border bg-muted p-4 space-y-3 text-sm text-foreground">
    {[['Frente', front, transforms.front], ['Costas', back, transforms.back]].filter(([,url]) => url).map(([label, url, transform]) => {
      const art = getArtworkMetadata(url), g = printGeometry(transform, art.bounds.width / art.bounds.height);
      const dpi = Math.floor(art.bounds.width / (g.width / PRINT_AREA.width * PRINT_AREA.width_mm / 25.4));
      return <div key={label}><strong>{label}: imagem preparada e transparência validada</strong><p className="text-xs text-muted-foreground">{art.width} × {art.height} px · {dpi} dpi estimados na aplicação · {art.reconstructed ? `reconstruída a partir de ${art.original_width} × ${art.original_height} px` : 'resolução original preservada'} · {art.artifact_pixels_removed ? `${art.artifact_pixels_removed.toLocaleString('pt-BR')} pixels de fundo removidos` : 'sem resíduos detectados'}.</p>{dpi < 300 && <p className="text-xs text-destructive">Para uma impressão mais nítida, reduza o tamanho da estampa no produto.</p>}</div>;
    })}
    <p className="text-xs text-muted-foreground">Confira a reconstrução e a aplicação antes de continuar. Medidas, cores e viabilidade de impressão passam por revisão técnica antes da produção.</p>
    <label className="flex items-start gap-3 cursor-pointer"><input type="checkbox" checked={approved} onChange={e => onChange(e.target.checked)} disabled={disabled} className="mt-1" />Conferi a reconstrução e aprovo a posição das artes neste mockup.</label>
  </div>;
}