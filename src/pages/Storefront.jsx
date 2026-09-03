import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import StorefrontHeader from '@/components/storefront/StorefrontHeader';
import DesignCard from '@/components/design/DesignCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Storefront() {
  const slug = decodeURIComponent(window.location.pathname.slice(1)).toLowerCase();
  const { data: artist, isLoading } = useQuery({
    queryKey: ['storefront', slug],
    queryFn: async () => (await base44.entities.User.filter({ store_slug: slug }))[0],
  });
  const { data: designs = [] } = useQuery({
    queryKey: ['storefront-designs', artist?.id],
    queryFn: () => base44.entities.Design.filter({ artist_id: artist.id, status: 'aprovado' }, '-created_date', 50),
    enabled: !!artist?.id,
  });

  if (isLoading) return <div className="mx-auto min-h-screen max-w-7xl space-y-8 px-4 py-10"><Skeleton className="h-96 rounded-3xl" /><Skeleton className="h-64 rounded-3xl" /></div>;
  if (!artist) return <div className="flex min-h-[70vh] items-center justify-center text-center"><div><h1 className="text-3xl font-bold text-ceu-navy">Loja não encontrada</h1><p className="mt-2 text-ceu-navy/60">Confira o endereço e tente novamente.</p></div></div>;

  return <div className="min-h-screen bg-ceu-cloud py-10"><div className="mx-auto max-w-7xl space-y-10 px-4 sm:px-6 lg:px-8"><StorefrontHeader artist={artist} /><section><h2 className="mb-6 text-2xl font-bold text-ceu-navy">Estampas da loja</h2>{designs.length ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{designs.map((design, index) => <DesignCard key={design.id} design={design} index={index} />)}</div> : <div className="rounded-3xl bg-card py-16 text-center text-ceu-navy/55">Esta loja ainda não publicou estampas.</div>}</section></div></div>;
}