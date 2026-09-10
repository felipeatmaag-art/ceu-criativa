import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import NotificationList from '@/components/notifications/NotificationList';

export default function Notifications() {
  const cache = useQueryClient();
  const [readAt, setReadAt] = useState(() => Number(localStorage.getItem('ceu-notifications-read-at') || 0));
  const { data, isLoading, isError } = useQuery({ queryKey: ['central-notifications'], queryFn: async () => {
    let user; try { user = await base44.auth.me(); } catch { return { user: null, notifications: [] }; }
    const designs = await base44.entities.Design.filter({ artist_id: user.id });
    const ids = new Set(designs.map(item => item.id)), names = new Map(designs.map(item => [item.id, item.title]));
    const [likes, comments, orders] = await Promise.all([base44.entities.Like.list('-created_date', 200), base44.entities.Comment.list('-created_date', 200), base44.entities.Order.list('-updated_date', 200)]);
    const notifications = [
      ...likes.filter(item => ids.has(item.design_id) && item.user_email !== user.email).map(item => ({ id: `like-${item.id}`, type: 'like', title: 'Nova curtida', text: `Sua estampa “${names.get(item.design_id)}” recebeu uma curtida.`, date: item.created_date })),
      ...comments.filter(item => ids.has(item.design_id) && item.user_email !== user.email).map(item => ({ id: `comment-${item.id}`, type: 'comment', title: 'Novo comentário', text: `${item.user_name || 'Alguém'} comentou em “${names.get(item.design_id)}”: ${item.comment}`, date: item.created_date })),
      ...orders.filter(order => order.customer_email === user.email || order.items?.some(item => item.artist_id === user.id)).map(order => ({ id: `order-${order.id}-${order.status}`, type: 'order', title: 'Atualização de pedido', text: `Pedido #${order.order_number || order.id.slice(-8)} está ${order.status}.`, date: order.updated_date || order.created_date }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));
    return { user, notifications };
  }});
  useEffect(() => { const refresh = () => cache.invalidateQueries({ queryKey: ['central-notifications'] }); const stops = [base44.entities.Like.subscribe(refresh), base44.entities.Comment.subscribe(refresh), base44.entities.Order.subscribe(refresh)]; return () => stops.forEach(stop => stop()); }, [cache]);
  const markAll = () => { const value = Date.now(); localStorage.setItem('ceu-notifications-read-at', String(value)); setReadAt(value); };
  if (isLoading) return <div className="min-h-screen bg-ceu-cloud p-12"><div className="mx-auto h-32 max-w-4xl animate-pulse rounded-3xl bg-muted"/></div>;
  if (isError) return <div className="min-h-screen bg-ceu-cloud px-4 py-20 text-center text-destructive">Não foi possível carregar suas notificações.</div>;
  if (!data?.user) return <div className="min-h-screen bg-ceu-cloud px-4 py-20 text-center"><h1 className="text-3xl font-bold text-ceu-navy">Notificações</h1><p className="mt-3 text-muted-foreground">Entre para visualizar seus alertas.</p><Button onClick={() => base44.auth.redirectToLogin('/notifications')} className="mt-6 rounded-full">Entrar e visualizar</Button></div>;
  return <div className="min-h-screen bg-ceu-cloud px-4 py-12"><div className="mx-auto max-w-4xl"><header className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-2 flex items-center gap-2 text-ceu-aqua"><Bell className="h-5 w-5"/><span className="text-sm font-semibold">Tudo em um só lugar</span></div><h1 className="text-4xl font-bold text-ceu-navy">Notificações</h1><p className="mt-2 text-muted-foreground">Curtidas, comentários e atualizações dos seus pedidos.</p></div><Button variant="outline" onClick={markAll} className="rounded-full"><CheckCheck/>Marcar como lidas</Button></header><NotificationList notifications={data.notifications} readAt={readAt}/></div></div>;
}