import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ProductCatalogList from '@/components/products/ProductCatalogList';

export default function ProductAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { base44.entities.Product.filter({ catalog_product: true }, '-created_date', 100).then(setProducts).finally(() => setLoading(false)); }, []);
  const updateProduct = (updated) => setProducts((items) => items.map((item) => item.id === updated.id ? updated : item));
  return <div className="min-h-screen bg-ceu-cloud px-4 py-12"><div className="mx-auto max-w-6xl"><div className="mb-8"><p className="text-sm font-bold uppercase tracking-widest text-ceu-aqua">Catálogo SEL</p><h1 className="mt-2 text-4xl font-bold text-ceu-navy">Gerenciar catálogo</h1><p className="mt-2 max-w-3xl text-muted-foreground">Mantenha material e modelagem organizados, envie a foto de cada modelo e configure as cores que serão disponibilizadas no painel Criar.</p></div>{loading ? <p className="text-muted-foreground">Carregando produtos...</p> : <ProductCatalogList products={products} onUpdated={updateProduct} />}</div></div>;
}