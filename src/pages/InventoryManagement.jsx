import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import inventoryRepository from '@/services/products/inventoryRepository';
import {
  Boxes,
  Search,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Layers,
  X,
  CheckSquare,
  Square,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InventoryProductCard from '@/components/inventory/InventoryProductCard';

export default function InventoryManagement() {
  const queryClient = useQueryClient();

  // Permissão de administrador
  const { data: user, isLoading: loadingUser } = useQuery({
    queryKey: ['inventory-page-user'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch {
        return null;
      }
    },
  });

  // Carrega visão geral completa do estoque (produtos e todas as variações físicas)
  const {
    data: overviewData,
    isLoading: loadingOverview,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['inventory-overview'],
    queryFn: () => inventoryRepository.getOverview(),
    enabled: user?.role === 'admin',
  });

  // Estados de Filtros e Busca
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductFilter, setSelectedProductFilter] = useState('ALL');
  const [selectedSizeFilter, setSelectedSizeFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL'); // ALL, ZERO, LOW, IN_STOCK, PAUSED
  const [viewTab, setViewTab] = useState('table'); // 'table' ou 'cards'

  // Seleção Múltipla para Edição em Massa
  const [selectedVariantIds, setSelectedVariantIds] = useState([]);
  const [bulkQtyInput, setBulkQtyInput] = useState('');
  const [bulkActionType, setBulkActionType] = useState('set'); // 'set', 'add', 'subtract', 'zero'
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);
  const [bulkFeedback, setBulkFeedback] = useState('');

  // Gerador de grade completa de um produto
  const [generatingProductId, setGeneratingProductId] = useState(null);
  const [gridDefaultStock, setGridDefaultStock] = useState('20');
  const [gridFeedback, setGridFeedback] = useState('');

  const products = overviewData?.products || [];
  const variants = overviewData?.variants || [];
  const metrics = overviewData?.metrics || {
    total_products: 0,
    total_variants: 0,
    total_units: 0,
    zero_stock_variants: 0,
  };

  // Mapeia produto por ID para busca rápida
  const productMap = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.id, p));
    return map;
  }, [products]);

  // Variações enriquecidas com dados do produto pai
  const enrichedVariants = useMemo(() => {
    return variants.map((v) => {
      const prod = productMap.get(v.base_product_id) || {};
      return {
        ...v,
        product_name: prod.name || 'Produto Não Identificado',
        product_type: prod.type || '',
        product_photo: prod.front_model_url || '',
        product_fit: prod.fit || '',
      };
    });
  }, [variants, productMap]);

  // Lista de todos os tamanhos únicos existentes
  const allAvailableSizes = useMemo(() => {
    const sizes = new Set();
    enrichedVariants.forEach((v) => {
      if (v.size) sizes.add(v.size);
    });
    return Array.from(sizes).sort();
  }, [enrichedVariants]);

  // Variações filtradas
  const filteredVariants = useMemo(() => {
    return enrichedVariants.filter((v) => {
      // Busca por texto
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = (v.product_name || '').toLowerCase().includes(query);
        const matchesColor = (v.color || '').toLowerCase().includes(query);
        const matchesSize = (v.size || '').toLowerCase().includes(query);
        const matchesFit = (v.product_fit || '').toLowerCase().includes(query);
        if (!matchesName && !matchesColor && !matchesSize && !matchesFit) return false;
      }

      // Filtro por produto
      if (selectedProductFilter !== 'ALL' && v.base_product_id !== selectedProductFilter) {
        return false;
      }

      // Filtro por tamanho
      if (selectedSizeFilter !== 'ALL' && v.size !== selectedSizeFilter) {
        return false;
      }

      // Filtro por status do estoque
      const qty = Number(v.stock_quantity) || 0;
      if (stockStatusFilter === 'ZERO' && qty > 0) return false;
      if (stockStatusFilter === 'LOW' && (qty <= 0 || qty > 10)) return false;
      if (stockStatusFilter === 'IN_STOCK' && qty <= 0) return false;
      if (stockStatusFilter === 'PAUSED' && v.is_active) return false;

      return true;
    });
  }, [enrichedVariants, searchTerm, selectedProductFilter, selectedSizeFilter, stockStatusFilter]);

  // Manipulação de seleção múltipla
  const isAllSelected =
    filteredVariants.length > 0 &&
    filteredVariants.every((v) => selectedVariantIds.includes(v.id));

  const isSomeSelected =
    filteredVariants.some((v) => selectedVariantIds.includes(v.id)) && !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      // Remove todas as filtradas da seleção
      const filteredIds = new Set(filteredVariants.map((v) => v.id));
      setSelectedVariantIds((prev) => prev.filter((id) => !filteredIds.has(id)));
    } else {
      // Adiciona todas as filtradas
      const newIds = new Set([...selectedVariantIds, ...filteredVariants.map((v) => v.id)]);
      setSelectedVariantIds(Array.from(newIds));
    }
  };

  const toggleSelectVariant = (id) => {
    setSelectedVariantIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const clearSelection = () => setSelectedVariantIds([]);

  // Aplicação da ação em massa
  const handleApplyBulk = async () => {
    if (selectedVariantIds.length === 0) return;
    setIsApplyingBulk(true);
    setBulkFeedback('');

    try {
      let qty = Number(bulkQtyInput) || 0;
      let action = bulkActionType;

      if (action === 'zero') {
        qty = 0;
        action = 'set';
      }

      const res = await inventoryRepository.bulkUpdate({
        variantIds: selectedVariantIds,
        action,
        quantity: qty,
      });

      setBulkFeedback(
        `✓ Estoque de ${res.count} variações atualizado com sucesso!`
      );
      setTimeout(() => setBulkFeedback(''), 4000);
      setBulkQtyInput('');
      clearSelection();
      await refetch();
    } catch (err) {
      setBulkFeedback(`Erro: ${err.message || 'Falha ao atualizar em massa'}`);
    } finally {
      setIsApplyingBulk(false);
    }
  };

  // Ativar ou pausar selecionados em massa
  const handleBulkToggleActive = async (activate) => {
    if (selectedVariantIds.length === 0) return;
    setIsApplyingBulk(true);
    setBulkFeedback('');

    try {
      const res = await inventoryRepository.bulkUpdate({
        variantIds: selectedVariantIds,
        isActive: activate,
      });

      setBulkFeedback(
        `✓ ${res.count} variações ${activate ? 'ativadas' : 'pausadas'} com sucesso!`
      );
      setTimeout(() => setBulkFeedback(''), 4000);
      clearSelection();
      await refetch();
    } catch (err) {
      setBulkFeedback(`Erro: ${err.message || 'Falha ao alterar status'}`);
    } finally {
      setIsApplyingBulk(false);
    }
  };

  // Edição rápida de estoque individual na tabela
  const handleQuickInlineUpdate = async (variant, newQty) => {
    const qty = Math.max(0, parseInt(newQty, 10) || 0);
    try {
      await inventoryRepository.bulkUpdate({
        variantIds: [variant.id],
        action: 'set',
        quantity: qty,
      });
      refetch();
    } catch (err) {
      console.error('Erro na edição rápida:', err);
    }
  };

  // Gerar grade completa para um produto base
  const handleGenerateGrid = async (productId) => {
    setGeneratingProductId(productId);
    setGridFeedback('');

    try {
      const stock = Math.max(0, parseInt(gridDefaultStock, 10) || 0);
      const res = await inventoryRepository.generateGrid({
        productId,
        defaultStock: stock,
      });

      setGridFeedback(
        `✓ Grade gerada com sucesso! ${res.count} novas variações foram criadas com ${stock} unidades cada.`
      );
      setTimeout(() => setGridFeedback(''), 5000);
      await refetch();
    } catch (err) {
      setGridFeedback(`Erro: ${err.message || 'Falha ao gerar grade'}`);
    } finally {
      setGeneratingProductId(null);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-ceu-cloud p-12">
        <div className="mx-auto h-32 max-w-6xl animate-pulse rounded-3xl bg-white shadow-sm" />
      </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-ceu-cloud px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-ceu-navy">Acesso restrito</h1>
        <p className="mt-3 text-muted-foreground">
          A gestão de estoque está disponível somente para administradores.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ceu-cloud px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Cabeçalho */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-purple-600">
              <Boxes className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Painel do Estoque Geral POD
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Gestão Geral de Estoque
            </h1>
            <p className="mt-1.5 text-sm text-slate-600 max-w-2xl">
              Selecione várias variações para atualizar o estoque de uma vez só, gere a grade completa
              de produtos e acompanhe a disponibilidade física em tempo real.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => refetch()}
              disabled={isFetching}
              className="rounded-xl border-slate-300 bg-white hover:bg-slate-50 text-slate-700 h-10 font-semibold text-xs shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? 'animate-spin text-purple-600' : ''}`} />
              Atualizar Dados
            </Button>
          </div>
        </header>

        {/* Notificações do Gerador de Grade */}
        {gridFeedback && (
          <div className="mb-6 rounded-2xl bg-purple-50 border border-purple-200 p-4 text-xs font-bold text-purple-900 flex items-center justify-between shadow-sm animate-fade-in">
            <span>{gridFeedback}</span>
            <button type="button" onClick={() => setGridFeedback('')} className="p-1">
              <X className="w-4 h-4 text-purple-500" />
            </button>
          </div>
        )}

        {/* Cards de Métricas / KPIs */}
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total de Peças Físicas
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {metrics.total_units?.toLocaleString('pt-BR')}
            </p>
            <span className="text-[11px] font-medium text-slate-500">Unidades em armazém</span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Variações Cadastradas
            </p>
            <p className="mt-1 text-2xl font-black text-purple-700">
              {metrics.total_variants}
            </p>
            <span className="text-[11px] font-medium text-slate-500">Cores x Tamanhos ativos</span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Produtos Base
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {metrics.total_products}
            </p>
            <span className="text-[11px] font-medium text-slate-500">Modelos no catálogo</span>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
            <p className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
              Variações Sem Estoque
            </p>
            <p className="mt-1 text-2xl font-black text-rose-600">
              {metrics.zero_stock_variants}
            </p>
            <span className="text-[11px] font-medium text-rose-500">Necessitam reposição</span>
          </div>
        </div>

        {/* BARRA FIXA DE AÇÕES EM MASSA (Aparece quando 1 ou mais variações são selecionadas) */}
        {selectedVariantIds.length > 0 && (
          <div className="sticky top-4 z-40 mb-6 rounded-2xl border-2 border-purple-500 bg-slate-950 p-4 text-white shadow-2xl animate-fade-in">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Contador de selecionados */}
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-600 font-extrabold text-xs">
                  {selectedVariantIds.length}
                </span>
                <div>
                  <p className="text-sm font-bold">
                    {selectedVariantIds.length === 1
                      ? '1 variação selecionada'
                      : `${selectedVariantIds.length} variações selecionadas`}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Defina o novo estoque para todas de uma só vez
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="text-xs text-slate-400 hover:text-white h-7 px-2"
                >
                  Desmarcar
                </Button>
              </div>

              {/* Controles de Atualização em Massa */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Tipo de Operação */}
                <select
                  value={bulkActionType}
                  onChange={(e) => setBulkActionType(e.target.value)}
                  className="h-9 rounded-xl border border-slate-700 bg-slate-900 px-3 text-xs font-semibold text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="set">Definir quantidade exata para:</option>
                  <option value="add">Adicionar (+) unidades:</option>
                  <option value="subtract">Subtrair (-) unidades:</option>
                  <option value="zero">Zerar estoque de todos (0 un)</option>
                </select>

                {/* Input de quantidade (se não for ação de zerar) */}
                {bulkActionType !== 'zero' && (
                  <Input
                    type="number"
                    min="0"
                    placeholder="Ex: 50"
                    value={bulkQtyInput}
                    onChange={(e) => setBulkQtyInput(e.target.value)}
                    className="h-9 w-24 rounded-xl border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 text-xs font-bold"
                  />
                )}

                {/* Botão Aplicar */}
                <Button
                  type="button"
                  onClick={handleApplyBulk}
                  disabled={
                    isApplyingBulk ||
                    (bulkActionType !== 'zero' && bulkQtyInput === '')
                  }
                  className="h-9 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 shadow-md shadow-purple-600/30"
                >
                  {isApplyingBulk ? 'Aplicando...' : 'Aplicar a Todos'}
                </Button>

                <div className="h-5 w-px bg-slate-800 mx-1 hidden sm:block" />

                {/* Botões Rápidos */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkToggleActive(true)}
                  disabled={isApplyingBulk}
                  className="h-9 rounded-xl border-slate-800 bg-slate-900 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 text-xs"
                >
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Ativar
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkToggleActive(false)}
                  disabled={isApplyingBulk}
                  className="h-9 rounded-xl border-slate-800 bg-slate-900 hover:bg-slate-800 text-rose-400 hover:text-rose-300 text-xs"
                >
                  <EyeOff className="w-3.5 h-3.5 mr-1" />
                  Pausar
                </Button>
              </div>
            </div>

            {bulkFeedback && (
              <p className="mt-2 text-xs font-bold text-emerald-400 animate-fade-in">
                {bulkFeedback}
              </p>
            )}
          </div>
        )}

        {/* Abas: Tabela Geral em Massa vs Agrupado por Modelo */}
        <Tabs defaultValue="table" value={viewTab} onValueChange={setViewTab}>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <TabsList className="rounded-2xl bg-white p-1 border border-slate-200/80 shadow-sm h-11">
              <TabsTrigger
                value="table"
                className="rounded-xl px-4 py-2 font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all"
              >
                <Layers className="w-4 h-4 mr-1.5" />
                Grade Geral de Variações ({filteredVariants.length})
              </TabsTrigger>
              <TabsTrigger
                value="cards"
                className="rounded-xl px-4 py-2 font-bold text-xs data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all"
              >
                <Boxes className="w-4 h-4 mr-1.5" />
                Agrupado por Produto ({products.length})
              </TabsTrigger>
            </TabsList>

            {/* Contador de itens visíveis */}
            <span className="text-xs font-semibold text-slate-500">
              Exibindo {filteredVariants.length} de {variants.length} variações cadastradas
            </span>
          </div>

          {/* TAB 1: TABELA GERAL COM SELEÇÃO MÚLTIPLA E EDIÇÃO EM MASSA */}
          <TabsContent value="table" className="space-y-4">
            {/* Barra de Filtros e Busca */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* Campo de Busca */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por produto, cor ou tamanho..."
                    className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs font-medium placeholder:text-slate-400"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtro por Produto */}
                <div>
                  <select
                    value={selectedProductFilter}
                    onChange={(e) => setSelectedProductFilter(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ALL">Todos os Produtos ({products.length})</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.variants?.length || 0} variações)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Tamanho */}
                <div>
                  <select
                    value={selectedSizeFilter}
                    onChange={(e) => setSelectedSizeFilter(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ALL">Todos os Tamanhos</option>
                    {allAvailableSizes.map((size) => (
                      <option key={size} value={size}>
                        Tamanho: {size}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro por Situação do Estoque */}
                <div>
                  <select
                    value={stockStatusFilter}
                    onChange={(e) => setStockStatusFilter(e.target.value)}
                    className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="ALL">Todos os Status</option>
                    <option value="ZERO">Sem Estoque (0 un)</option>
                    <option value="LOW">Estoque Baixo (1 a 10 un)</option>
                    <option value="IN_STOCK">Em Estoque (&gt; 0 un)</option>
                    <option value="PAUSED">Variações Pausadas</option>
                  </select>
                </div>
              </div>
            </div>

            {/* TABELA DE ESTOQUE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              {loadingOverview ? (
                <div className="p-12 text-center text-slate-500">
                  <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-purple-600" />
                  <p className="font-semibold text-sm">Carregando estoque de todas as variações...</p>
                </div>
              ) : isError ? (
                <div className="p-12 text-center text-destructive">
                  <AlertCircle className="w-8 h-8 mx-auto mb-3 text-rose-500" />
                  <p className="font-semibold text-sm">Não foi possível carregar o estoque geral.</p>
                </div>
              ) : filteredVariants.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <Boxes className="w-8 h-8 mx-auto mb-3 text-slate-400" />
                  <p className="font-semibold text-sm">Nenhuma variação encontrada para os filtros aplicados.</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Gere a grade de um produto na aba "Agrupado por Produto" ou altere os filtros acima.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                      <tr>
                        {/* Checkbox Master Selecionar Todos */}
                        <th className="py-3.5 pl-4 pr-2 w-10">
                          <button
                            type="button"
                            onClick={toggleSelectAll}
                            title={isAllSelected ? 'Desmarcar todos' : 'Selecionar todos os visíveis'}
                            className="flex items-center justify-center p-1 rounded-md text-purple-700 hover:bg-purple-100 transition-colors"
                          >
                            {isAllSelected ? (
                              <CheckSquare className="w-4 h-4 text-purple-600" />
                            ) : isSomeSelected ? (
                              <Minus className="w-4 h-4 text-purple-600" />
                            ) : (
                              <Square className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        </th>
                        <th className="py-3.5 px-3">Produto Base</th>
                        <th className="py-3.5 px-3">Cor</th>
                        <th className="py-3.5 px-3">Tamanho</th>
                        <th className="py-3.5 px-3">Modelagem / Fit</th>
                        <th className="py-3.5 px-3 text-center">Quantidade Atual</th>
                        <th className="py-3.5 px-3 text-center">Status</th>
                        <th className="py-3.5 pr-4 pl-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {filteredVariants.map((variant) => {
                        const isSelected = selectedVariantIds.includes(variant.id);
                        const qty = Number(variant.stock_quantity) || 0;
                        const isZero = qty === 0;
                        const isLow = qty > 0 && qty <= 10;

                        return (
                          <tr
                            key={variant.id}
                            className={`transition-colors hover:bg-slate-50/70 ${
                              isSelected ? 'bg-purple-50/50' : ''
                            }`}
                          >
                            {/* Checkbox Individual */}
                            <td className="py-3 pl-4 pr-2">
                              <button
                                type="button"
                                onClick={() => toggleSelectVariant(variant.id)}
                                className="flex items-center justify-center p-1 rounded-md text-purple-700 hover:bg-purple-100"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-purple-600" />
                                ) : (
                                  <Square className="w-4 h-4 text-slate-300" />
                                )}
                              </button>
                            </td>

                            {/* Foto e Nome do Produto */}
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="h-9 w-9 shrink-0 overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                                  {variant.product_photo ? (
                                    <img
                                      src={variant.product_photo}
                                      alt={variant.product_name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center text-[10px] text-slate-400">
                                      Foto
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 block truncate max-w-[200px]">
                                    {variant.product_name}
                                  </span>
                                  <span className="text-[10px] text-slate-500 capitalize">
                                    {variant.product_type?.replace('_', ' ')}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* Cor */}
                            <td className="py-3 px-3">
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 font-bold text-[11px]">
                                <span className="w-2.5 h-2.5 rounded-full border border-black/20" />
                                {variant.color}
                              </div>
                            </td>

                            {/* Tamanho */}
                            <td className="py-3 px-3">
                              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-900 text-white font-extrabold text-xs shadow-sm">
                                {variant.size}
                              </span>
                            </td>

                            {/* Modelagem */}
                            <td className="py-3 px-3 text-slate-600">
                              {variant.product_fit ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                                  {variant.product_fit}
                                </span>
                              ) : (
                                <span className="text-slate-400 text-xs">—</span>
                              )}
                            </td>

                            {/* Quantidade com Edição Rápida Direta */}
                            <td className="py-3 px-3 text-center">
                              <div className="inline-flex items-center gap-2">
                                <input
                                  type="number"
                                  min="0"
                                  defaultValue={qty}
                                  onBlur={(e) => {
                                    if (e.target.value !== String(qty)) {
                                      handleQuickInlineUpdate(variant, e.target.value);
                                    }
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.target.blur();
                                    }
                                  }}
                                  title="Clique para alterar e tecle Enter"
                                  className={`h-8 w-18 rounded-lg text-center font-black text-xs border transition-colors ${
                                    isZero
                                      ? 'border-rose-300 bg-rose-50 text-rose-700'
                                      : isLow
                                      ? 'border-amber-300 bg-amber-50 text-amber-800'
                                      : 'border-slate-300 bg-white text-slate-900 focus:border-purple-600'
                                  }`}
                                />
                                <span className="text-[10px] text-slate-400 font-medium">un</span>
                              </div>
                            </td>

                            {/* Badge de Status */}
                            <td className="py-3 px-3 text-center">
                              {isZero ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700">
                                  Esgotado
                                </span>
                              ) : isLow ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                                  Baixo Estoque
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                                  Disponível
                                </span>
                              )}
                            </td>

                            {/* Ações */}
                            <td className="py-3 pr-4 pl-3 text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  await inventoryRepository.pause(variant);
                                  refetch();
                                }}
                                title={variant.is_active ? 'Pausar variação' : 'Ativar variação'}
                                className="h-7 px-2 text-xs text-slate-500 hover:text-slate-900"
                              >
                                {variant.is_active ? (
                                  <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* TAB 2: AGRUPADO POR PRODUTO COM GERADOR DE GRADE AUTOMÁTICA */}
          <TabsContent value="cards" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {products.map((product) => {
                const totalStock = product.total_stock || 0;
                const variantsCount = product.variants?.length || 0;
                const missingCount = product.missing_count || 0;
                const isGenerating = generatingProductId === product.id;

                return (
                  <div
                    key={product.id}
                    className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm space-y-4"
                  >
                    {/* Header do Card */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-slate-200">
                          {product.front_model_url ? (
                            <img
                              src={product.front_model_url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs text-slate-400">
                              Sem foto
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-500 capitalize">
                              {product.type?.replace('_', ' ')}
                            </span>
                            {product.fit && (
                              <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100">
                                {product.fit}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-semibold text-slate-500 block">Total em Estoque</span>
                        <span className="text-xl font-black text-slate-900">{totalStock} un</span>
                      </div>
                    </div>

                    {/* Resumo de Cores e Tamanhos do Produto */}
                    <div className="rounded-2xl bg-slate-50 p-3 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-semibold">Cores configuradas:</span>
                        <span className="font-bold text-slate-800">
                          {(product.colors_available || []).join(', ') || 'Nenhuma'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500 font-semibold">Tamanhos configurados:</span>
                        <span className="font-bold text-slate-800">
                          {(product.sizes_available || []).join(', ') || 'Nenhum'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 font-semibold">Variações criadas:</span>
                        <span className="font-extrabold text-purple-700">
                          {variantsCount} criadas {missingCount > 0 && `(${missingCount} faltando na grade)`}
                        </span>
                      </div>
                    </div>

                    {/* BOTÃO GERADOR DE GRADE AUTOMÁTICA */}
                    {missingCount > 0 && (
                      <div className="rounded-2xl border border-purple-200 bg-purple-50/70 p-3.5 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                            Grade incompleta ({missingCount} combinações pendentes)
                          </p>
                        </div>
                        <p className="text-[11px] text-purple-700">
                          Gere de uma só vez todas as combinações de cor e tamanho para não ter que cadastrar uma por uma!
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-xs font-medium text-slate-700">Estoque inicial:</span>
                          <Input
                            type="number"
                            min="0"
                            value={gridDefaultStock}
                            onChange={(e) => setGridDefaultStock(e.target.value)}
                            className="h-8 w-20 rounded-lg bg-white border-purple-300 text-xs font-bold text-center"
                          />
                          <Button
                            type="button"
                            onClick={() => handleGenerateGrid(product.id)}
                            disabled={isGenerating}
                            className="h-8 flex-1 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm"
                          >
                            {isGenerating ? 'Gerando Grade...' : `Gerar ${missingCount} Variações Agora`}
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Detalhes do Estoque Físico Individual */}
                    <InventoryProductCard product={product} />
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
