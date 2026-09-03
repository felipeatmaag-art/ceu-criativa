import { Badge } from '@/components/ui/badge';

export default function CatalogTab({ designs, isLoading }) {
  if (isLoading) return <div className="h-64 animate-pulse rounded-3xl bg-muted" />;
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-ceu-navy">Meu Catálogo</h2>
        <p className="text-sm text-ceu-navy/60">Produtos aprovados e publicados na sua loja.</p>
      </div>
      {designs.length ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {designs.map((design) => (
            <article key={design.id} className="overflow-hidden rounded-2xl border bg-ceu-cloud">
              <img src={design.image_url} alt={design.title} className="aspect-square w-full object-cover" />
              <div className="flex items-center justify-between gap-3 p-4">
                <div><h3 className="font-bold text-ceu-navy">{design.title}</h3><p className="text-sm text-ceu-navy/60">R$ {(design.price_base || 49.9).toFixed(2)}</p></div>
                <Badge className="bg-ceu-aqua text-ceu-navy">Publicado</Badge>
              </div>
            </article>
          ))}
        </div>
      ) : <div className="rounded-2xl bg-ceu-cloud py-16 text-center text-ceu-navy/55">Você ainda não tem produtos publicados.</div>}
    </section>
  );
}