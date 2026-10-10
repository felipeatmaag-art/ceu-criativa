import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Sparkles, 
  Search, 
  CheckCircle2, 
  Clock, 
  Pencil, 
  Eye, 
  Shirt, 
  X, 
  Palette,
  Trash2,
  Sliders,
  CheckCheck,
  CheckSquare,
  Square,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  BulkDeleteDialog,
  BulkEditDialog,
  SingleEditDialog,
} from '@/components/products/BulkDesignActionsModal';

export default function CatalogTab({ designs = [], isLoading = false, onRefresh, user }) {
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Seleção em lote
  const [selectedIds, setSelectedIds] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Modais de ação
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const [editingDesign, setEditingDesign] = useState(null);
  const [isSavingSingle, setIsSavingSingle] = useState(false);

  // Garante lista segura sem itens nulos ou corrompidos
  const safeDesigns = useMemo(() => {
    if (!Array.isArray(designs)) return [];
    return designs.filter((d) => d && typeof d === 'object' && d.id);
  }, [designs]);

  // Contagens por status
  const counts = useMemo(() => {
    return {
      all: safeDesigns.length,
      aprovado: safeDesigns.filter((d) => d.status === 'aprovado').length,
      pendente: safeDesigns.filter((d) => d.status === 'pendente').length,
      rascunho: safeDesigns.filter((d) => d.status === 'rascunho').length,
    };
  }, [safeDesigns]);

  // Estampas filtradas
  const filteredDesigns = useMemo(() => {
    return safeDesigns.filter((design) => {
      if (statusFilter !== 'ALL' && design.status !== statusFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = String(design.title || '').toLowerCase().includes(q);
        const matchesCategory = String(design.category || '').toLowerCase().includes(q);
        const matchesArtist = String(design.artist_name || design.created_by || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory && !matchesArtist) return false;
      }
      return true;
    });
  }, [safeDesigns, statusFilter, searchQuery]);

  // Seleção handlers
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelectedIds(filteredDesigns.map((d) => d.id));
  };

  const clearSelection = () => {
    setSelectedIds([]);
  };

  const isAllSelected = filteredDesigns.length > 0 &&
    filteredDesigns.every((d) => selectedIds.includes(d.id));

  const selectedObjects = useMemo(() => {
    return safeDesigns.filter((d) => selectedIds.includes(d.id));
  }, [safeDesigns, selectedIds]);

  // Ação em Lote: EXCLUIR
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await base44.entities.Design.bulkDelete(selectedIds);
      const count = selectedIds.length;
      setSelectedIds([]);
      setBulkDeleteDialogOpen(false);
      if (onRefresh) onRefresh();
      setFeedbackMessage({
        type: 'success',
        text: `✓ ${count} ${count === 1 ? 'estampa foi excluída' : 'estampas foram excluídas'} com sucesso!`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      console.error('Erro ao excluir estampas:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Erro ao excluir estampas selecionadas.'
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Ação em Lote: EDITAR
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
      if (onRefresh) onRefresh();
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

  // Ação em Lote: APROVAR
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      await base44.entities.Design.bulkUpdate(selectedIds, {
        status: 'aprovado',
        published_date: new Date().toISOString()
      });
      const count = selectedIds.length;
      setSelectedIds([]);
      if (onRefresh) onRefresh();
      setFeedbackMessage({
        type: 'success',
        text: `✓ ${count} ${count === 1 ? 'estampa foi publicada' : 'estampas foram publicadas'} na loja!`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      console.error('Erro ao aprovar em lote:', err);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Ação individual: APROVAR RÁPIDO
  const handleQuickPublish = async (designId) => {
    setUpdatingId(designId);
    try {
      await base44.entities.Design.update(designId, {
        status: 'aprovado',
        published_date: new Date().toISOString(),
      });
      if (onRefresh) onRefresh();
      setFeedbackMessage({
        type: 'success',
        text: '✓ Estampa aprovada e publicada na loja!'
      });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao aprovar estampa:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  // Ação individual: EDITAR
  const handleSaveSingle = async (designId, updatedData) => {
    setIsSavingSingle(true);
    try {
      await base44.entities.Design.update(designId, updatedData);
      setEditingDesign(null);
      if (onRefresh) onRefresh();
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

  if (isLoading) {
    return (
      <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-8 w-44 bg-slate-200 animate-pulse rounded-xl" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="aspect-square rounded-2xl bg-slate-100 animate-pulse border" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Palette className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Galeria Autoral do Artista
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Meu Catálogo de Estampas
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {safeDesigns.length} {safeDesigns.length === 1 ? 'estampa cadastrada' : 'estampas cadastradas'}. Selecione várias para <strong>excluir juntas</strong> ou editar em lote.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {user?.role === 'admin' && (
            <Link to="/ProductAdmin?tab=designs">
              <Button variant="outline" className="rounded-xl border-slate-300 text-xs font-bold h-10">
                <ShieldCheck className="w-4 h-4 mr-1.5 text-purple-600" />
                Painel Master do Estúdio
              </Button>
            </Link>
          )}

          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              className="rounded-xl border-slate-300 text-xs font-semibold h-10 px-3"
              title="Recarregar catálogo"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Recarregar
            </Button>
          )}

          <Link to={createPageUrl('Create')}>
            <Button className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 px-4 shadow-md shadow-purple-600/20">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Criar Nova Estampa
            </Button>
          </Link>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm font-semibold transition-all shadow-sm ${
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

      {/* BARRA DE AÇÕES EM LOTE (SELEÇÃO MÚLTIPLA) */}
      <div className={`p-4 rounded-2xl border transition-all ${
        selectedIds.length > 0 
          ? 'bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 border-purple-300 shadow-md ring-2 ring-purple-500/20'
          : 'bg-slate-50/70 border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant={isAllSelected ? "secondary" : "outline"}
              size="sm"
              onClick={isAllSelected ? clearSelection : selectAll}
              className="rounded-xl h-9 text-xs font-bold bg-white"
            >
              {isAllSelected ? (
                <>
                  <CheckSquare className="w-4 h-4 mr-1.5 text-purple-600" />
                  Desmarcar Todas
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 mr-1.5 text-slate-500" />
                  Selecionar Todas ({filteredDesigns.length})
                </>
              )}
            </Button>

            {selectedIds.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-extrabold shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                {selectedIds.length} {selectedIds.length === 1 ? 'estampa selecionada' : 'estampas selecionadas'}
              </span>
            ) : (
              <span className="text-xs text-slate-500">
                Marque os quadradinhos nas estampas para <strong>excluir várias juntas</strong> ou editar em lote.
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
                size="sm"
                onClick={handleBulkApprove}
                disabled={isBulkUpdating}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 px-3.5 shadow-sm shadow-emerald-600/30"
              >
                <CheckCheck className="w-4 h-4 mr-1.5" />
                Aprovar ({selectedIds.length})
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

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Abas de Status */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-slate-100/80 border border-slate-200/60 max-w-fit">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              statusFilter === 'ALL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('aprovado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'aprovado'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Publicadas ({counts.aprovado})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pendente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'pendente'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            Em Revisão ({counts.pendente})
          </button>
          {counts.rascunho > 0 && (
            <button
              type="button"
              onClick={() => setStatusFilter('rascunho')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                statusFilter === 'rascunho'
                  ? 'bg-slate-700 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rascunhos ({counts.rascunho})
            </button>
          )}
        </div>

        {/* Input de Busca */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título ou estilo..."
            className="pl-9 h-9 text-xs rounded-xl bg-slate-50 border-slate-200 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grade de Estampas */}
      {filteredDesigns.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredDesigns.map((design) => {
            const isApproved = design.status === 'aprovado';
            const isPending = design.status === 'pendente';
            const isUpdating = updatingId === design.id;
            const isSelected = selectedIds.includes(design.id);

            return (
              <article
                key={design.id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl bg-white transition-all ${
                  isSelected
                    ? 'border-2 border-purple-600 shadow-lg shadow-purple-500/15 ring-2 ring-purple-400/30'
                    : 'border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
                }`}
              >
                {/* Checkbox de seleção rápida */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(design.id);
                  }}
                  className={`absolute top-2.5 left-2.5 z-30 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
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

                {/* Imagem da Estampa */}
                <div 
                  onClick={() => toggleSelect(design.id)}
                  className="relative aspect-square w-full overflow-hidden bg-slate-50 flex items-center justify-center p-3 cursor-pointer"
                >
                  <img
                    src={design.image_url || '/icon.svg'}
                    alt={design.title || 'Estampa Céu Criativa'}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/icon.svg';
                    }}
                    className={`h-full w-full object-contain transition-transform duration-300 ${
                      isSelected ? 'scale-105' : 'group-hover:scale-105'
                    }`}
                  />

                  {/* Badge de Status no topo direito */}
                  <div className="absolute top-2.5 right-2.5 z-20">
                    {isApproved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        Publicada
                      </span>
                    ) : isPending ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/95 backdrop-blur-sm px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-sm">
                        <Clock className="w-3 h-3" />
                        Em Análise
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-600/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-sm">
                        <Pencil className="w-3 h-3" />
                        Rascunho
                      </span>
                    )}
                  </div>

                  {/* Overlay ao passar mouse */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-3 pointer-events-none">
                    <span className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs shadow-lg">
                      {isSelected ? '✓ Selecionada' : 'Clique para selecionar'}
                    </span>
                  </div>
                </div>

                {/* Dados da Estampa */}
                <div className="flex flex-1 flex-col justify-between p-3.5 space-y-2.5">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm truncate group-hover:text-purple-700 transition-colors" title={design.title}>
                      {design.title || 'Estampa Sem Título'}
                    </h3>
                    <div className="flex items-center justify-between text-xs mt-1">
                      <span className="text-slate-500 font-medium truncate capitalize">
                        {design.category || 'Geral'}
                      </span>
                      <span className="font-black text-slate-900 shrink-0">
                        R$ {Number(design.price_base || 49.9).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  {/* Ações da Estampa */}
                  <div className="space-y-1.5 pt-1 border-t border-slate-100">
                    {isPending && (
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleQuickPublish(design.id)}
                        disabled={isUpdating}
                        className="w-full h-7 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm"
                      >
                        {isUpdating ? 'Publicando...' : '✓ Aprovar e Publicar'}
                      </Button>
                    )}

                    <div className="grid grid-cols-2 gap-1.5">
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

                    <Link
                      to={`/DesignDetail?id=${design.id}`}
                      className="block text-center text-[10px] text-slate-500 hover:text-purple-600 font-semibold pt-1"
                    >
                      <Eye className="w-3 h-3 inline mr-1" />
                      Ver detalhes completos
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
            <Shirt className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Nenhuma estampa encontrada
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery
              ? `Nenhum resultado para "${searchQuery}". Tente outro termo.`
              : 'Você ainda não cadastrou estampas com esse filtro.'}
          </p>
          <div className="pt-2">
            <Link to={createPageUrl('Create')}>
              <Button className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold h-9 px-5">
                <Sparkles className="w-4 h-4 mr-1.5" />
                Criar Nova Estampa
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* DIÁLOGOS DE AÇÃO EM LOTE E INDIVIDUAL */}
      <BulkDeleteDialog
        open={bulkDeleteDialogOpen}
        onClose={() => setBulkDeleteDialogOpen(false)}
        selectedDesigns={selectedObjects}
        onConfirmDelete={handleConfirmBulkDelete}
        isDeleting={isBulkDeleting}
      />

      <BulkEditDialog
        open={bulkEditDialogOpen}
        onClose={() => setBulkEditDialogOpen(false)}
        selectedDesigns={selectedObjects}
        onConfirmEdit={handleConfirmBulkEdit}
        isUpdating={isBulkUpdating}
      />

      <SingleEditDialog
        open={!!editingDesign}
        onClose={() => setEditingDesign(null)}
        design={editingDesign}
        onSave={handleSaveSingle}
        isSaving={isSavingSingle}
      />
    </section>
  );
}
