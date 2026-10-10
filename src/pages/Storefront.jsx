import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import StorefrontHeader from '@/components/storefront/StorefrontHeader';
import DesignCard from '@/components/design/DesignCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FALLBACK_USERS, FALLBACK_DESIGNS } from '@/data/catalogFallback';

export default function Storefront() {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const rawSlug = pathname.replace(/^\/loja\//, '').replace(/^\//, '').toLowerCase();
  const slug = rawSlug || 'felipe-silverio';

  const { data: artist, isLoading } = useQuery({
    queryKey: ['storefront', slug],
    queryFn: async () => {
      try {
        const res = await base44.entities.User.filter({ store_slug: slug });
        if (Array.isArray(res) && res.length > 0) return res[0];
      } catch (e) {}
      
      const found = FALLBACK_USERS.find(u => u.store_slug === slug);
      if (found) return found;

      // Default to Felipe Silvério if slug matches or if default
      return FALLBACK_USERS.find(u => u.store_slug === 'felipe-silverio') || FALLBACK_USERS[0];
    },
  });

  const { data: designs = [] } = useQuery({
    queryKey: ['storefront-designs', artist?.id],
    queryFn: async () => {
      if (!artist?.id) return FALLBACK_DESIGNS;
      try {
        const res = await base44.entities.Design.filter({ artist_id: artist.id, status: 'aprovado' }, '-created_date', 50);
        if (Array.isArray(res) && res.length > 0) return res;
      } catch (e) {}

      // Fallback: return approved designs by this artist
      const felipeDesigns = FALLBACK_DESIGNS.filter(d => 
        d.artist_id === artist.id || (d.artist_name || '').toLowerCase().includes('felipe')
      );
      return felipeDesigns.length > 0 ? felipeDesigns : FALLBACK_DESIGNS;
    },
    enabled: !!artist?.id,
  });

  if (isLoading) {
    return (
      <div className="mx-auto min-h-screen max-w-7xl space-y-8 px-4 py-10">
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-64 rounded-3xl" />
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-center">
        <div>
          <h1 className="text-3xl font-bold text-ceu-navy">Loja não encontrada</h1>
          <p className="mt-2 text-muted-foreground">Confira o endereço e tente novamente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ceu-cloud py-10">
      <div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8">
        <StorefrontHeader artist={artist} />
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-ceu-navy">
              Estampas Autorais da Loja ({designs.length})
            </h2>
            <span className="text-xs uppercase font-bold tracking-wider px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              Coleção Exclusiva
            </span>
          </div>

          {designs.length ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {designs.map((design, index) => (
                <DesignCard key={design.id} design={design} index={index} onLike={() => {}} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-card py-16 text-center font-medium text-muted-foreground">
              Esta loja ainda não publicou estampas.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}