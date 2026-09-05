import React from 'react';
import { PackageCheck } from 'lucide-react';
import PrintDeliveryPanel from '@/components/production/PrintDeliveryPanel';

export default function ProductionQueue({ orders, userId }) {
  const jobs = orders.flatMap(order => (order.items || []).filter(item => item.artist_id === userId && item.production?.front).map(item => ({ order, item })));
  if (!jobs.length) return <div className="rounded-2xl border bg-card py-16 text-center"><PackageCheck className="mx-auto h-10 w-10 text-muted-foreground" /><h3 className="mt-3 font-semibold">Nenhum arquivo em produção</h3><p className="mt-1 text-sm text-muted-foreground">Os pedidos aprovados aparecerão aqui prontos para download.</p></div>;
  return <div className="space-y-5">
    <div><h3 className="font-bold">Preparação para impressão</h3><p className="text-sm text-muted-foreground">Arquivos aprovados para DTF, plotter ou impressão têxtil.</p></div>
    {jobs.map(({ order, item }, index) => <div key={`${order.id}-${index}`} className="space-y-2"><p className="text-sm font-semibold">Pedido #{order.order_number || order.id.slice(0, 8).toUpperCase()}</p><PrintDeliveryPanel production={item.production} mockupUrl={item.production.mockup_front_url || item.mockup_url} designId={item.design_id} size={item.size} color={item.color} title={item.design_title} /></div>)}
  </div>;
}