import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import inventoryRepository from '@/services/products/inventoryRepository';
import VariantStockRow from '@/components/products/VariantStockRow';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
export default function ProductInventory({ product, open = false }) {
  const cache = useQueryClient(), key = ['inventory', product.id];
  const { data: admin } = useQuery({ queryKey: ['inventory-admin'], queryFn: async () => await base44.auth.isAuthenticated() && (await base44.auth.me()).role === 'admin' });
  const { data: variants = [], isLoading, error } = useQuery({ queryKey: key, queryFn: () => inventoryRepository.list(product.id), enabled: !!admin });
  const [color, setColor] = useState(''), [size, setSize] = useState(''), [stock, setStock] = useState('0'), [busy, setBusy] = useState(false), [failure, setFailure] = useState('');
  const refresh = () => cache.invalidateQueries({ queryKey: key });
  const add = async e => {
    e.preventDefault(); setBusy(true); setFailure('');
    try { await inventoryRepository.save(product, color, size, Number(stock)); await refresh(); setColor(''); setSize(''); setStock('0'); } catch (e) { setFailure(e.message); } finally { setBusy(false); }
  };
  if (!admin) return null;
  return <details open={open} className="mt-4 rounded-2xl border bg-background p-4 text-foreground"><summary className="cursor-pointer font-semibold">Estoque físico por cor e tamanho</summary>
    <p className="my-3 text-sm text-muted-foreground">O estoque pertence ao produto base. Estampas são ilimitadas. Variações não cadastradas não podem ser compradas.</p>
    {isLoading ? <p>Carregando estoque...</p> : error ? <p role="alert">Não foi possível carregar o estoque.</p> : <div className="space-y-3">{!variants.length && <p className="text-sm">Nenhuma variação cadastrada.</p>}{variants.map(v => <VariantStockRow key={`${v.id}-${v.stock_quantity}-${v.is_active}`} product={product} variant={v} onChanged={refresh} />)}</div>}
    <form onSubmit={add} className="mt-4 space-y-3"><label className="block text-sm">Cor<select aria-label="Cor do insumo" required value={color} onChange={e => setColor(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2"><option value="">Selecione</option>{(product.colors_available || []).map(c => <option key={c}>{c}</option>)}</select></label>
    <label className="block text-sm">Tamanho<select aria-label="Tamanho do insumo" required value={size} onChange={e => setSize(e.target.value)} className="mt-1 w-full rounded-md border bg-background p-2"><option value="">Selecione</option>{(product.sizes_available || []).map(s => <option key={s}>{s}</option>)}</select></label>
    <label className="block text-sm">Quantidade física<Input aria-label="Quantidade física" type="number" required min="0" step="1" value={stock} onChange={e => setStock(e.target.value)} /></label>
    <Button type="submit" disabled={busy || !color || !size || stock === ''} className="w-full">{busy ? 'Salvando...' : 'Adicionar variação física'}</Button>{failure && <p role="alert" className="text-sm text-destructive">{failure}</p>}</form>
  </details>;
}