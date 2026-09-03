import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import ProductCatalogForm from '@/components/products/ProductCatalogForm';
import ProductCatalogList from '@/components/products/ProductCatalogList';

export default function ProductAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { base44.entities.Product.filter({ catalog_product: true }, '-created_date', 100).then(setProducts).finally(() => setLoading(false)); }, []);
  const toggle = async (product) => { const updated = await base44.entities.Product.update(product.id, { is_active: !product.is_active }); setProducts((items) => items.map((item) => item.id === updated.id ? updated : item)); };
  const remove = async (product) => { await base44.entities.Product.delete(product.id); setProducts((items) => items.filter((item) => item.id !== product.id)); };
  return <div className="min-h-screen bg-ceu-cloud px-4 py-12"><div className="mx-auto max-w-6xl"><div className="mb-8"><p className="text-sm font-bold uppercase tracking-widest text-ceu-aqua">Catálogo SEL</p><h1 className="mt-2 text-4xl font-bold text-ceu-navy">Cadastro de produtos</h1><p className="mt-2 text-muted-foreground">Envie fotos do produto e transforme-as automaticamente em modelos prontos para o painel Criar.</p></div><div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"><ProductCatalogForm onCreated={(product) => setProducts((items) => [product, ...items])} /><section><h2 className="mb-4 text-xl font-bold text-ceu-navy">Produtos cadastrados</h2>{loading ? <p className="text-muted-foreground">Carregando produtos...</p> : <ProductCatalogList products={products} onToggle={toggle} onDelete={remove} />}</section></div></div></div>;
}