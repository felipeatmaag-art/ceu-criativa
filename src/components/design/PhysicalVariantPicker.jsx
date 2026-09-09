import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import productRepository from '@/services/products/productRepository';
import inventoryRepository from '@/services/products/inventoryRepository';
export default function PhysicalVariantPicker({ onChange }) {
  const [productId, setProductId] = useState('');
  const { data: products = [], isLoading, error } = useQuery({ queryKey: ['physical-products'], queryFn: productRepository.listCatalog });
  const { data: variants = [], isLoading: loadingVariants, error: variantError } = useQuery({ queryKey: ['inventory', productId], queryFn: () => inventoryRepository.list(productId), enabled: !!productId });
  const product = products.find(p => p.id === productId);
  const available = variants.filter(v => v.is_active && v.stock_quantity > 0);
  return <div className="space-y-4">
    <p className="text-sm text-muted-foreground">Arte ilimitada, produção sob demanda. Escolha o insumo físico disponível.</p>
    {isLoading ? <p>Carregando produtos...</p> : error ? <p role="alert">Não foi possível carregar os produtos.</p> : <label className="block font-medium">Produto base<select aria-label="Produto base" className="mt-2 w-full rounded-xl border bg-background p-3 text-foreground" value={productId} onChange={e => { setProductId(e.target.value); onChange(null); }}><option value="">Selecione um produto</option>{products.filter(p => p.is_active).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label>}
    {product && (loadingVariants ? <p>Consultando estoque...</p> : variantError ? <p role="alert">Não foi possível consultar o estoque.</p> : <label className="block font-medium">Cor e tamanho<select key={productId} aria-label="Variação física" defaultValue="" className="mt-2 w-full rounded-xl border bg-background p-3 text-foreground" onChange={e => { const variant = available.find(v => v.id === e.target.value); onChange(variant ? { product, variant } : null); }}><option value="">{available.length ? 'Selecione a variação' : 'Sem estoque físico disponível'}</option>{available.map(v => <option key={v.id} value={v.id}>{v.color} · {v.size} — {v.stock_quantity} disponíveis</option>)}</select></label>)}
  </div>;
}