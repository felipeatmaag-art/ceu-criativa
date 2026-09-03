import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function PriceEditorTab({ designs, onComplete }) {
  const [prices, setPrices] = useState({});
  const [saving, setSaving] = useState('');
  useEffect(() => setPrices(Object.fromEntries(designs.map((item) => [item.id, item.price_base || 49.9]))), [designs]);
  const save = async (design) => {
    setSaving(design.id);
    await base44.entities.Design.update(design.id, { price_base: Number(prices[design.id]) });
    await onComplete();
    setSaving('');
  };
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-ceu-navy">Ajustar Preços</h2>
      <p className="mt-1 text-sm text-ceu-navy/60">Defina o preço das estampas publicadas na sua loja.</p>
      <div className="mt-6 space-y-3">
        {designs.map((design) => (
          <div key={design.id} className="flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center">
            <img src={design.image_url} alt="" className="h-14 w-14 rounded-xl object-cover" />
            <strong className="flex-1 text-ceu-navy">{design.title}</strong>
            <div className="flex items-center gap-2"><span className="text-sm text-ceu-navy/60">R$</span><Input type="number" min="1" step="0.01" value={prices[design.id] ?? ''} onChange={(e) => setPrices({ ...prices, [design.id]: e.target.value })} className="w-28" /><Button onClick={() => save(design)} disabled={saving === design.id} className="bg-ceu-navy text-white">Salvar</Button></div>
          </div>
        ))}
        {!designs.length && <div className="rounded-2xl bg-ceu-cloud py-14 text-center text-ceu-navy/55">Publique um produto para ajustar seu preço.</div>}
      </div>
    </section>
  );
}