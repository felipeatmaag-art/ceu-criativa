import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StorefrontHeader from '@/components/storefront/StorefrontHeader';

export default function StorePreviewTab({ user, designs }) {
  return (
    <section className="overflow-hidden rounded-3xl border bg-ceu-cloud shadow-sm">
      <div className="flex flex-col gap-3 border-b bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-2xl font-bold text-ceu-navy">Prévia da Loja</h2><p className="text-sm text-ceu-navy/60">Assim seus clientes verão sua vitrine.</p></div>
        {user.store_slug && <Button asChild className="rounded-xl bg-ceu-navy text-white"><a href={`/${user.store_slug}`} target="_blank" rel="noreferrer">Abrir loja <ExternalLink /></a></Button>}
      </div>
      {user.store_slug ? (
        <div className="space-y-8 p-5"><StorefrontHeader artist={user} /><div><h3 className="mb-4 text-xl font-bold text-ceu-navy">Estampas da loja</h3><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{designs.slice(0, 4).map((design) => <article key={design.id} className="overflow-hidden rounded-2xl bg-white"><img src={design.image_url} alt={design.title} className="aspect-square w-full object-cover" /><div className="p-3"><strong className="text-ceu-navy">{design.title}</strong><p className="text-sm text-ceu-navy/60">R$ {(design.price_base || 49.9).toFixed(2)}</p></div></article>)}</div>{!designs.length && <div className="rounded-2xl bg-white py-12 text-center text-ceu-navy/55">Sua loja ainda não tem estampas publicadas.</div>}</div></div>
      ) : <div className="p-16 text-center text-ceu-navy/60">Defina o endereço da loja em Dados & Fotos para visualizar sua prévia.</div>}
    </section>
  );
}