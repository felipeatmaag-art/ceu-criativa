import React from 'react';
import { BadgeCheck } from 'lucide-react';
import PrintReadyDownloadButton from '@/components/production/PrintReadyDownloadButton';

export default function PrintDeliveryPanel({ production, mockupUrl, designId, size, color, title }) {
  const sides = ['front', 'back'].filter(side => production?.[side]?.file_url);
  if (!production?.front) return null;
  return <section className="overflow-hidden rounded-2xl border bg-card text-card-foreground shadow-sm">
    <div className="grid md:grid-cols-[240px_1fr]">
      <div className="flex min-h-60 items-center justify-center bg-muted p-4">
        {mockupUrl ? <img src={mockupUrl} alt={`Mockup aprovado de ${title}`} className="h-56 w-full object-contain" /> : <BadgeCheck className="h-16 w-16 text-primary" />}
      </div>
      <div className="space-y-5 p-5 sm:p-6">
        <div><p className="flex items-center gap-2 text-sm font-semibold text-primary"><BadgeCheck className="h-4 w-4" /> Produto aprovado</p><h3 className="mt-1 text-lg font-bold">{title || 'Estampa pronta para produção'}</h3></div>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div><dt className="text-muted-foreground">Tamanho</dt><dd className="font-semibold">{size || production.size || '—'}</dd></div>
          <div><dt className="text-muted-foreground">Cor</dt><dd className="font-semibold">{color || production.color || '—'}</dd></div>
          <div className="col-span-2 sm:col-span-1"><dt className="text-muted-foreground">ID do design</dt><dd className="truncate font-mono text-xs font-semibold" title={designId}>{designId || '—'}</dd></div>
        </dl>
        <div className="grid gap-2 sm:grid-cols-2">{sides.map(side => <PrintReadyDownloadButton key={side} sourceUrl={production[side].print_ready_url || production[side].file_url} fileName={`estampa-${designId || 'design'}-${side}`} sideLabel={side === 'front' ? 'frontal em alta resolução (PNG)' : 'traseira em alta resolução (PNG)'} />)}</div>
        <p className="text-xs text-muted-foreground">PNG isolado com transparência, sem camiseta ou fundo, preparado com no mínimo 3000 px no lado maior.</p>
      </div>
    </div>
  </section>;
}