import React from 'react';
import { Ruler } from 'lucide-react';
import { getPrintStandard } from '@/components/production/printStandards';

export default function PrintStandardCard({ productType }) {
  const standard = getPrintStandard(productType);
  return <div className="rounded-2xl border border-ceu-aqua/30 bg-ceu-aqua/10 p-4">
    <div className="flex items-start gap-3">
      <div className="rounded-xl bg-ceu-navy p-2 text-ceu-cloud"><Ruler className="h-4 w-4" /></div>
      <div>
        <p className="text-sm font-bold text-ceu-navy">Padrão automático: {standard.label}</p>
        <p className="mt-1 text-sm text-ceu-navy/70">Proporção {standard.ratio} · {standard.widthCm} × {standard.heightCm} cm · {standard.dpi} DPI</p>
        <p className="mt-1 text-xs text-ceu-navy/55">Arquivo final: {standard.widthPx} × {standard.heightPx} px, sem cortes ou distorções.</p>
      </div>
    </div>
  </div>;
}