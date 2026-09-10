import React from 'react';
import { Bell, Heart, MessageCircle, PackageCheck } from 'lucide-react';
import moment from 'moment';

const config = {
  like: { icon: Heart, color: 'bg-rose-100 text-rose-600' },
  comment: { icon: MessageCircle, color: 'bg-blue-100 text-blue-600' },
  order: { icon: PackageCheck, color: 'bg-emerald-100 text-emerald-700' }
};

export default function NotificationList({ notifications, readAt }) {
  if (!notifications.length) return <div className="rounded-3xl border bg-card p-12 text-center"><Bell className="mx-auto h-10 w-10 text-muted-foreground/40"/><p className="mt-4 font-semibold text-foreground">Tudo tranquilo por aqui</p><p className="mt-1 text-sm text-muted-foreground">Novas curtidas, comentários e pedidos aparecerão nesta página.</p></div>;
  return <div className="overflow-hidden rounded-3xl border bg-card shadow-sm"><div className="divide-y">{notifications.map(item => { const Icon = config[item.type].icon; const unread = new Date(item.date).getTime() > readAt; return <div key={item.id} className={`flex gap-4 p-5 ${unread ? 'bg-ceu-sky/10' : ''}`}><div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${config[item.type].color}`}><Icon className="h-5 w-5"/></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><p className="font-medium text-foreground">{item.title}</p>{unread && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-ceu-aqua"/>}</div><p className="mt-1 text-sm text-muted-foreground">{item.text}</p><p className="mt-2 text-xs text-muted-foreground">{moment(item.date).fromNow()}</p></div></div>; })}</div></div>;
}