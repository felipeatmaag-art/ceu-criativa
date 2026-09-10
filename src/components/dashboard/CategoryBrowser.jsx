import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export default function CategoryBrowser() {
  const { data: categories = [], isLoading } = useQuery({ queryKey: ['catalog-categories'], queryFn: () => base44.entities.Category.list('position_order', 100) });
  return (
    <section className="mb-6 rounded-2xl bg-white p-5 text-gray-900 shadow-sm">
      <h3 className="font-bold text-gray-900">Categorias da loja</h3>
      <p className="mt-1 text-sm text-gray-500">Use estas categorias para organizar suas artes e coleções.</p>
      {isLoading ? <div className="mt-4 h-10 animate-pulse rounded-xl bg-gray-100" /> : (
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((item) => <span key={item.id} className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700">{item.icon || '✦'} {item.name}</span>)}
          {!categories.length && <span className="text-sm text-gray-400">Nenhuma categoria cadastrada.</span>}
        </div>
      )}
    </section>
  );
}