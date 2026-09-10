import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ProductInventory from '@/components/products/ProductInventory';

export default function InventoryProductCard({ product }) {
  const [expanded, setExpanded] = useState(false);
  return <article data-product-id={product.id} className="rounded-3xl border bg-card p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="flex min-w-0 items-center gap-4"><div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-muted">{product.front_model_url ? <img src={product.front_model_url} alt={product.name} className="h-full w-full object-cover"/> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sem foto</div>}</div><div className="min-w-0"><h2 className="font-bold text-foreground">{product.name}</h2><p className="mt-1 text-sm capitalize text-muted-foreground">{product.type?.replace('_', ' ')}</p></div></div><Button type="button" variant="outline" onClick={() => setExpanded(value => !value)} className="w-full rounded-full sm:ml-auto sm:w-auto">{expanded ? 'Fechar' : 'Gerenciar estoque'}</Button></div>{expanded && <ProductInventory product={product} open/>}</article>;
}