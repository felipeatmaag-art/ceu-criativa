import React, { useEffect, useRef, useState } from 'react';
import { renderPrintMockup } from '@/components/create/renderPrintMockup';
import { PRINT_AREA, lockPrintPlacement } from '@/components/create/printGeometry';
import { getArtworkMetadata } from '@/components/create/artworkMetadata';
export default function ApparelPrintStage({ baseUrl, designImage, transform, onChange }) {
  const canvas = useRef(null), pointers = useRef(new Map()), start = useRef(null), sequence = useRef(0);
  const [error, setError] = useState('');
  const ratio = designImage ? (() => { const b = getArtworkMetadata(designImage).bounds; return b.width / b.height; })() : 1;
  useEffect(() => {
    const id = ++sequence.current;
    const buffer = document.createElement('canvas');
    setError('');
    const placement = designImage ? lockPrintPlacement(transform, ratio) : null;
    renderPrintMockup(buffer, baseUrl, designImage, transform, placement).then(() => {
      if (id !== sequence.current || !canvas.current) return;
      canvas.current.width = canvas.current.height = 1000;
      canvas.current.getContext('2d').drawImage(buffer, 0, 0);
    }).catch(e => { if (id === sequence.current) setError(e.message); });
    return () => { sequence.current++; };
  }, [baseUrl, designImage, transform]);
  const rebase = () => {
    const p = [...pointers.current.values()];
    start.current = p.length ? { x: p.reduce((a, v) => a + v.x, 0) / p.length, y: p.reduce((a, v) => a + v.y, 0) / p.length, distance: p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0, transform } : null;
  };
  const move = e => {
    if (!pointers.current.has(e.pointerId) || !start.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const p = [...pointers.current.values()], s = start.current, unit = 1000 / e.currentTarget.getBoundingClientRect().width;
    const distance = p.length > 1 ? Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y) : 0;
    const g = lockPrintPlacement({ ...s.transform, x: s.transform.x + (p.reduce((a,v) => a + v.x, 0) / p.length - s.x) * unit, y: s.transform.y + (p.reduce((a,v) => a + v.y, 0) / p.length - s.y) * unit, scale: s.distance && distance ? s.transform.scale * distance / s.distance : s.transform.scale }, ratio);
    onChange(g.transform);
  };
  const end = e => { pointers.current.delete(e.pointerId); rebase(); };
  return <div className="w-full max-w-2xl mx-auto">
    <div className={`relative aspect-square bg-muted rounded-2xl overflow-hidden ${designImage ? 'touch-none cursor-grab active:cursor-grabbing' : ''}`} onPointerDown={e => { if (!designImage) return; e.currentTarget.setPointerCapture(e.pointerId); pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY }); rebase(); }} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      <canvas ref={canvas} aria-label="Mockup aprovado da camiseta" className={`h-full w-full ${error ? 'invisible' : ''}`} />
      <div aria-hidden="true" className="absolute pointer-events-none border border-foreground/20 rounded-sm" style={{ left: `${PRINT_AREA.x / 10}%`, top: `${PRINT_AREA.y / 10}%`, width: `${PRINT_AREA.width / 10}%`, height: `${PRINT_AREA.height / 10}%` }} />
      {error && <p role="alert" className="absolute inset-x-4 top-1/2 bg-card p-3 text-sm text-destructive">{error}</p>}
    </div>
    <p className="mt-2 text-center text-xs text-muted-foreground">Área estimada 30 × 37,5 cm · limites automáticos · arraste ou use dois dedos.</p>
    {!baseUrl && <p className="text-center text-xs text-destructive">Foto deste lado indisponível. Envie a base antes de aprovar.</p>}
  </div>;
}