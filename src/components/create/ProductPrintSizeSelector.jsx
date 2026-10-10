import React, { useState } from 'react';
import {
  Ruler,
  Move,
  Check
} from 'lucide-react';

export const PRODUCT_PRINT_PRESETS = {
  camiseta: [
    {
      id: 'peito',
      label: 'Canto do Peito',
      dimension: '9 × 9 cm',
      ref: 'Bolso / Logo',
      desc: 'Uniforme & minimalista',
      transform: { x: -65, y: -60, scale: 0.45, rotation: 0 }
    },
    {
      id: 'frente_media_a4',
      label: 'Frente Média (A4)',
      dimension: '20 × 30 cm',
      ref: 'Padrão A4',
      desc: 'Visível e equilibrada',
      transform: { x: 0, y: 0, scale: 1.0, rotation: 0 }
    },
    {
      id: 'frente_total_a3',
      label: 'Frente Total / Costas (A3)',
      dimension: '30 × 42 cm',
      ref: 'Maxi A3',
      desc: 'Streetwear & ilustrações',
      transform: { x: 0, y: -15, scale: 1.45, rotation: 0 }
    },
    {
      id: 'longa_vertical',
      label: 'Longa Vertical',
      dimension: '30 × 50 cm',
      ref: 'Vertical',
      desc: 'Tipografia e artes longas',
      transform: { x: 0, y: -10, scale: 1.35, rotation: 0 }
    },
    {
      id: 'livre',
      label: 'Ajuste Livre',
      dimension: 'Personalizado',
      ref: 'Manual',
      desc: 'Arraste e redimensione livremente',
      isFree: true
    }
  ],
  baby_look: [
    {
      id: 'peito',
      label: 'Canto do Peito',
      dimension: '8 × 8 cm',
      ref: 'Logo Delicado',
      desc: 'Proporção delicada feminina',
      transform: { x: -55, y: -50, scale: 0.42, rotation: 0 }
    },
    {
      id: 'frente_media_a4',
      label: 'Frente Central (A4)',
      dimension: '18 × 26 cm',
      ref: 'Padrão A4',
      desc: 'Ajuste centralizado ideal',
      transform: { x: 0, y: 0, scale: 0.95, rotation: 0 }
    },
    {
      id: 'frente_total_a3',
      label: 'Frente Total (A3)',
      dimension: '26 × 36 cm',
      ref: 'Maxi Estampa',
      desc: 'Destaque visual completo',
      transform: { x: 0, y: -10, scale: 1.35, rotation: 0 }
    },
    {
      id: 'livre',
      label: 'Ajuste Livre',
      dimension: 'Personalizado',
      ref: 'Manual',
      desc: 'Arraste e redimensione livremente',
      isFree: true
    }
  ],
  quadro: [
    {
      id: 'quadro_a4',
      label: 'Quadro A4',
      dimension: '21 × 29,7 cm',
      ref: 'A4',
      desc: 'Quadro compacto (mesa ou parede)',
      sizeKey: 'A4 (21x30cm)',
      transform: { x: 0, y: 0, scale: 1.0, rotation: 0 }
    },
    {
      id: 'quadro_a3',
      label: 'Quadro A3',
      dimension: '29,7 × 42 cm',
      ref: 'A3',
      desc: 'Padrão decorativo (sala e quarto)',
      sizeKey: 'A3 (30x42cm)',
      transform: { x: 0, y: 0, scale: 1.15, rotation: 0 }
    },
    {
      id: 'quadro_a1',
      label: 'Quadro A1',
      dimension: '59,4 × 84,1 cm',
      ref: 'A1',
      desc: 'Painel maxi de destaque amplo',
      sizeKey: 'A1 (60x84cm)',
      transform: { x: 0, y: 0, scale: 1.3, rotation: 0 }
    },
    {
      id: 'livre',
      label: 'Ajuste Livre',
      dimension: 'Personalizado',
      ref: 'Manual',
      desc: 'Enquadramento e zoom personalizados',
      isFree: true
    }
  ],
  caneca: [
    {
      id: 'caneca_sublimacao',
      label: 'Gabarito Sublimação',
      dimension: '23,2 × 17,9 cm',
      ref: 'Padrão Oficial',
      desc: 'Área padrão de sublimação (Inclusa)',
      transform: { x: 0, y: 0, scale: 1.0, rotation: 0 }
    },
    {
      id: 'caneca_frente',
      label: 'Logo Central (Frente)',
      dimension: '8 × 8 cm',
      ref: 'Logo Único',
      desc: 'Destaque centralizado na frente',
      transform: { x: 0, y: 0, scale: 0.65, rotation: 0 }
    },
    {
      id: 'caneca_dupla',
      label: 'Frente & Verso',
      dimension: '8 × 8 cm (2 lados)',
      ref: 'Dois Lados',
      desc: 'Visível para destros e canhotos',
      transform: { x: 0, y: 0, scale: 0.75, rotation: 0 }
    },
    {
      id: 'livre',
      label: 'Ajuste Livre',
      dimension: 'Personalizado',
      ref: 'Manual',
      desc: 'Arraste e redimensione livremente',
      isFree: true
    }
  ],
  ecobag: [
    {
      id: 'ecobag_a4',
      label: 'Estampa Padrão (A4)',
      dimension: '20 × 28 cm',
      ref: 'Padrão A4',
      desc: 'Centralizada elegante',
      transform: { x: 0, y: 0, scale: 1.0, rotation: 0 }
    },
    {
      id: 'ecobag_maxi',
      label: 'Maxi Print',
      dimension: '28 × 32 cm',
      ref: 'Maxi',
      desc: 'Ocupa a extensão da ecobag',
      transform: { x: 0, y: -10, scale: 1.35, rotation: 0 }
    },
    {
      id: 'livre',
      label: 'Ajuste Livre',
      dimension: 'Personalizado',
      ref: 'Manual',
      desc: 'Arraste e redimensione livremente',
      isFree: true
    }
  ]
};

