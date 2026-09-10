import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';

export default function CatalogProductFilters({ products, children }) {
  const [search, setSearch] = useState(''), [category, setCategory] = useState('all'), [collection, setCollection] = useState('all');
  const { data: categories = [] } = useQuery({ queryKey: ['catalog-categories'], queryFn: () => base44.entities.Category.list('position_order', 100) });
  const { data: collections = [] } = useQuery({ queryKey: ['active-collections'], queryFn: () => base44.entities.Collection.filter({ is_active: true, is_public: true }, 'position_order', 100) });
  const filtered = useMemo(() => products.filter((p) => {
    const term = search.trim().toLowerCase(), matchesText = !term || [p.label, p.type, ...(p.tags || [])].some((v) => String(v || '').toLowerCase().includes(term));
    return matchesText && (category === 'all' || p.category_id === category) && (collection === 'all' || p.collection_id === collection);
  }), [products, search, category, collection]);
  return <div><div className="mb-5 grid gap-3 md:grid-cols-3"><Input aria-label="Buscar produtos" placeholder="Buscar por nome ou tag" value={search} onChange={(e) => setSearch(e.target.value)} /><select aria-label="Filtrar categoria" className="h-9 rounded-md border bg-white px-3 text-sm" value={category} onChange={(e) => setCategory(e.target.value)}><option value="all">Todas as categorias</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><select aria-label="Filtrar coleção" className="h-9 rounded-md border bg-white px-3 text-sm" value={collection} onChange={(e) => setCollection(e.target.value)}><option value="all">Todas as coleções</option>{collections.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}</select></div>{children(filtered)}</div>;
}