import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Save, 
  Boxes, 
  Sparkles, 
  Eye, 
  EyeOff,
  Shirt,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import inventoryRepository from '@/services/products/inventoryRepository';

export default function AdminInventoryManager() {
  const queryClient = useQueryClient();
  const [selectedProductFilter, setSelectedProductFilter] = useState('ALL');
  const [savingId, setSavingId] = useState(null);
  const [stockInputs, setStockInputs] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [batchStockQty, setBatchStockQty] = useState(25);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

  // Busca visão geral completa do estoque físico
  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['admin-inventory-overview'],
    queryFn: () => inventoryRepository.getOverview(),
  });

  const products = data?.products || [];
  const metrics = data?.metrics || {
    total_products: 0,
    total_variants: 0,
    total_units: 0,
    zero_stock_variants: 0
  };

  const handleInputChange = (variantId, value) => {
    setStockInputs(prev => ({
      ...prev,
      [variantId]: value
    }));
  };

  // Salvar quantidade de uma variação individual
  const handleSaveStock = async (product, variant) => {
    const newQty = parseInt(stockInputs[variant.id] ?? variant.stock_quantity, 10);
    if (isNaN(newQty) || newQty < 0) return;

    setSavingId(variant.id);
    setFeedback(null);
    try {
      await inventoryRepository.save(product, variant.color, variant.size, newQty, variant);
      await queryClient.invalidateQueries({ queryKey: ['admin-inventory-overview'] });
      setFeedback({
        type: 'success',
        text: `✓ Estoque de ${product.name} (${variant.color} - ${variant.size}) atualizado para ${newQty} un.`
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Erro ao salvar estoque.'
      });
    } finally {
      setSavingId(null);
    }
  };

  // Alternar ativação da variação (visível ou pausada)
  const handleToggleActive = async (variant) => {
    setSavingId(variant.id);
    try {
      await inventoryRepository.pause(variant);
      await queryClient.invalidateQueries({ queryKey: ['admin-inventory-overview'] });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingId(null);
    }
  };

  // Gerar grade completa de um produto com estoque padrão
  const handleGenerateProductGrid = async (productId, defaultStock = 20) => {
    setIsGeneratingBatch(true);
    setFeedback(null);
    try {
      await inventoryRepository.generateGrid({ productId, defaultStock });
      await queryClient.invalidateQueries({ queryKey: ['admin-inventory-overview'] });
      setFeedback({
        type: 'success',
        text: `✓ Grade completa gerada com ${defaultStock} peças em cada cor e tamanho!`
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Erro ao gerar grade do produto.'
      });
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  // Abastecer TODOS os produtos com 25 unidades de cada (Ação Rápida para Testes e Produção)
  const handlePopulateAllProducts = async () => {
    if (!products.length) return;
    setIsGeneratingBatch(true);
    setFeedback(null);
    try {
      let createdTotal = 0;
      for (const prod of products) {
        const res = await inventoryRepository.generateGrid({ 
          productId: prod.id, 
          defaultStock: batchStockQty 
        });
        createdTotal += (res?.count || 0);
      }
      await queryClient.invalidateQueries({ queryKey: ['admin-inventory-overview'] });
      setFeedback({
        type: 'success',
        text: `✓ Sucesso! Todas as peças foram abastecidas com ${batchStockQty} unidades em cada cor e tamanho no banco de dados.`
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err) {
      setFeedback({
        type: 'error',
        text: err.message || 'Erro ao abastecer estoque geral.'
      });
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  const filteredProducts = selectedProductFilter === 'ALL'
    ? products
    : products.filter(p => p.id === selectedProductFilter);

  return (
    <div className="space-y-6">
      
      {/* 1. CARDS DE MÉTRICAS GERAIS DO ESTOQUE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Total em Estoque</span>
            <Boxes className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              {metrics.total_units}
            </span>
            <span className="text-xs text-slate-500">peças físicas</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Prontas para aplicação DTF e envio
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Modelos de Roupas</span>
            <Shirt className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              {metrics.total_products}
            </span>
            <span className="text-xs text-slate-500">peças base</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Camisetas, polos, moletons e ecobags
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Variações (Cor × Tam)</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              {metrics.total_variants}
            </span>
            <span className="text-xs text-slate-500">grades ativas</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Combinações disponíveis na loja
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Estoque Zerado</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-3xl font-black tabular-nums ${metrics.zero_stock_variants > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {metrics.zero_stock_variants}
            </span>
            <span className="text-xs text-slate-500">grades sem estoque</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Impedem a compra até serem abastecidas
          </p>
        </div>

      </div>

      {/* 2. BARRA DE AÇÃO RÁPIDA: ABASTECER ESTOQUE GERAL COM 1 CLIQUE */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-400">
              Ação Rápida de Administrador
            </span>
          </div>
          <h4 className="text-base font-bold text-white">
            Abastecer Estoque de Todas as Roupas para Teste e Vendas
          </h4>
          <p className="text-xs text-slate-300 max-w-xl">
            Gera automaticamente as combinações de cores e tamanhos (P, M, G, GG) com a quantidade definida abaixo diretamente no banco de dados.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10">
            <span className="text-xs text-slate-300">Qtd por variação:</span>
            <input
              type="number"
              min="1"
              max="500"
              value={batchStockQty}
              onChange={(e) => setBatchStockQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-16 h-8 text-center bg-white/20 text-white font-bold rounded-lg text-xs"
            />
          </div>

          <Button
            type="button"
            disabled={isGeneratingBatch || isLoading}
            onClick={handlePopulateAllProducts}
            className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-1.5 shadow-md shadow-emerald-900/30 cursor-pointer"
          >
            {isGeneratingBatch ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Abastecendo...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Estoque Geral</span>
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="h-11 px-3 rounded-xl border-white/20 text-slate-200 hover:bg-white/10 hover:text-white"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border border-emerald-300 text-emerald-900' 
            : 'bg-red-50 border border-red-300 text-red-900'
        }`}>
          <span>{feedback.text}</span>
          <button 
            type="button" 
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. FILTRO POR PRODUTO BASE */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Filtrar Peça:
          </span>
          <select
            value={selectedProductFilter}
            onChange={(e) => setSelectedProductFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800"
          >
            <option value="ALL">Todos os Produtos ({products.length})</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Mostrando {filteredProducts.length} produto(s)
        </span>
      </div>

      {/* 4. LISTA DE PRODUTOS E SUAS GRADES DE ESTOQUE */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-slate-500" />
          Carregando estoque físico dos produtos...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-10 text-center bg-white rounded-3xl border border-slate-200">
          <p className="text-xs font-bold text-slate-700">Nenhum produto base encontrado.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredProducts.map((prod) => {
            const variants = prod.variants || [];
            const totalStock = prod.total_stock || 0;
            const colors = prod.colors_available || [];
            const sizes = prod.sizes_available || [];

            return (
              <div 
                key={prod.id} 
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
              >
                {/* Cabeçalho do Produto */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                      {prod.front_model_url ? (
                        <img 
                          src={prod.front_model_url} 
                          alt={prod.name} 
                          className="w-full h-full object-contain p-1" 
                        />
                      ) : (
                        <Shirt className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base text-slate-900">
                          {prod.name}
                        </h3>
                        <Badge className="bg-slate-100 text-slate-700 border-slate-300 text-[10px]">
                          R$ {Number(prod.base_price || 0).toFixed(2)}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Cores: <strong>{colors.join(', ') || 'Padrão'}</strong> · Tamanhos: <strong>{sizes.join(', ') || 'Padrão'}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900 tabular-nums">
                        {totalStock} <span className="text-xs font-normal text-slate-500">unidades</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        Estoque Físico Total
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isGeneratingBatch}
                      onClick={() => handleGenerateProductGrid(prod.id, 20)}
                      className="rounded-xl text-xs font-bold h-9 border-slate-300 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 gap-1"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      Preencher Grade (20 un)
                    </Button>
                  </div>
                </div>

                {/* Tabela de Variações de Cor e Tamanho */}
                {variants.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 text-slate-400 uppercase text-[10px] font-extrabold tracking-wider">
                          <th className="py-2.5 px-3">Cor</th>
                          <th className="py-2.5 px-3">Tamanho</th>
                          <th className="py-2.5 px-3">Qtd em Estoque Físico</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                        {variants.map((v) => {
                          const inputValue = stockInputs[v.id] ?? v.stock_quantity;
                          const hasChanged = parseInt(inputValue, 10) !== v.stock_quantity;
                          const isZero = (Number(v.stock_quantity) || 0) <= 0;

                          return (
                            <tr key={v.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="py-3 px-3 font-bold text-slate-900">
                                {v.color}
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-slate-700">
                                {v.size}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={inputValue}
                                    onChange={(e) => handleInputChange(v.id, e.target.value)}
                                    className={`w-20 h-8 px-2 text-center rounded-lg border font-bold text-xs ${
                                      isZero 
                                        ? 'bg-amber-50 border-amber-300 text-amber-900' 
                                        : 'bg-white border-slate-300 text-slate-900'
                                    }`}
                                  />
                                  <span className="text-[11px] text-slate-400">peças</span>
                                </div>
                              </td>
                              <td className="py-3 px-3">
                                {v.is_active ? (
                                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px]">
                                    Ativo na Loja
                                  </Badge>
                                ) : (
                                  <Badge className="bg-slate-100 text-slate-600 border-slate-300 text-[10px]">
                                    Pausado
                                  </Badge>
                                )}
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    type="button"
                                    size="sm"
                                    disabled={savingId === v.id || !hasChanged}
                                    onClick={() => handleSaveStock(prod, v)}
                                    className={`h-8 px-3 rounded-lg text-xs font-bold transition-all ${
                                      hasChanged 
                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs' 
                                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                                    }`}
                                  >
                                    {savingId === v.id ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    ) : (
                                      <>
                                        <Save className="w-3.5 h-3.5 mr-1" />
                                        Salvar
                                      </>
                                    )}
                                  </Button>

                                  <button
                                    type="button"
                                    onClick={() => handleToggleActive(v)}
                                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                    title={v.is_active ? 'Pausar variação' : 'Ativar variação'}
                                  >
                                    {v.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4 text-amber-600" />}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="py-6 px-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold">Nenhuma grade física cadastrada para esta peça ainda!</p>
                      <p className="text-[11px] text-amber-900 mt-0.5">
                        Clientes não conseguem comprar tamanhos que não tenham estoque cadastrado.
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleGenerateProductGrid(prod.id, 20)}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs shrink-0"
                    >
                      Gerar Grade Automática com 20 un
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