export default function ProductPrintSizeSelector({
  productType = 'camiseta',
  currentTransform,
  onTransformChange,
  onProductSizeChange,
  selectedProductSize,
  side = 'front'
}) {
  const normalizedType =
    productType === 'baby_look'
      ? 'baby_look'
      : productType === 'quadro'
      ? 'quadro'
      : productType === 'caneca'
      ? 'caneca'
      : productType === 'ecobag'
      ? 'ecobag'
      : 'camiseta';

  const presets = PRODUCT_PRINT_PRESETS[normalizedType] || PRODUCT_PRINT_PRESETS.camiseta;
  const [activePresetId, setActivePresetId] = useState(() => presets[1]?.id || presets[0]?.id);

  // Identifica preset ativo
  const handleSelectPreset = (preset) => {
    setActivePresetId(preset.id);
    if (!preset.isFree && preset.transform && onTransformChange) {
      onTransformChange({
        ...preset.transform,
        rotation: currentTransform?.rotation || 0
      });
    }
    if (preset.sizeKey && onProductSizeChange) {
      onProductSizeChange(preset.sizeKey);
    }
  };

  const activePreset = presets.find((p) => p.id === activePresetId) || presets[0];

  return (
    <div className="space-y-2.5 p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-ceu-navy text-ceu-aqua flex items-center justify-center shrink-0">
            <Ruler className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 block leading-tight">
              Tamanho da Estampa no Produto
            </span>
            <span className="text-[11px] text-slate-500">
              Escolha uma medida padrão ou selecione Ajuste Livre
            </span>
          </div>
        </div>

        {/* Informação do produto atual */}
        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full self-start sm:self-auto">
          {normalizedType === 'quadro'
            ? 'Formatos de Quadro: A4, A3 e A1'
            : normalizedType === 'caneca'
            ? 'Sublimada / DTF UV: 23,2 × 17,9 cm (Estampa Inclusa)'
            : normalizedType === 'ecobag'
            ? 'Padrão Ecobag'
            : `Vestuário: ${side === 'front' ? 'Frente' : 'Costas'}`}
        </span>
      </div>

      {/* Grid de Botões de Tamanho */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {presets.map((preset) => {
          const isSelected = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-ceu-navy bg-ceu-navy text-white shadow-sm ring-2 ring-ceu-navy/20'
                  : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-bold truncate">{preset.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-ceu-aqua shrink-0" />}
                </div>
                <div
                  className={`text-[11px] font-mono font-bold leading-tight ${
                    isSelected ? 'text-ceu-aqua' : 'text-slate-900'
                  }`}
                >
                  {preset.dimension}
                </div>
              </div>
              <p
                className={`text-[10px] mt-1 line-clamp-1 ${
                  isSelected ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                {preset.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Dica de interação livre */}
      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5">
          <Move className="w-3 h-3 text-slate-400" />
          {activePreset.isFree
            ? 'Ajuste Livre ativado: arraste na tela ou use os sliders abaixo para posicionar como quiser.'
            : `Tamanho aplicado: ${activePreset.label} (${activePreset.dimension}). Você ainda pode mover ou girar.`}
        </span>

        {activePresetId !== 'livre' && (
          <button
            type="button"
            onClick={() => setActivePresetId('livre')}
            className="text-ceu-navy font-bold hover:underline cursor-pointer shrink-0"
          >
            Mudar para ajuste livre
          </button>
        )}
      </div>
    </div>
  );
}
