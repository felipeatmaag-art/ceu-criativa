import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import productRepository from '@/services/products/productRepository';
import InventoryProductCard from '@/components/inventory/InventoryProductCard';
import { Boxes } from 'lucide-react';

export default function InventoryManagement() {
  const { data: user, isLoading: loadingUser } = useQuery({ queryKey: ['inventory-page-user'], queryFn: async () => { try { return await base44.auth.me(); } catch { return null; } } });
  const { data: products = [], isLoading, isError } = useQuery({ queryKey: ['inventory-products'], queryFn: () => productRepository.listCatalog(), enabled: user?.role === 'admin' });
  if (loadingUser) return <div className="min-h-screen bg-ceu-cloud p-12"><div className="mx-auto h-32 max-w-6xl animate-pulse rounded-3xl bg-muted"/></div>;
  if (user?.role !== 'admin') return <div className="min-h-screen bg-ceu-cloud px-4 py-20 text-center"><h1 className="text-3xl font-bold text-ceu-navy">Acesso restrito</h1><p className="mt-3 text-muted-foreground">A gestão de estoque está disponível somente para administradores.</p></div>;
  return <div className="min-h-screen bg-ceu-cloud px-4 py-12"><div className="mx-auto max-w-6xl"><header className="mb-8"><div className="mb-2 flex items-center gap-2 text-ceu-aqua"><Boxes className="h-5 w-5"/><span className="text-sm font-semibold">Estoque POD</span></div><h1 className="text-4xl font-bold text-ceu-navy">Gestão de Estoque</h1><p className="mt-2 text-muted-foreground">Atualize as quantidades físicas disponíveis por produto base, cor e tamanho.</p></header>{isLoading ? <div className="h-32 animate-pulse rounded-3xl bg-muted"/> : isError ? <div className="rounded-3xl border bg-card p-8 text-center text-destructive">Não foi possível carregar o estoque.</div> : products.length ? <div className="grid gap-5 lg:grid-cols-2">{products.map(product => <InventoryProductCard key={product.id} product={product}/>)}</div> : <div className="rounded-3xl border bg-card p-8 text-center text-muted-foreground">Cadastre produtos base antes de configurar o estoque.</div>}</div></div>;
}