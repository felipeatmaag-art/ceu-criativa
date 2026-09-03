import { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from '@/components/ui/use-toast';

export default function SaleRealtimeAlert({ userId }) {
  useEffect(() => {
    if (!userId) return;

    return base44.entities.Order.subscribe((event) => {
      const isPaid = event.data?.status === 'paid';
      const isConfirmation = event.type === 'update' || event.type === 'create';
      const items = (event.data?.items || []).filter((item) => item.artist_id === userId);
      if (!isPaid || !isConfirmation || items.length === 0) return;

      const quantity = items.reduce((total, item) => total + (item.quantity || 1), 0);
      const design = items[0]?.design_title || 'Seu design';
      toast({
        title: 'Nova venda confirmada!',
        description: `${design} • ${quantity} ${quantity === 1 ? 'item vendido' : 'itens vendidos'} • Pedido #${event.data.order_number || 'novo'}`,
      });
    });
  }, [userId]);

  return null;
}