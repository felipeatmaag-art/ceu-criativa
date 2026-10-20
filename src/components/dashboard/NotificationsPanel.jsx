import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Bell, X, Heart, ShoppingBag, MessageCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import moment from 'moment';

export default function NotificationsPanel({ userId, designs }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef(null);
  const designIds = new Set(designs.map(d => d.id));

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addNotification = (notif) => {
    setNotifications(prev => [notif, ...prev].slice(0, 30));
    setUnread(prev => prev + 1);
  };

  // Subscribe to real-time likes
  useEffect(() => {
    if (!userId || designs.length === 0) return;
    const unsub = base44.entities.Like.subscribe((event) => {
      if (event.type === 'create' && designIds.has(event.data?.design_id)) {
        const design = designs.find(d => d.id === event.data.design_id);
        addNotification({
          id: Date.now(),
          type: 'like',
          text: `Alguém curtiu "${design?.title || 'seu design'}"`,
          time: new Date(),
          read: false
        });
      }
    });
    return unsub;
  }, [userId, designs.length]);

  // Subscribe to real-time comments
  useEffect(() => {
    if (!userId || designs.length === 0) return;
    const unsub = base44.entities.Comment.subscribe((event) => {
      if (event.type === 'create' && designIds.has(event.data?.design_id)) {
        const design = designs.find(d => d.id === event.data.design_id);
        addNotification({
          id: Date.now() + 1,
          type: 'comment',
          text: `Novo comentário em "${design?.title || 'seu design'}"`,
          time: new Date(),
          read: false
        });
      }
    });
    return unsub;
  }, [userId, designs.length]);

  // Subscribe to real-time orders
  useEffect(() => {
    if (!userId) return;
    const unsub = base44.entities.Order.subscribe((event) => {
      const isConfirmed = (event.type === 'create' || event.type === 'update') && event.data?.status === 'paid';
      const hasMyItems = event.data?.items?.some(it => it.artist_id === userId);
      if (isConfirmed && hasMyItems) {
        addNotification({
          id: Date.now() + 2,
          type: 'sale',
          text: `Nova venda confirmada! Pedido #${event.data.order_number || 'novo'}`,
          time: new Date(),
          read: false
        });
      }
    });
    return unsub;
  }, [userId]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const iconMap = {
    like: <Heart className="w-4 h-4 text-rose-500" />,
    comment: <MessageCircle className="w-4 h-4 text-blue-500" />,
    sale: <ShoppingBag className="w-4 h-4 text-emerald-500" />
  };

  const bgMap = {
    like: 'bg-rose-100',
    comment: 'bg-blue-100',
    sale: 'bg-emerald-100'
  };

  return (
    <div ref={panelRef} className="relative">
      <button
        onClick={() => { setOpen(!open); if (!open) { setUnread(0); markAllRead(); } }}
        className="relative w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center font-bold shadow"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-semibold text-gray-900 text-sm">Notificações</span>
              <div className="flex items-center gap-2">
                {notifications.length > 0 && (
                  <button onClick={markAllRead} className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                    <Check className="w-3 h-3" /> Marcar como lidas
                  </button>
                )}
                <button onClick={() => setOpen(false)}>
                  <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-gray-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Nenhuma notificação ainda</p>
                  <p className="text-xs mt-1 opacity-70">Você será notificado em tempo real</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`flex items-start gap-3 px-4 py-3 ${!n.read ? 'bg-blue-50/40' : ''} hover:bg-gray-50 transition-colors`}>
                    <div className={`w-8 h-8 rounded-full ${bgMap[n.type]} flex items-center justify-center shrink-0 mt-0.5`}>
                      {iconMap[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-800 leading-snug">{n.text}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{moment(n.time).fromNow()}</p>
                    </div>
                    {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0" />}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}