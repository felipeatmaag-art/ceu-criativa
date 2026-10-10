import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { User, CheckCircle2 } from 'lucide-react';
import TshirtInUseMockup from '@/components/create/TshirtInUseMockup';

export default function ApprovedMockupGallery({ production = {}, design = {} }) {
  const humanUrl =
    production?.mockup_human_url ||
    design?.mockup_human_url ||
    (design?.image_url && (
      design.image_url.includes('Man_') ||
      design.image_url.includes('Woman_') ||
      design.image_url.includes('Person_') ||
      design.image_url.includes('Model_') ||
      design.image_url.includes('mockup')
    ) ? design.image_url : null);

  const sides = [
    ...(production?.mockup_front_url ? [['front', 'Frente', production.mockup_front_url]] : []),
    ...(production?.mockup_back_url ? [['back', 'Costas', production.mockup_back_url]] : []),
    ...(humanUrl ? [['human', '👤 Modelo (Humanizado)', humanUrl]] : []),
  ];

  // Se não houver mockup humanizado pré-salvo em designs aprovados antigos, adicionamos opção dinâmica
  if (!humanUrl && (design?.image_url || production?.front?.file_url)) {
    sides.push(['human_dynamic', '👤 Modelo (Em Uso)', null]);
  }

  // Se nenhum side foi encontrado, usa front padrão
  if (sides.length === 0 && production?.mockup_front_url) {
    sides.push(['front', 'Frente', production.mockup_front_url]);
  }

  const [activeSide, setActiveSide] = useState(() => {
    // Preferência para modelo humanizado se existir
    return humanUrl ? 'human' : (sides[0]?.[0] || 'front');
  });

  const active = sides.find(([key]) => key === activeSide) || sides[0] || ['front', 'Frente', ''];
  const isHuman = active[0] === 'human' || active[0] === 'human_dynamic';

  const designImg = design?.image_url || production?.front?.file_url;

  return (
    <div className="space-y-4">
      {/* Seletor de Vistas */}
      <div className="flex flex-wrap gap-2">
        {sides.map(([key, label]) => {
          const isSelected = active[0] === key;
          const isHumanTab = key.startsWith('human');
          return (
            <Button
              key={key}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveSide(key)}
              className={`rounded-xl font-bold transition-all ${
                isSelected
                  ? isHumanTab
                    ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm'
                    : 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white hover:bg-slate-100 text-slate-700'
              }`}
            >
              {label}
            </Button>
          );
        })}
      </div>

      {/* Exibição da Imagem do Mockup */}
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center">
        {active[0] === 'human_dynamic' && designImg ? (
          <TshirtInUseMockup designImage={designImg} color={production?.color || 'white'} />
        ) : (
          <img
            src={active[2]}
            alt={`Aplicação aprovada — ${active[1]}`}
            className="h-full w-full object-contain"
          />
        )}

        {isHuman && (
          <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-md">
            <User className="w-3.5 h-3.5 text-amber-400" />
            <span>Mockup Humanizado</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600 px-1">
        <p className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>
            Aplicação aprovada pelo artista
            {production?.color ? ` · Cor ${production.color}` : ''}
            {isHuman ? ' · Modelo real vestindo a peça' : ' · Prova técnica de corte'}
          </span>
        </p>
      </div>
    </div>
  );
}
