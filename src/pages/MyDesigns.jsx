import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  Trash2,
  Sliders,
  CheckSquare,
  Square,
  ShieldCheck,
  X
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
import ProductionFiles from '@/components/create/ProductionFiles';
import {
  BulkDeleteDialog,
  BulkEditDialog,
  SingleEditDialog,
} from '@/components/products/BulkDesignActionsModal';

export default function MyDesigns() {
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: designs = [], isLoading } = useQuery({
    queryKey: ['my-designs', user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Se for admin, ou buscar pelo ID do artista
      const list = await base44.entities.Design.filter({ artist_id: user.id }, '-created_date', 200);
      return list || [];
    },
    enabled: !!user,
  });

  // Seleção múltipla para ações em lote
  const [selectedIds, setSelectedIds] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Modais de ação
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const [editingDesign, setEditingDesign] = useState(null);
  const [isSavingSingle, setIsSavingSingle] = useState(false);

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

  // Handlers de seleção
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectAll = (currentList = designs) => {
    setSelectedIds(currentList.map(d => d.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const selectedDesignsObjects = useMemo(() => {
    return designs.filter(d => selectedIds.includes(d.id));
  }, [designs, selectedIds]);

  // Excluir em Lote
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await base44.entities.Design.bulkDelete(selectedIds);
      const count = selectedIds.length;
      setSelectedIds([]);
      setBulkDeleteDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['my-designs'] });
      setFeedbackMessage({
        type: 'success',
        text: `✓ ${count} ${count === 1 ? 'estampa foi excluída' : 'estampas foram excluídas'} com sucesso!`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      console.error('Erro ao excluir estampas:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Erro ao excluir estampas. Tente novamente.'
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Editar em Lote
  const handleConfirmBulkEdit = async (patchData) => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      const cleanPatch = { ...patchData };
      delete cleanPatch._addTag;
      await base44.entities.Design.bulkUpdate(selectedIds, cleanPatch);
      const count = selectedIds.length;
      setSelectedIds([]);
      setBulkEditDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['my-designs'] });
      setFeedbackMessage({
        type: 'success',
        text: `✓ ${count} ${count === 1 ? 'estampa foi atualizada' : 'estampas foram atualizadas'} em lote!`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      console.error('Erro ao editar em lote:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Erro ao salvar alterações em lote.'
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Salvar Edição Individual
  const handleSaveSingleDesign = async (designId, updatedData) => {
    setIsSavingSingle(true);
    try {
      await base44.entities.Design.update(designId, updatedData);
      setEditingDesign(null);
      await queryClient.invalidateQueries({ queryKey: ['my-designs'] });
      setFeedbackMessage({
        type: 'success',
        text: '✓ Estampa atualizada com sucesso!'
      });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar estampa:', err);
    } finally {
      setIsSavingSingle(false);
    }
  };

  const DesignItem = ({ design, index }) => {
    const status = statusConfig[design.status] || statusConfig.rascunho;
    const StatusIcon = status.icon;
    const isSelected = selectedIds.includes(design.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        className={`relative bg-white rounded-2xl overflow-hidden transition-all group flex flex-col ${
          isSelected 
            ? 'border-2 border-purple-600 shadow-lg shadow-purple-500/15 ring-2 ring-purple-400/30' 
            : 'border border-slate-200/80 shadow-sm hover:shadow-md'
        }`}
      >
        {/* Checkbox de seleção rápida */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleSelect(design.id);
          }}
          className={`absolute top-3 left-3 z-30 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-purple-600 text-white shadow-md'
              : 'bg-white/95 text-slate-400 hover:text-purple-600 border border-slate-300 hover:border-purple-400 shadow-sm'
          }`}
          title={isSelected ? "Desmarcar" : "Selecionar para excluir ou editar"}
        >
          {isSelected ? (
            <CheckSquare className="w-4 h-4 text-white" />
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>

        <div 
          onClick={() => toggleSelect(design.id)}
          className="relative aspect-square cursor-pointer overflow-hidden bg-slate-50 flex items-center justify-center p-2"
        >
          <img
            src={design.image_url}
            alt={design.title}
            className={`w-full h-full object-contain transition-transform duration-300 ${
              isSelected ? 'scale-105' : 'group-hover:scale-105'
            }`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/icon.svg';
            }}
          />
          
          {/* Status Badge */}
          <Badge className={`absolute top-3 right-3 z-10 ${status.color}`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {status.label}
          </Badge>

          {/* AI Badge */}
          {design.is_ai_generated && (
            <Badge className="absolute bottom-3 left-3 bg-purple-600 text-white border-0 text-[10px]">
              <Sparkles className="w-3 h-3 mr-1" />
              IA
            </Badge>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
            <Link to={createPageUrl(`DesignDetail?id=${design.id}`)} onClick={(e) => e.stopPropagation()}>
              <Button variant="secondary" size="sm" className="rounded-xl shadow-md text-xs">
                <Eye className="w-3.5 h-3.5 mr-1.5" />
                Ver Detalhes
              </Button>
            </Link>
          </div>
        </div>

        <div className="p-4 flex flex-1 flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 truncate text-sm" title={design.title}>
                  {design.title}
                </h3>
                <p className="text-xs text-gray-500 capitalize">{design.category?.replace(/_/g, ' ')}</p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => setEditingDesign(design)} className="cursor-pointer">
                    <Pencil className="w-4 h-4 mr-2 text-purple-600" />
                    Editar Estampa
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => {
                      setSelectedIds([design.id]);
                      setBulkDeleteDialogOpen(true);
                    }} 
                    className="text-red-600 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Excluir Estampa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <ProductionFiles production={design.production} />
          </div>

          <div>
            {/* Stats */}
            <div className="flex items-center gap-3 mt-4 pt-3 border-t text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" />
                {design.likes_count || 0}
              </span>
              <span className="flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5" />
                {design.sales_count || 0}
              </span>
              <span className="flex items-center gap-1 ml-auto font-bold text-green-600">
                R$ {Number(design.price_base || 49.9).toFixed(2).replace('.', ',')}
              </span>
            </div>

            {/* Quick buttons */}
            <div className="grid grid-cols-2 gap-1.5 mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditingDesign(design)}
                className="h-7 rounded-xl text-[11px] font-bold border-slate-200 hover:border-purple-300 hover:text-purple-700"
              >
                <Pencil className="w-3 h-3 mr-1" />
                Editar
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedIds([design.id]);
                  setBulkDeleteDialogOpen(true);
                }}
                className="h-7 rounded-xl text-[11px] font-bold border-slate-200 text-red-600 hover:border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3 mr-1" />
                Excluir
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-slate-50/30 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">Minhas Estampas</h1>
              {user?.role === 'admin' && (
                <Link to="/ProductAdmin?tab=designs">
                  <Badge className="bg-purple-100 hover:bg-purple-200 text-purple-700 border-0 cursor-pointer text-xs">
                    <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                    Abrir Painel Geral do Catálogo
                  </Badge>
                </Link>
              )}
            </div>
            <p className="text-gray-500 text-sm">
              {designs.length} {designs.length === 1 ? 'estampa no seu acervo' : 'estampas no seu acervo'}. Selecione várias para <strong>excluir juntas</strong> ou editar em lote.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <Link to="/ProductAdmin?tab=designs">
                <Button variant="outline" className="rounded-xl border-slate-300 text-xs font-bold h-10">
                  <Sliders className="w-4 h-4 mr-1.5 text-purple-600" />
                  Painel de Gestão Completo
                </Button>
              </Link>
            )}
            <Link to={createPageUrl('Create')}>
              <Button className="ceu-gradient text-white rounded-xl text-xs font-bold h-10 shadow-md shadow-purple-600/20">
                <Plus className="w-4 h-4 mr-1.5" />
                Nova Estampa
              </Button>
            </Link>
          </div>
        </div>

        {/* Feedback message */}
        {feedbackMessage && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center justify-between text-sm font-semibold transition-all shadow-sm ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                : 'bg-red-50 text-red-900 border border-red-200'
            }`}
          >
            <span>{feedbackMessage.text}</span>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-slate-700 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* BULK MANAGEMENT TOOLBAR */}
        {designs.length > 0 && (
          <div className={`p-4 rounded-2xl border mb-6 transition-all ${
            selectedIds.length > 0 
              ? 'bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 border-purple-300 shadow-md ring-2 ring-purple-500/20'
              : 'bg-white border-slate-200/80 shadow-sm'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant={selectedIds.length === designs.length ? "secondary" : "outline"}
                  size="sm"
                  onClick={selectedIds.length === designs.length ? clearSelection : () => selectAll(designs)}
                  className="rounded-xl h-9 text-xs font-bold"
                >
                  {selectedIds.length === designs.length ? (
                    <>
                      <CheckSquare className="w-4 h-4 mr-1.5 text-purple-600" />
                      Desmarcar Todas
                    </>
                  ) : (
                    <>
                      <Square className="w-4 h-4 mr-1.5 text-slate-500" />
                      Selecionar Todas ({designs.length})
                    </>
                  )}
                </Button>

                {selectedIds.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-extrabold shadow-sm">
                    <Sparkles className="w-3.5 h-3.5" />
                    {selectedIds.length} selecionadas
                  </span>
                )}
              </div>

              {selectedIds.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs h-9 px-3.5 shadow-sm shadow-red-600/30"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Excluir Selecionadas ({selectedIds.length})
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setBulkEditDialogOpen(true)}
                    className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs h-9 px-3.5 shadow-sm shadow-purple-600/30"
                  >
                    <Sliders className="w-4 h-4 mr-1.5" />
                    Editar em Lote ({selectedIds.length})
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    className="rounded-xl text-slate-600 hover:text-slate-900 h-9 text-xs"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

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
              <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow text-xs font-bold">
                Todas ({groupedDesigns.all.length})
              </TabsTrigger>
              <TabsTrigger value="aprovado" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow text-xs font-bold">
                Aprovadas ({groupedDesigns.aprovado.length})
              </TabsTrigger>
              <TabsTrigger value="pendente" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow text-xs font-bold">
                Análise ({groupedDesigns.pendente.length})
              </TabsTrigger>
              <TabsTrigger value="rascunho" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow text-xs font-bold">
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

      {/* DIÁLOGOS DE AÇÃO EM LOTE E INDIVIDUAL */}
      <BulkDeleteDialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        selectedDesigns={selectedDesignsObjects}
        onConfirmDelete={handleConfirmBulkDelete}
        isDeleting={isBulkDeleting}
      />

      <BulkEditDialog
        open={bulkEditDialogOpen}
        onClose={() => setBulkEditDialogOpen(false)}
        selectedDesigns={selectedDesignsObjects}
        onConfirmEdit={handleConfirmBulkEdit}
        isUpdating={isBulkUpdating}
      />

      <SingleEditDialog
        open={!!editingDesign}
        onClose={() => setEditingDesign(null)}
        design={editingDesign}
        onSave={handleSaveSingleDesign}
        isSaving={isSavingSingle}
      />
    </div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 p-8"
    >
      <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
        <Palette className="w-12 h-12 text-purple-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Nenhuma estampa encontrada
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        Crie sua primeira estampa e comece a disponibilizá-la na sua loja ou acervo!
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
