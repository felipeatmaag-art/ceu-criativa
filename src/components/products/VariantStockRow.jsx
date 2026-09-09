import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import inventoryRepository from '@/services/products/inventoryRepository';
export default function VariantStockRow({ product, variant, onChanged }) {
  const [stock, setStock] = useState(String(variant.stock_quantity)), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const run = async (operation) => {
    setBusy(true); setError('');
    try { await operation(); await onChanged(); } catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  return <div className="space-y-2 rounded-xl border p-3" data-variant-id={variant.id}>
    <p className="text-sm font-semibold">{variant.color} · {variant.size}</p>
    <div className="flex flex-wrap items-center gap-2"><Input aria-label={`Estoque ${variant.color} ${variant.size}`} type="number" min="0" step="1" value={stock} onChange={e => setStock(e.target.value)} className="w-24" />
      <Button disabled={busy || stock === '' || Number(stock) === variant.stock_quantity} onClick={() => run(() => inventoryRepository.save(product, variant.color, variant.size, Number(stock), variant))}>Atualizar e voar 🚀</Button></div>
    <label className="flex items-center gap-2 text-sm"><Switch aria-label={`Ocultar ${variant.color} ${variant.size}`} checked={!variant.is_active} disabled={busy} onCheckedChange={() => run(() => inventoryRepository.pause(variant))} />Ocultar nas nuvens ☁️</label>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </div>;
}