import React from 'react';
import ProductImageSetupCard from '@/components/products/ProductImageSetupCard';

export default function ProductCatalogList({ products, onUpdated, onDeleted }) {
  if (!products.length) return <div className="rounded-3xl border bg-card p-8 text-center text-muted-foreground">Nenhum produto cadastrado ainda.</div>;
  return <div className="grid gap-5 lg:grid-cols-2">{products.map((product) => <ProductImageSetupCard key={product.id} product={product} onUpdated={onUpdated} onDeleted={onDeleted} />)}</div>;
}