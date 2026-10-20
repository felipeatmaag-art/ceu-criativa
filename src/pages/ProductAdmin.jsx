import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import productRepository from '@/services/products/productRepository';
import { base44 } from '@/api/base44Client';
import ProductCatalogList from '@/components/products/ProductCatalogList';
import ProductCatalogDialog from '@/components/products/ProductCatalogDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminFinancialDashboard from '@/components/financial/AdminFinancialDashboard';
import AdminPaymentGatewayAndSplitManager from '@/components/admin/AdminPaymentGatewayAndSplitManager';
import AdminInventoryManager from '@/components/products/AdminInventoryManager';
import CentralizedUsersAndStoresManager from '@/components/admin/CentralizedUsersAndStoresManager';
import AdminOrdersManager from '@/components/products/AdminOrdersManager';
import BatchUploadTab from '@/components/profile/BatchUploadTab';
import { useAuth } from '@/lib/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  BulkDeleteDialog,
  BulkEditDialog,
  SingleEditDialog,
} from '@/components/products/BulkDesignActionsModal';
import { 
  Shirt,
  Boxes,
  Users,
  ShoppingBag, 
  Palette, 
  Search, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  Pencil, 
  Sliders, 
  CheckCheck, 
  CheckSquare, 
  Square, 
  X, 
  UploadCloud,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  KeyRound,
  LogIn,
  CreditCard
} from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function ProductAdmin() {
  const { user, loginAs } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'designs';

  // Produtos Base
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Estampas da plataforma
  const [designs, setDesigns] = useState([]);
  const [loadingDesigns, setLoadingDesigns] = useState(true);
  const [designSearch, setDesignSearch] = useState('');
  const [designStatusFilter, setDesignStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [designCategoryFilter, setDesignCategoryFilter] = useState('ALL');

  // Modal de upload em lote
  const [isBatchUploadOpen, setIsBatchUploadOpen] = useState(false);

  // Seleção múltipla para ações em lote
  const [selectedDesignIds, setSelectedDesignIds] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState(null);

  // Modais de ação
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [bulkEditDialogOpen, setBulkEditDialogOpen] = useState(false);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  const [editingDesign, setEditingDesign] = useState(null);
  const pendingCount = designs.filter((d) => d.status === 'pendente').length;
  const [isSavingSingle, setIsSavingSingle] = useState(false);

  const loadProducts = () => {
    setLoading(true);
    setError('');
    productRepository.listCatalog()
      .then(setProducts)
      .catch(() => setError('Não foi possível carregar o catálogo de produtos.'))
      .finally(() => setLoading(false));
  };

  const loadDesigns = () => {
    setLoadingDesigns(true);
    base44.entities.Design.list('-created_date', 250)
      .then((data) => setDesigns(data || []))
      .catch((err) => console.error('Erro ao carregar estampas:', err))
      .finally(() => setLoadingDesigns(false));
  };

  useEffect(() => {
    loadProducts();
    loadDesigns();
  }, []);

  useEffect(() => {
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setDesignStatusFilter(statusParam);
    }
  }, [searchParams]);

  const createProduct = (product) => setProducts((items) => [product, ...items]);
  const updateProduct = (updated) => setProducts((items) => items.map((item) => (item.id === updated.id ? updated : item)));
  const deleteProduct = (id) => setProducts((items) => items.filter((item) => item.id !== id));

  // Filtro de estampas
  const filteredDesigns = useMemo(() => {
    return designs.filter((d) => {
      if (designStatusFilter !== 'ALL' && d.status !== designStatusFilter) return false;
      if (designCategoryFilter !== 'ALL' && d.category !== designCategoryFilter) return false;
      if (designSearch.trim()) {
        const q = designSearch.toLowerCase();
        const matchTitle = (d.title || '').toLowerCase().includes(q);
        const matchArtist = (d.artist_name || d.created_by || '').toLowerCase().includes(q);
        const matchCategory = (d.category || '').toLowerCase().includes(q);
        if (!matchTitle && !matchArtist && !matchCategory) return false;
      }
      return true;
    });
  }, [designs, designStatusFilter, designCategoryFilter, designSearch]);

  // Handlers de seleção
  const toggleSelectDesign = (id) => {
    setSelectedDesignIds((prev) => 
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAllFiltered = () => {
    const allFilteredIds = filteredDesigns.map((d) => d.id);
    setSelectedDesignIds(allFilteredIds);
  };

  const clearSelection = () => {
    setSelectedDesignIds([]);
  };

  const isAllFilteredSelected = filteredDesigns.length > 0 && 
    filteredDesigns.every((d) => selectedDesignIds.includes(d.id));

  const selectedDesignsObjects = useMemo(() => {
    return designs.filter((d) => selectedDesignIds.includes(d.id));
  }, [designs, selectedDesignIds]);

  // Zerar todas as estampas do catálogo
  const handleWipeAllDesigns = async () => {
    if (!window.confirm('Atenção: Deseja apagar TODAS as estampas cadastradas no catálogo da loja para iniciar 100% zerado?')) {
      return;
    }
    setIsBulkDeleting(true);
    try {
      await base44.entities.Design.bulkDelete(['all']);
      setDesigns([]);
      setSelectedDesignIds([]);
      setFeedbackMessage({
        type: 'success',
        text: '✓ Catálogo zerado com sucesso! Todas as estampas foram excluídas.'
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      console.error('Erro ao zerar estampas:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Erro ao zerar estampas. Tente novamente.'
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Ação em lote: EXCLUIR
  const handleConfirmBulkDelete = async () => {
    if (selectedDesignIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await base44.entities.Design.bulkDelete(selectedDesignIds);
      const deletedCount = selectedDesignIds.length;
      setDesigns((prev) => prev.filter((d) => !selectedDesignIds.includes(d.id)));
      setSelectedDesignIds([]);
      setBulkDeleteDialogOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: `✓ ${deletedCount} ${deletedCount === 1 ? 'estampa foi excluída' : 'estampas foram excluídas'} com sucesso!`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      console.error('Erro ao excluir em lote:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Erro ao excluir estampas selecionadas. Tente novamente.'
      });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  // Ação em lote: EDITAR
  const handleConfirmBulkEdit = async (patchData) => {
    if (selectedDesignIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      const cleanPatch = { ...patchData };
      const addTag = cleanPatch._addTag;
      delete cleanPatch._addTag;

      // Executa atualização no backend
      await base44.entities.Design.bulkUpdate(selectedDesignIds, cleanPatch);

      // Atualiza estado local
      setDesigns((prev) =>
        prev.map((d) => {
          if (!selectedDesignIds.includes(d.id)) return d;
          let updatedTags = Array.isArray(d.tags) ? [...d.tags] : [];
          if (addTag && !updatedTags.includes(addTag)) {
            updatedTags.push(addTag);
          }
          return {
            ...d,
            ...cleanPatch,
            tags: addTag ? updatedTags : d.tags,
          };
        })
      );

      const count = selectedDesignIds.length;
      setSelectedDesignIds([]);
      setBulkEditDialogOpen(false);
      setFeedbackMessage({
        type: 'success',
        text: `✓ ${count} ${count === 1 ? 'estampa foi atualizada' : 'estampas foram atualizadas'} em lote com sucesso!`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      console.error('Erro ao editar em lote:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Erro ao atualizar estampas. Tente novamente.'
      });
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Ação em lote: APROVAR RÁPIDO
  const handleBulkApprove = async () => {
    if (selectedDesignIds.length === 0) return;
    setIsBulkUpdating(true);
    try {
      const patch = {
        status: 'aprovado',
        published_date: new Date().toISOString()
      };
      await base44.entities.Design.bulkUpdate(selectedDesignIds, patch);
      setDesigns((prev) =>
        prev.map((d) => (selectedDesignIds.includes(d.id) ? { ...d, ...patch } : d))
      );
      const count = selectedDesignIds.length;
      setSelectedDesignIds([]);
      setFeedbackMessage({
        type: 'success',
        text: `✓ ${count} ${count === 1 ? 'estampa foi aprovada e publicada' : 'estampas foram aprovadas e publicadas'} na loja!`
      });
      setTimeout(() => setFeedbackMessage(null), 5000);
    } catch (err) {
      console.error('Erro ao aprovar em lote:', err);
    } finally {
      setIsBulkUpdating(false);
    }
  };

  // Ação individual: APROVAR
  const handleApproveDesign = async (designId) => {
    try {
      await base44.entities.Design.update(designId, {
        status: 'aprovado',
        published_date: new Date().toISOString(),
      });
      setDesigns((prev) =>
        prev.map((d) => (d.id === designId ? { ...d, status: 'aprovado' } : d))
      );
      setFeedbackMessage({
        type: 'success',
        text: '✓ Estampa aprovada com sucesso! Ela já está visível na vitrine pública para compra.'
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error('Erro ao aprovar estampa:', err);
    }
  };

  const handleRejectDesign = async (designId) => {
    try {
      await base44.entities.Design.update(designId, {
        status: 'rejeitado',
        rejected_date: new Date().toISOString(),
      });
      setDesigns((prev) =>
        prev.map((d) => (d.id === designId ? { ...d, status: 'rejeitado' } : d))
      );
      setFeedbackMessage({
        type: 'success',
        text: 'Estampa foi rejeitada e removida da fila de aprovação.'
      });
      setTimeout(() => setFeedbackMessage(null), 4000);
    } catch (err) {
      console.error('Erro ao rejeitar estampa:', err);
    }
  };

  // Ação individual: EDITAR
  const handleSaveSingleDesign = async (designId, updatedData) => {
    setIsSavingSingle(true);
    try {
      await base44.entities.Design.update(designId, updatedData);
      setDesigns((prev) =>
        prev.map((d) => (d.id === designId ? { ...d, ...updatedData } : d))
      );
      setEditingDesign(null);
      setFeedbackMessage({
        type: 'success',
        text: '✓ Estampa atualizada com sucesso!'
      });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } catch (err) {
      console.error('Erro ao salvar estampa:', err);
      setFeedbackMessage({
        type: 'error',
        text: 'Erro ao salvar alterações da estampa.'
      });
    } finally {
      setIsSavingSingle(false);
    }
  };

  // Ação individual: EXCLUIR
  const handleDeleteSingleDesign = (design) => {
    setSelectedDesignIds([design.id]);
    setBulkDeleteDialogOpen(true);
  };

  // Verificação de Acesso: Interface exclusiva para admin@seuceu.com.br
  const isMasterUser = user && (user.role === 'admin' || user.app_role === 'master' || user.email === 'admin@seuceu.com.br' || user.id === 'admin-master-ceu');

  if (!user) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-ceu-cloud">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 mx-auto shadow-inner">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Painel de Administração Master
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Área de controle geral da Céu Criativa para gerenciamento centralizado de usuários e lojas, aprovação de estampas, controle de estoque total e configuração global de chaves Pix.
          </p>
          <div className="pt-2 space-y-2">
            <Button
              onClick={() => loginAs('admin')}
              className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-2"
            >
              <KeyRound className="w-4 h-4 text-emerald-400" />
              Entrar como admin@seuceu.com.br (1 Clique)
            </Button>
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full h-11 rounded-xl border-slate-300 text-xs font-bold gap-2">
                <LogIn className="w-4 h-4" />
                Digitar E-mail e Senha
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isMasterUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-ceu-cloud">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Acesso Restrito ao Administrador
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Esta interface de administração é restrita exclusivamente à conta Master (<strong>admin@seuceu.com.br</strong>). Você está conectado como <strong>{user.email}</strong>.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => loginAs('admin')}
              className="w-full h-11 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Alternar para Administrador Master
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-ceu-cloud px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        {/* BANNER DE IDENTIFICAÇÃO MASTER EXCLUSIVO */}
        <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row items-center justify-between gap-4 border border-slate-800 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
                  Painel Exclusivo de Administração
                </span>
                <span className="text-emerald-400 font-mono text-[11px] font-bold">
                  admin@seuceu.com.br
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
                Controle Geral da Plataforma Céu Criativa
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
                Gerenciamento centralizado de usuários e lojas, aprovação de estampas pendentes, visualização de estoque físico total e chave Pix global.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Badge className="bg-emerald-500/10 text-emerald-300 border-emerald-500/30 text-xs py-1 px-3">
              ● Gestor Geral (Sem Loja Individual)
            </Badge>
          </div>
        </div>

        <Tabs
          value={currentTab === 'stores' ? 'users' : currentTab}
          onValueChange={(val) => setSearchParams({ tab: val })}
        >
          {/* Navegação entre abas */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
            <TabsList className="rounded-2xl bg-white p-1 border border-slate-200/80 shadow-sm h-auto flex flex-wrap gap-1">
              <TabsTrigger 
                value="designs" 
                className="rounded-xl px-4 py-2 font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-1.5"
              >
                <Palette className="w-4 h-4 text-purple-500" />
                <span>Aprovação de Estampas</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>

              <TabsTrigger 
                value="users" 
                className="rounded-xl px-4 py-2 font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-1.5"
              >
                <Users className="w-4 h-4 text-pink-500" />
                <span>Usuários &amp; Lojas</span>
              </TabsTrigger>

              <TabsTrigger 
                value="inventory" 
                className="rounded-xl px-4 py-2 font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-1.5"
              >
                <Boxes className="w-4 h-4 text-emerald-500" />
                <span>Estoque Total</span>
              </TabsTrigger>

              <TabsTrigger 
                value="payments" 
                className="rounded-xl px-4 py-2 font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4 text-blue-500" />
                <span>Gateway &amp; Split Cielo</span>
              </TabsTrigger>

              <TabsTrigger 
                value="orders" 
                className="rounded-xl px-4 py-2 font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4 text-sky-500" />
                <span>Pedidos</span>
              </TabsTrigger>

              <TabsTrigger 
                value="catalog" 
                className="rounded-xl px-4 py-2 font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-1.5"
              >
                <Shirt className="w-4 h-4 text-blue-500" />
                <span>Modelos Base</span>
              </TabsTrigger>

              <TabsTrigger 
                value="finance" 
                className="rounded-xl px-4 py-2 font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white flex items-center gap-1.5"
              >
                <BarChart3 className="w-4 h-4 text-purple-500" />
                <span>Relatórios Financeiros</span>
              </TabsTrigger>
            </TabsList>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={() => setIsBatchUploadOpen(true)}
                variant="outline"
                className="rounded-xl border-purple-300 text-purple-700 hover:bg-purple-50 font-bold text-xs h-10 px-3.5 shadow-xs"
              >
                <UploadCloud className="w-4 h-4 mr-1.5 text-purple-600" />
                Subir em Lote
              </Button>

              <Link to={createPageUrl('Create')}>
                <Button className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-10 px-4 shadow-md shadow-purple-600/20">
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Criar Nova Estampa
                </Button>
              </Link>
            </div>
          </div>

          {/* Feedback Toast Banner */}
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

          {/* ========================================================================= */}
          {/* TAB 1: CATÁLOGO DE ESTAMPAS (Com seleção múltipla, exclusão e edição em lote) */}
          {/* ========================================================================= */}
          <TabsContent value="designs" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold mb-1">
                  <Palette className="w-3.5 h-3.5" />
                  Painel de Gestão & Acervo
                </div>
                <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Catálogo de Estampas & Artes
                </h1>
                <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                  Selecione várias estampas para <strong>excluir juntas</strong>, alterar status, reajustar preços em lote ou editar individualmente.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadDesigns}
                  className="rounded-xl bg-white border-slate-300 text-xs font-semibold h-9"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingDesigns ? 'animate-spin' : ''}`} />
                  Recarregar
                </Button>
              </div>
            </div>

            {/* BARRA DE AÇÕES EM LOTE (BULK MANAGEMENT TOOLBAR) */}
            <div className={`p-4 rounded-2xl border transition-all ${
              selectedDesignIds.length > 0 
                ? 'bg-gradient-to-r from-purple-50 via-slate-50 to-indigo-50 border-purple-300 shadow-md ring-2 ring-purple-500/20'
                : 'bg-white border-slate-200/80 shadow-sm'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                {/* Seleção rápida e contador */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="button"
                    variant={isAllFilteredSelected ? "secondary" : "outline"}
                    size="sm"
                    onClick={isAllFilteredSelected ? clearSelection : selectAllFiltered}
                    className="rounded-xl h-9 text-xs font-bold"
                  >
                    {isAllFilteredSelected ? (
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

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleWipeAllDesigns}
                    disabled={isBulkDeleting}
                    className="rounded-xl h-9 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    title="Excluir todas as estampas de demonstração para começar com o catálogo limpo"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" />
                    Zerar Todas as Estampas
                  </Button>

                  {selectedDesignIds.length > 0 ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-600 text-white text-xs font-extrabold shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" />
                      {selectedDesignIds.length} {selectedDesignIds.length === 1 ? 'estampa selecionada' : 'estampas selecionadas'}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500">
                      Clique nos quadrinhos das estampas para selecionar várias.
                    </span>
                  )}
                </div>

                {/* BOTÕES DE AÇÃO EM LOTE (Aparecem em destaque quando há itens selecionados) */}
                {selectedDesignIds.length > 0 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Botão EXCLUIR VÁRIAS JUNTAS */}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setBulkDeleteDialogOpen(true)}
                      className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs h-9 px-3.5 shadow-sm shadow-red-600/30"
                    >
                      <Trash2 className="w-4 h-4 mr-1.5" />
                      Excluir Selecionadas ({selectedDesignIds.length})
                    </Button>

                    {/* Botão EDITAR EM LOTE */}
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => setBulkEditDialogOpen(true)}
                      className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs h-9 px-3.5 shadow-sm shadow-purple-600/30"
                    >
                      <Sliders className="w-4 h-4 mr-1.5" />
                      Editar em Lote ({selectedDesignIds.length})
                    </Button>

                    {/* Botão APROVAR EM LOTE */}
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleBulkApprove}
                      disabled={isBulkUpdating}
                      className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-9 px-3.5 shadow-sm shadow-emerald-600/30"
                    >
                      <CheckCheck className="w-4 h-4 mr-1.5" />
                      Aprovar ({selectedDesignIds.length})
                    </Button>

                    {/* Limpar Seleção */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="rounded-xl text-slate-600 hover:text-slate-900 h-9 text-xs"
                    >
                      Cancelar Seleção
                    </Button>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 hidden md:block">
                    Modo de gestão em lote disponível
                  </div>
                )}
              </div>
            </div>

            {/* FILTROS E BUSCA */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between rounded-2xl bg-white p-3 border border-slate-200/80 shadow-sm">
              {/* Filtro por Status */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setDesignStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    designStatusFilter === 'ALL'
                      ? 'bg-slate-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Todas ({designs.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDesignStatusFilter('aprovado')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    designStatusFilter === 'aprovado'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Publicadas ({designs.filter((d) => d.status === 'aprovado').length})
                </button>
                <button
                  type="button"
                  onClick={() => setDesignStatusFilter('pendente')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    designStatusFilter === 'pendente'
                      ? 'bg-amber-500 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Em Análise ({designs.filter((d) => d.status === 'pendente').length})
                </button>
                <button
                  type="button"
                  onClick={() => setDesignStatusFilter('rascunho')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    designStatusFilter === 'rascunho'
                      ? 'bg-slate-700 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Rascunhos ({designs.filter((d) => d.status === 'rascunho').length})
                </button>
                <button
                  type="button"
                  onClick={() => setDesignStatusFilter('rejeitado')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    designStatusFilter === 'rejeitado'
                      ? 'bg-rose-600 text-white'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Rejeitadas ({designs.filter((d) => d.status === 'rejeitado').length})
                </button>
              </div>

              {/* Busca de texto */}
              <div className="relative w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={designSearch}
                  onChange={(e) => setDesignSearch(e.target.value)}
                  placeholder="Buscar por estampa, artista, categoria..."
                  className="pl-9 h-9 text-xs rounded-xl bg-slate-50 border-slate-200"
                />
              </div>
            </div>

            {/* GRADE DE ESTAMPAS COM SELEÇÃO E AÇÕES */}
            {loadingDesigns ? (
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="aspect-square rounded-2xl bg-white border animate-pulse" />
                ))}
              </div>
            ) : filteredDesigns.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500 space-y-3">
                <Palette className="w-8 h-8 mx-auto text-slate-400" />
                <p className="font-bold text-slate-800">Nenhuma estampa encontrada</p>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Tente alterar os filtros ou crie novas artes usando o gerador com inteligência artificial.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {filteredDesigns.map((design) => {
                  const isSelected = selectedDesignIds.includes(design.id);
                  const isApproved = design.status === 'aprovado';

                  return (
                    <article
                      key={design.id}
                      className={`group relative overflow-hidden rounded-2xl bg-white transition-all flex flex-col ${
                        isSelected
                          ? 'border-2 border-purple-600 shadow-lg shadow-purple-500/10 ring-2 ring-purple-400/30'
                          : 'border border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300'
                      }`}
                    >
                      {/* Checkbox de seleção rápida (canto superior esquerdo) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSelectDesign(design.id);
                        }}
                        className={`absolute top-3 left-3 z-20 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'bg-white/90 backdrop-blur-sm text-slate-400 hover:text-purple-600 border border-slate-300 hover:border-purple-400 shadow-sm'
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
                        onClick={() => toggleSelectDesign(design.id)}
                        className="relative aspect-square w-full bg-slate-50 p-3 flex items-center justify-center overflow-hidden cursor-pointer"
                      >
                        <img
                          src={design.image_url}
                          alt={design.title}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/icon.svg';
                          }}
                          className={`h-full w-full object-contain transition-transform duration-300 ${
                            isSelected ? 'scale-105' : 'group-hover:scale-105'
                          }`}
                        />

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3 z-10">
                          {isApproved ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                              <CheckCircle2 className="w-3 h-3" />
                              Publicada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/95 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                              <Clock className="w-3 h-3" />
                              Em Análise
                            </span>
                          )}
                        </div>

                        {/* Overlay com botão de visualização */}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                          <span className="px-3 py-1.5 rounded-xl bg-white/95 text-slate-900 font-bold text-xs shadow-md">
                            {isSelected ? '✓ Selecionada' : 'Clique para selecionar'}
                          </span>
                        </div>
                      </div>

                      {/* Conteúdo do Card */}
                      <div className="p-3.5 flex flex-1 flex-col justify-between space-y-3">
                        <div>
                          <div className="flex items-start justify-between gap-1">
                            <h3 className="font-bold text-slate-900 text-xs truncate group-hover:text-purple-700 flex-1" title={design.title}>
                              {design.title || 'Estampa Sem Título'}
                            </h3>
                            <span className="text-[10px] font-mono text-slate-400">
                              #{String(design.id).slice(-4)}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                            {design.category ? `Categoria: ${design.category}` : `Por: ${design.artist_name || design.created_by || 'Artista Céu'}`}
                          </p>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                            <span className="text-xs font-black text-slate-900">
                              R$ {Number(design.price_base || 49.9).toFixed(2).replace('.', ',')}
                            </span>
                            {design.is_ai_generated && (
                              <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded-md">
                                IA
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Botões de Ação Individual */}
                        <div className="space-y-1.5 pt-1">
                          {!isApproved && (
                            <div className="grid grid-cols-2 gap-1.5">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleApproveDesign(design.id)}
                                className="h-8 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                              >
                                ✓ Aprovar
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectDesign(design.id)}
                                className="h-8 rounded-xl border-red-300 text-red-600 hover:bg-red-50 font-bold text-xs"
                              >
                                ✕ Rejeitar
                              </Button>
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-1.5">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingDesign(design)}
                              className="h-7 rounded-xl text-[11px] font-bold border-slate-300 text-slate-700 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-300"
                            >
                              <Pencil className="w-3 h-3 mr-1" />
                              Editar
                            </Button>

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteSingleDesign(design)}
                              className="h-7 rounded-xl text-[11px] font-bold border-slate-300 text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Excluir
                            </Button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB 2: MODELOS BASE DE ROUPAS (Camisetas, Canecas, etc.) */}
          {/* ========================================================================= */}
          <TabsContent value="catalog" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-ceu-navy">
                  Modelos de Vestuário & Insumos
                </p>
                <h1 className="mt-1 text-3xl font-extrabold text-ceu-navy tracking-tight">
                  Gerenciar Modelos Base
                </h1>
                <p className="mt-1 text-sm text-muted-foreground max-w-3xl">
                  Mantenha material e modelagem organizados, envie a foto de cada modelo e configure as cores que serão disponibilizadas no painel Criar.
                </p>
              </div>
              <ProductCatalogDialog onCreated={createProduct} />
            </div>

            {loading ? (
              <p className="text-muted-foreground">Carregando modelos...</p>
            ) : error ? (
              <div className="rounded-3xl border bg-card p-8 text-center">
                <p className="text-destructive">{error}</p>
                <Button type="button" variant="outline" onClick={loadProducts} className="mt-4 rounded-full">
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <ProductCatalogList products={products} onUpdated={updateProduct} onDeleted={deleteProduct} />
            )}
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB: ESTOQUE TOTAL FÍSICO */}
          {/* ========================================================================= */}
          <TabsContent value="inventory" className="space-y-6">
            <AdminInventoryManager />
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB: GERENCIAMENTO CENTRALIZADO DE USUÁRIOS E LOJAS */}
          {/* ========================================================================= */}
          <TabsContent value="users" className="space-y-6">
            <CentralizedUsersAndStoresManager />
          </TabsContent>
          <TabsContent value="stores" className="space-y-6">
            <CentralizedUsersAndStoresManager />
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB: CONFIGURAÇÕES MASTER DE GATEWAY & SPLIT CIELO */}
          {/* ========================================================================= */}
          <TabsContent value="payments" className="space-y-6">
            <AdminPaymentGatewayAndSplitManager />
          </TabsContent>
          <TabsContent value="pix" className="space-y-6">
            <AdminPaymentGatewayAndSplitManager />
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB: PEDIDOS DA PLATAFORMA */}
          {/* ========================================================================= */}
          <TabsContent value="orders" className="space-y-6">
            <AdminOrdersManager />
          </TabsContent>

          {/* ========================================================================= */}
          {/* TAB: RELATÓRIOS FINANCEIROS */}
          {/* ========================================================================= */}
          <TabsContent value="finance" className="space-y-8">
            <AdminFinancialDashboard />
          </TabsContent>
        </Tabs>
      </div>

      {/* DIÁLOGO: SUBIR ESTAMPAS EM LOTE */}
      <Dialog open={isBatchUploadOpen} onOpenChange={setIsBatchUploadOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-slate-900">
              Upload de Estampas em Lote
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Suba múltiplos arquivos PNG com fundo transparente para adicionar estampas diretamente ao catálogo.
            </DialogDescription>
          </DialogHeader>
          <BatchUploadTab
            user={user || { id: 'admin-master-ceu', full_name: 'Administrador Master', artist_name: 'Céu Criativa' }}
            onComplete={() => {
              setIsBatchUploadOpen(false);
              loadDesigns();
              setFeedbackMessage({
                type: 'success',
                text: '✓ Estampas enviadas com sucesso! Elas já constam no catálogo para aprovação.'
              });
              setTimeout(() => setFeedbackMessage(null), 4000);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* DIÁLOGOS DE AÇÕES EM LOTE E INDIVIDUAL */}
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
