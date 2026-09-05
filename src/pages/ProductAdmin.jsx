import React, { useEffect, useState } from 'react';
import productRepository from '@/services/products/productRepository';
import ProductCatalogList from '@/components/products/ProductCatalogList';
import ProductCatalogDialog from '@/components/products/ProductCatalogDialog';
import { Button } from '@/components/ui/button';

export default function ProductAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadProducts = () => {
    setLoading(true); setError('');
    productRepository.listCatalog()
      .then(setProducts).catch(() => setError('Não foi possível carregar o catálogo.'))
      .finally(() => setLoading(false));
  };
  useEffect(loadProducts, []);
  const createProduct = (product) => setProducts((items) => [product, ...items]);
  const updateProduct = (updated) => setProducts((items) => items.map((item) => item.id === updated.id ? updated : item));
  const deleteProduct = (id) => setProducts((items) => items.filter((item) => item.id !== id));
  return <div className="min-h-screen overflow-x-hidden bg-ceu-cloud px-4 py-12"><div className="mx-auto max-w-6xl"><div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-bold uppercase tracking-widest text-ceu-navy">Catálogo SEL</p><h1 className="mt-2 text-4xl font-bold text-ceu-navy">Gerenciar catálogo</h1><p className="mt-2 max-w-3xl text-muted-foreground">Mantenha material e modelagem organizados, envie a foto de cada modelo e configure as cores que serão disponibilizadas no painel Criar.</p></div><ProductCatalogDialog onCreated={createProduct} /></div>{loading ? <p className="text-muted-foreground">Carregando produtos...</p> : error ? <div className="rounded-3xl border bg-card p-8 text-center"><p className="text-destructive">{error}</p><Button type="button" variant="outline" onClick={loadProducts} className="mt-4 rounded-full">Tentar novamente</Button></div> : <ProductCatalogList products={products} onUpdated={updateProduct} onDeleted={deleteProduct} />}</div></div>;
}