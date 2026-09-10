import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const brl = (v) => `R$ ${Number(v || 0).toFixed(2)}`;
export default function MarginCalculator({ user, designs }) {
  const [designId, setDesignId] = useState(''), [productId, setProductId] = useState(''), [margin, setMargin] = useState('10'), [status, setStatus] = useState('');
  const { data: products = [] } = useQuery({ queryKey: ['margin-products'], queryFn: () => base44.entities.Product.filter({ catalog_product: true, is_active: true }, 'name', 100), refetchOnMount: 'always' });
  const { data: rates = [] } = useQuery({ queryKey: ['margin-rate', user?.id], queryFn: () => base44.entities.ArtistCommission.filter({ artist_id: user.id }, '-updated_date', 1), enabled: !!user?.id });
  useEffect(() => { if (designs[0] && !designs.some((item) => item.id === designId)) setDesignId(designs[0].id); if (products[0] && !products.some((item) => item.id === productId)) setProductId(products[0].id); }, [designs, products, designId, productId]);
  const rate = rates[0]?.rate ?? 25, product = products.find((p) => p.id === productId), design = designs.find((d) => d.id === designId);
  const quote = useMemo(() => { const base = Number(product?.base_cost ?? product?.base_price ?? 0), gain = Math.max(0, Number(margin) || 0), component = rate > 0 ? gain / (rate / 100) : 0; return { base, gain, fee: component - gain, final: base + component }; }, [product, margin, rate]);
  const save = async () => { if (!design) return; setStatus('Salvando...'); await base44.entities.Design.update(design.id, { base_cost: quote.base, artist_margin: quote.gain, platform_fee: quote.fee, price_base: quote.gain + quote.fee, final_price: quote.final, commission_rate: rate }); setStatus('Margem aplicada.'); };
  return (
    <section className="rounded-2xl bg-white p-6 text-gray-900 shadow-sm"><h3 className="text-xl font-bold">Calculadora de margem</h3><p className="mt-1 text-sm text-gray-500">Preço final = custo base + seu lucro + taxa da plataforma.</p>
      <div className="mt-5 grid gap-4 md:grid-cols-3"><label className="text-sm font-medium">Arte<select className="mt-2 h-10 w-full rounded-md border px-3" value={designId} onChange={(e) => setDesignId(e.target.value)}>{designs.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}</select></label><label className="text-sm font-medium">Produto<select className="mt-2 h-10 w-full rounded-md border px-3" value={productId} onChange={(e) => setProductId(e.target.value)}>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></label><label className="text-sm font-medium">Quero lucrar (R$)<Input className="mt-2" type="number" min="0" step="0.01" value={margin} onChange={(e) => setMargin(e.target.value)} /></label></div>
      <div className="mt-5 grid grid-cols-2 gap-3 rounded-xl bg-gray-50 p-4 sm:grid-cols-4">{[['Custo base', quote.base], ['Seu lucro', quote.gain], [`Taxa plataforma (${100-rate}%)`, quote.fee], ['Preço final', quote.final]].map(([label, value]) => <div key={label}><p className="text-xs text-gray-500">{label}</p><p className="font-bold">{brl(value)}</p></div>)}</div>
      <div className="mt-5 flex items-center gap-3"><Button onClick={save} disabled={!design || !product || rate <= 0} className="bg-gray-900 text-white">Aplicar à arte</Button>{status && <span className="text-sm text-gray-500">{status}</span>}</div>
    </section>
  );
}