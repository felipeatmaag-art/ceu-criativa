import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

export default function ProductCatalogList({ products, onToggle, onDelete }) {
  if (!products.length) return <div className="rounded-3xl border bg-card p-8 text-center text-muted-foreground">Nenhum produto cadastrado ainda.</div>;
  return <div className="space-y-3">{products.map((product) => (
    <article key={product.id} className="flex flex-col items-stretch gap-4 rounded-2xl border bg-card p-4 sm:flex-row sm:items-center">
      <img src={product.front_model_url} alt={product.name} className="h-20 w-20 rounded-xl bg-ceu-cloud object-contain" />
      <div className="min-w-0 flex-1"><h3 className="truncate font-bold text-ceu-navy">{product.name}</h3><p className="text-sm text-muted-foreground">{[product.material, product.fit].filter(Boolean).join(' • ')}</p><p className="mt-1 text-sm font-semibold">R$ {Number(product.base_price).toFixed(2)}</p></div>
      <Button type="button" variant="outline" className="rounded-full" onClick={() => onToggle(product)}>{product.is_active ? 'Ativo' : 'Inativo'}</Button>
      <Button type="button" variant="ghost" size="icon" onClick={() => onDelete(product)} title="Excluir produto"><Trash2 className="text-destructive" /></Button>
    </article>
  ))}</div>;
}