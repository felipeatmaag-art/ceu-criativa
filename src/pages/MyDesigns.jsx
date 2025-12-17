import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Palette, 
  Eye, 
  Heart, 
  ShoppingBag,
  Clock,
  CheckCircle,
  XCircle,
  Sparkles,
  MoreVertical,
  Pencil,
  Trash2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MyDesigns() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: designs = [], isLoading } = useQuery({
    queryKey: ['my-designs', user?.id],
    queryFn: () => base44.entities.Design.filter({ created_by: user?.email }, '-created_date', 50),
    enabled: !!user,
  });

  const statusConfig = {
    rascunho: { label: 'Rascunho', icon: Pencil, color: 'bg-gray-100 text-gray-700' },
    pendente: { label: 'Em Análise', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
    aprovado: { label: 'Aprovado', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
    rejeitado: { label: 'Rejeitado', icon: XCircle, color: 'bg-red-100 text-red-700' },
  };

  const groupedDesigns = {
    all: designs,
    aprovado: designs.filter(d => d.status === 'aprovado'),
    pendente: designs.filter(d => d.status === 'pendente'),
    rascunho: designs.filter(d => d.status === 'rascunho'),
  };

  const DesignItem = ({ design, index }) => {
    const status = statusConfig[design.status] || statusConfig.rascunho;
    const StatusIcon = status.icon;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all group"
      >
        <div className="relative aspect-square">
          <img
            src={design.image_url}
            alt={design.title}
            className="w-full h-full object-cover"
          />
          
          {/* Status Badge */}
          <Badge className={`absolute top-3 left-3 ${status.color}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>

          {/* AI Badge */}
          {design.is_ai_generated && (
            <Badge className="absolute top-3 right-3 bg-purple-600 text-white border-0">
              <Sparkles className="w-3 h-3 mr-1" />
              IA
            </Badge>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Link to={createPageUrl(`DesignDetail?id=${design.id}`)}>
              <Button variant="secondary" size="sm" className="rounded-xl">
                <Eye className="w-4 h-4 mr-2" />
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{design.title}</h3>
              <p className="text-sm text-gray-500 capitalize">{design.category?.replace(/_/g, ' ')}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="shrink-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" />
              {design.likes_count || 0}
            </span>
            <span className="flex items-center gap-1">
              <ShoppingBag className="w-4 h-4" />
              {design.sales_count || 0}
            </span>
            <span className="flex items-center gap-1 ml-auto font-medium text-green-600">
              R$ {((design.sales_count || 0) * (design.price_base || 0) * 0.3).toFixed(2)}
            </span>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Minhas Estampas</h1>
            <p className="text-gray-500 mt-1">{designs.length} estampas criadas</p>
          </div>
          <Link to={createPageUrl('Create')}>
            <Button className="ceu-gradient text-white rounded-xl">
              <Plus className="w-5 h-5 mr-2" />
              Nova Estampa
            </Button>
          </Link>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <Skeleton className="aspect-square" />
                <div className="p-4">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : designs.length > 0 ? (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full max-w-lg mx-auto grid grid-cols-4 h-12 rounded-xl bg-gray-100 p-1 mb-8">
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
                Todas ({groupedDesigns.all.length})
              </TabsTrigger>
              <TabsTrigger value="aprovado" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
                Aprovadas ({groupedDesigns.aprovado.length})
              </TabsTrigger>
              <TabsTrigger value="pendente" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
                Análise ({groupedDesigns.pendente.length})
              </TabsTrigger>
              <TabsTrigger value="rascunho" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow">
                Rascunhos ({groupedDesigns.rascunho.length})
              </TabsTrigger>
            </TabsList>

            {Object.entries(groupedDesigns).map(([key, items]) => (
              <TabsContent key={key} value={key}>
                {items.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {items.map((design, index) => (
                      <DesignItem key={design.id} design={design} index={index} />
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20"
    >
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
        <Palette className="w-12 h-12 text-purple-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Nenhuma estampa ainda
      </h3>
      <p className="text-gray-500 mb-6">
        Crie sua primeira estampa e comece a ganhar!
      </p>
      <Link to={createPageUrl('Create')}>
        <Button className="ceu-gradient text-white rounded-xl">
          <Plus className="w-5 h-5 mr-2" />
          Criar Estampa
        </Button>
      </Link>
    </motion.div>
  );
}