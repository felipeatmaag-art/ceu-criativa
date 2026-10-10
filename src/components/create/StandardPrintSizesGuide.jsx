import React, { useState } from 'react';
import {
  Ruler,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const PRODUCT_SIZE_TABLES = {
  camiseta: [
    {
      id: 'peito',
      location: 'Logotipo / Canto do Peito',
      size: '8x8 cm a 10x10 cm',
      reference: '—',
      purpose: 'Uniformes corporativos, marcas minimalistas ou nuca.',
      accentColor: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-400',
      visualPosition: { top: '30%', left: '60%', width: '14%', height: '14%' }
    },
    {
      id: 'frente_media',
      location: 'Frente Centralizada (Média)',
      size: '20x30 cm',
      reference: 'A4 (21 x 29,7 cm)',
      purpose: 'Estampa visível sem ocupar a peça inteira. Bom custo-benefício.',
      accentColor: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-400',
      visualPosition: { top: '26%', left: '33%', width: '34%', height: '46%' }
    },
    {
      id: 'frente_total',
      location: 'Frente Total / Costas Grandes',
      size: '30x42 cm ou 28x45 cm',
      reference: 'A3 (29,7 x 42 cm)',
      purpose: 'Artes detalhadas, fotos, ilustrações ou marcas de streetwear.',
      accentColor: 'from-amber-500 to-orange-500',
      borderColor: 'border-amber-400',
      visualPosition: { top: '22%', left: '26%', width: '48%', height: '62%' }
    },
    {
      id: 'longa_vertical',
      location: 'Estampas Longas / Verticais',
      size: '30x50 cm',
      reference: '—',
      purpose: 'Composições com textos longos ou artes bem compridas.',
      accentColor: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-400',
      visualPosition: { top: '20%', left: '36%', width: '28%', height: '70%' }
    },
    {
      id: 'manga_interna',
      location: 'Etiqueta de Manga / Interna',
      size: '2,5 cm (largura) / 8 cm (interna)',
      reference: '—',
      purpose: 'Identificação discreta da marca de roupas.',
      accentColor: 'from-slate-500 to-slate-700',
      borderColor: 'border-slate-400',
      visualPosition: { top: '34%', left: '12%', width: '12%', height: '8%' }
    }
  ],
  quadro: [
    {
      id: 'quadro_a4',
      location: 'Quadro Formato A4',
      size: '21 × 29,7 cm',
      reference: 'Padrão A4',
      purpose: 'Quadro compacto ideal para mesas de trabalho, prateleiras ou galerias de quadros múltiplos.',
      accentColor: 'from-blue-500 to-indigo-500',
      borderColor: 'border-blue-400'
    },
    {
      id: 'quadro_a3',
      location: 'Quadro Formato A3',
      size: '29,7 × 42 cm',
      reference: 'Padrão A3',
      purpose: 'O tamanho mais vendido para quartos, salas e escritórios. Excelente presença visual.',
      accentColor: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-400'
    },
    {
      id: 'quadro_a2',
      location: 'Quadro Formato A2',
      size: '42 × 59,4 cm',
      reference: 'Padrão A2',
      purpose: 'Quadro de grande destaque para paredes principais e salas de estar.',
      accentColor: 'from-amber-500 to-orange-500',
      borderColor: 'border-amber-400'
    },
    {
      id: 'quadro_a1',
      location: 'Quadro Formato A1',
      size: '59,4 × 84,1 cm',
      reference: 'Padrão A1',
      purpose: 'Painel maxi panorâmico de alto impacto visual para projetos de interiores e galerias.',
      accentColor: 'from-rose-500 to-pink-500',
      borderColor: 'border-rose-400'
    }
  ],
  caneca: [
    {
      id: 'caneca_sublimacao',
      location: 'Gabarito Oficial Sublimação',
      size: '23,2 × 17,9 cm',
      reference: 'Caneca Sublimada',
      purpose: 'Área padrão de sublimação (ou DTF UV) em 300 DPI. Estampa 100% inclusa no produto — sem cobrança por área de DTF.',
      accentColor: 'from-amber-500 to-orange-500',
      borderColor: 'border-amber-400'
    },
    {
      id: 'caneca_frente',
      location: 'Estampa Centralizada (Frente)',
      size: '8 × 8 cm',
      reference: 'Logo Único',
      purpose: 'Destaque central voltado para o usuário ao segurar pela alça.',
      accentColor: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-400'
    },
    {
      id: 'caneca_dupla',
      location: 'Frente e Verso (Dois Lados)',
      size: '8 × 8 cm cada lado',
      reference: 'Dupla Face',
      purpose: 'Arte visível para destros e canhotos ao mesmo tempo.',
      accentColor: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-400'
    }
  ],
  ecobag: [
    {
      id: 'ecobag_a4',
      location: 'Frente Central (A4)',
      size: '20 × 28 cm',
      reference: 'Padrão A4',
      purpose: 'Tamanho clássico centralizado na bolsa ecológica.',
      accentColor: 'from-emerald-500 to-teal-500',
      borderColor: 'border-emerald-400'
    },
    {
      id: 'ecobag_maxi',
      location: 'Maxi Print Estendida',
      size: '28 × 32 cm',
      reference: 'Grande Formato',
      purpose: 'Ocupa a extensão quase total da frente da ecobag para arte de grande impacto.',
      accentColor: 'from-amber-500 to-orange-500',
      borderColor: 'border-amber-400'
    }
  ]
};

export default function StandardPrintSizesGuide({
  defaultExpanded = false,
  showVisualShirt = true,
  activeProductType = 'camiseta',
  variant = 'card' // 'card' | 'modal-button'
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    if (activeProductType === 'quadro') return 'quadro';
    if (activeProductType === 'caneca') return 'caneca';
    if (activeProductType === 'ecobag') return 'ecobag';
    return 'camiseta';
  });

  const currentList = PRODUCT_SIZE_TABLES[activeTab] || PRODUCT_SIZE_TABLES.camiseta;
  const [highlightedId, setHighlightedId] = useState(currentList[0]?.id);

  const selectedItem = currentList.find((s) => s.id === highlightedId) || currentList[0];

  const renderTableContent = () => (
    <div className="space-y-4">
      {/* Abas por Categoria de Produto */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl">
        <button
          type="button"
          onClick={() => { setActiveTab('camiseta'); setHighlightedId(PRODUCT_SIZE_TABLES.camiseta[1].id); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'camiseta' ? 'bg-white text-ceu-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          👕 Camisetas & Vestuário
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('quadro'); setHighlightedId(PRODUCT_SIZE_TABLES.quadro[0].id); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'quadro' ? 'bg-white text-ceu-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          🖼️ Quadros (A4, A3, A1)
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('caneca'); setHighlightedId(PRODUCT_SIZE_TABLES.caneca[0].id); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'caneca' ? 'bg-white text-ceu-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          ☕ Canecas
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('ecobag'); setHighlightedId(PRODUCT_SIZE_TABLES.ecobag[0].id); }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'ecobag' ? 'bg-white text-ceu-navy shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          👜 Ecobags
        </button>
      </div>

      {/* Tabela de Medidas do Produto Escolhido */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <th className="py-3 px-3.5 sm:px-4">Aplicação / Posição</th>
              <th className="py-3 px-3.5 sm:px-4">Dimensão Recomendada</th>
              <th className="py-3 px-3.5 sm:px-4 hidden sm:table-cell">Referência</th>
              <th className="py-3 px-3.5 sm:px-4">Objetivo Principal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-800">
            {currentList.map((item) => {
              const isSelected = highlightedId === item.id;
              return (
                <tr
                  key={item.id}
                  onClick={() => setHighlightedId(item.id)}
                  className={`transition-colors cursor-pointer ${
                    isSelected ? 'bg-ceu-aqua/10 font-semibold' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="py-3.5 px-3.5 sm:px-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${item.accentColor} shrink-0`} />
                      <span className="font-bold text-slate-900">{item.location}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-3.5 sm:px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200 text-ceu-navy">
                      {item.size}
                    </span>
                  </td>
                  <td className="py-3.5 px-3.5 sm:px-4 font-medium text-slate-600 hidden sm:table-cell whitespace-nowrap">
                    {item.reference !== '—' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs">
                        {item.reference}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3.5 sm:px-4 text-xs text-slate-600 leading-snug">
                    {item.purpose}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Dicas Técnicas de Envio de Arquivo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 pt-1">
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block">Fundo Transparente</strong>
            Para camisetas, envie PNG sem fundo para estampar apenas o desenho.
          </div>
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block">Resolução de 300 DPI</strong>
            Garante traços nítidos e cores vivas sem serrilhado na malha ou papel.
          </div>
        </div>
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
          <Sparkles className="w-4 h-4 text-ceu-aqua shrink-0 mt-0.5" />
          <div>
            <strong className="text-slate-900 block">Ajuste Livre Liberado</strong>
            Você pode arrastar e redimensionar a arte livremente no mockup.
          </div>
        </div>
      </div>
    </div>
  );

  // Variação Botão Modal (usado dentro do editor interativo)
  if (variant === 'modal-button') {
    return (
      <>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-ceu-navy border border-slate-200 text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Ruler className="w-3.5 h-3.5 text-ceu-navy" />
          <span>Tabela de Medidas</span>
        </button>

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            <div
              className="fixed inset-0 bg-ceu-navy/80 backdrop-blur-sm transition-opacity"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-6 p-6 sm:p-8 space-y-5 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-ceu-navy text-ceu-aqua flex items-center justify-center">
                    <Ruler className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-ceu-navy">
                      Tamanhos Recomendados por Produto
                    </h3>
                    <p className="text-xs text-slate-500">
                      Consulte as dimensões oficiais para Camisetas, Quadros (A4, A3, A1), Canecas e Ecobags
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors"
                  aria-label="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {renderTableContent()}

              <div className="pt-2 text-right">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-6 bg-ceu-navy text-white font-bold text-xs"
                >
                  Voltar ao Editor
                </Button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm text-slate-900">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-ceu-navy text-ceu-aqua flex items-center justify-center shadow-xs shrink-0">
            <Ruler className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-ceu-navy">
              Guia de Medidas Recomendadas
            </h3>
            <p className="text-xs text-slate-500">
              Formatos oficiais por tipo de produto
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700"
        >
          {isExpanded ? 'Recolher' : 'Ver Detalhes'}
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && <div className="pt-4">{renderTableContent()}</div>}
    </div>
  );
}
