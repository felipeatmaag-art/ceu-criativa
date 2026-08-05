import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, ShoppingBag, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ICONS = {
  like: Heart,
  comment: MessageCircle,
  sale: ShoppingBag,
};

const COLORS = {
  like: { bg: 'bg-rose-50', ring: 'ring-rose-100', text: 'text-rose-500', accent: 'bg-rose-500' },
  comment: { bg: 'bg-blue-50', ring: 'ring-blue-100', text: 'text-blue-500', accent: 'bg-blue-500' },
  sale: { bg: 'bg-emerald-50', ring: 'ring-emerald-100', text: 'text-emerald-500', accent: 'bg-emerald-500' },
};

export default function RealtimeToasts({ userId, designs = [] }) {
  const [toasts, setToasts] = useState([]);
  const designIds = new Set(designs.map(d => d.id));

  const pushToast = useCallback((toast) => {
    const id = `${toast.type}-${toast.key}-${Date.now()}`;
    setToasts(prev => [{ ...toast, id }, ...prev].slice(0, 4));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  // Likes
  useEffect(() => {
    if (!userId || designs.length === 0) return;
    const unsub = base44.entities.Like.subscribe((event) => {
      if (event.type === 'create' && designIds.has(event.data?.design_id)) {
        const design = designs.find(d => d.id === event.data.design_id);
        pushToast({
          type: 'like',
          key: event.data.id || event.data.design_id,
          title: 'Nova curtida ❤️',
          text: `"${design?.title || 'seu design'}" recebeu uma curtida`,
        });
      }
    });
    return unsub;
  }, [userId, designs.length]);

  // Comments
  useEffect(() => {
    if (!userId || designs.length === 0) return;
    const unsub = base44.entities.Comment.subscribe((event) => {
      if (event.type === 'create' && designIds.has(event.data?.design_id)) {
        const design = designs.find(d => d.id === event.data.design_id);
        pushToast({
          type: 'comment',
          key: event.data.id || event.data.design_id,
          title: 'Novo comentário 💬',
          text: `Em "${design?.title || 'seu design'}"`,
        });
      }
    });
    return unsub;
  }, [userId, designs.length]);

  // Orders / sales
  useEffect(() => {
    if (!userId) return;
    const unsub = base44.entities.Order.subscribe((event) => {
      if (event.type === 'create') {
        const hasMyItems = event.data?.items?.some(it => it.artist_id === userId);
        if (hasMyItems) {
          pushToast({
            type: 'sale',
            key: event.data.id || event.data.order_number,
            title: 'Nova venda! 🎉',
            text: `Pedido #${event.data.order_number || 'novo'} confirmado`,
          });
        }
      }
    });
    return unsub;
  }, [userId]);

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map(t => {
          const Icon = ICONS[t.type];
          const c = COLORS[t.type];
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 60, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 60, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              className="pointer-events-auto bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="flex items-start gap-3 p-3 pr-2">
                <div className={`w-9 h-9 rounded-xl ${c.bg} ring-4 ${c.ring} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${c.text}`} />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{t.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">{t.text}</p>
                </div>
                <button
                  onClick={() => dismiss(t.id)}
                  className="w-6 h-6 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <motion.div
                className={`h-0.5 ${c.accent}`}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
              />
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}