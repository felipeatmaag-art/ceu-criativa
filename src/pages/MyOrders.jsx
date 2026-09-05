import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingBag, 
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ProductionFiles from '@/components/create/ProductionFiles';

export default function MyOrders() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['my-orders', user?.email],
    queryFn: () => base44.entities.Order.filter({ customer_email: user?.email }, '-created_date', 50),
    enabled: !!user,
  });

  const statusConfig = {
    pending: { label: 'Pendente', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    paid: { label: 'Pago', icon: CheckCircle, color: 'bg-blue-100 text-blue-700' },
    producing: { label: 'Em Produção', icon: Package, color: 'bg-purple-100 text-purple-700' },
    shipped: { label: 'Enviado', icon: Truck, color: 'bg-green-100 text-green-700' },
    delivered: { label: 'Entregue', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    cancelled: { label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-700' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Meus Pedidos</h1>
          <p className="text-gray-500 mt-1">{orders.length} pedidos realizados</p>
        </motion.div>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.pending;
              const StatusIcon = status.icon;

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        Pedido #{order.order_number || order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.created_date && format(new Date(order.created_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {status.label}
                    </Badge>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex flex-wrap gap-4">
                      {order.items?.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center">
                            {item.mockup_url || item.design_image ? <img src={item.mockup_url || item.design_image} alt={item.design_title} className="h-full w-full object-contain rounded-xl" /> : <Package className="h-6 w-6 text-muted-foreground" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{item.design_title}</p>
                            <p className="text-xs text-gray-500">
                              {item.size && `Tam: ${item.size}`} {item.color && `• ${item.color}`}
                            </p>
                            <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                            <ProductionFiles production={item.production} />
                          </div>
                        </div>
                      ))}

                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="text-gray-500">Total</span>
                      <span className="text-xl font-bold">R$ {order.total?.toFixed(2)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum pedido ainda
            </h3>
            <p className="text-gray-500 mb-6">
              Explore nossas estampas e faça seu primeiro pedido!
            </p>
            <Link to={createPageUrl('Explore')}>
              <Button className="ceu-gradient text-white rounded-xl">
                Explorar Estampas
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}