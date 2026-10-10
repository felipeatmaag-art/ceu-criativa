import React, { useEffect, useRef, useState } from 'react';
import generateCatalogMockups from '@/components/create/generateCatalogMockups';
import { hasPrintStage } from '@/components/create/studioMockups';
import { Loader2, Sparkles, User, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MockupResults from '@/components/create/MockupResults';

const HUMAN_STYLES = {
  human_street: { label: '👤 Streetwear Urbano', desc: 'Modelo jovem na rua (estilo Felipe Silvério)' },
  human_wall: { label: '🧱 Muro de Tijolos', desc: 'Atmosfera urbana encostado no muro' },
  human_cafe: { label: '☕ Cafeteria & Lifestyle', desc: 'Ambiente casual e acolhedor' },
  human_balcony: { label: '🏙️ Sacada & Pôr do Sol', desc: 'Luz natural dourada e vista urbana' },
  human_studio: { label: '📸 Estúdio Editorial', desc: 'Lookbook minimalista de alta moda' },
};

const STUDIO_STYLES = {
  studio: { label: 'Estúdio Minimalista', desc: 'Fundo neutro profissional limpo' },
  beige: { label: 'Bege Editorial', desc: 'Estúdio aquecido com estética contemporânea' },
  external: { label: 'Luz Natural', desc: 'Área externa com iluminação suave' },
  artistic: { label: 'Cenário Artístico', desc: 'Composição criativa autoral' },
};

export default function MockupStyleGenerator({ options, onGenerated, onBusyChange }) {
  const isApparel = hasPrintStage(options.productType);
  const baseAngles = {
    front: 'Frente',
    ...(isApparel && options.views?.back ? { back: 'Costas' } : {}),
    ...(isApparel ? { human: '👤 Modelo Humanizado' } : {})
  };

  const [activeTab, setActiveTab] = useState('human'); // 'human' | 'studio'
  const [style, setStyle] = useState('human_street');
  const [angles, setAngles] = useState(Object.keys(baseAngles));
  const active = useRef(true);

  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      onBusyChange?.(false);
    };
  }, [onBusyChange]);

  const [results, setResults] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const toggleAngle = (angle) => {
    setAngles((current) =>
      current.includes(angle)
        ? (current.length > 1 ? current.filter((item) => item !== angle) : current)
        : [...current, angle]
    );
  };

  const generate = async () => {
    setGenerating(true);
    setResults([]);
    setError('');
    onBusyChange?.(true);

    try {
      const currentDesc = HUMAN_STYLES[style]?.desc || STUDIO_STYLES[style]?.desc || 'estúdio contemporâneo';
      const generated = await generateCatalogMockups(options, style, currentDesc, angles);
      if (active.current) {
        setResults(generated);
        onGenerated?.({ style, items: generated });
      }
    } catch (e) {
      if (active.current) {
        setError(e.message || 'Não foi possível gerar os mockups. Tente novamente.');
      }
    } finally {
      if (active.current) {
        setGenerating(false);
        onBusyChange?.(false);
      }
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200/90 bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-base">Mockups para a Loja do Cliente</h3>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
              Inclui Humanizado
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-600 leading-relaxed">
            Gera imagens de vitrine prontas para publicar na loja. Inclui <strong>mockup humanizado com modelo real vestindo a peça</strong> (no mesmo padrão visual do perfil de Felipe Silvério) e provas técnicas de corte.
          </p>
        </div>
      </div>

      {/* Tabs Humanizado vs Estúdio */}
      <div className="flex rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab('human');
            if (!style.startsWith('human_')) setStyle('human_street');
            if (!angles.includes('human')) setAngles(prev => [...prev, 'human']);
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'human'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-3.5 h-3.5 text-amber-600" />
          Modelos Humanizados
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('studio');
            if (style.startsWith('human_')) setStyle('studio');
          }}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'studio'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Camera className="w-3.5 h-3.5 text-slate-600" />
          Estúdio / Still
        </button>
      </div>

      {/* Grid de Estilos */}
      {activeTab === 'human' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {Object.entries(HUMAN_STYLES).map(([key, item]) => {
            const isSelected = style === key;
            return (
              <button
                key={key}
                type="button"
                disabled={generating}
                onClick={() => setStyle(key)}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/70 text-slate-900 ring-2 ring-amber-500/20 shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">{item.label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{item.desc}</div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(STUDIO_STYLES).map(([key, item]) => {
            const isSelected = style === key;
            return (
              <button
                key={key}
                type="button"
                disabled={generating}
                onClick={() => setStyle(key)}
                className={`rounded-2xl border p-3 text-left transition-all ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900 text-white shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80 text-slate-700'
                }`}
              >
                <div className="text-xs font-bold">{item.label}</div>
                <div className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                  {item.desc}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Seleção de Vistas / Ângulos */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
          Imagens a Gerar para a Vitrine:
        </span>
        <div className="flex flex-wrap gap-2">
          {Object.entries(baseAngles).map(([key, label]) => {
            const isChecked = angles.includes(key);
            const isHuman = key === 'human';
            return (
              <button
                key={key}
                type="button"
                disabled={generating}
                onClick={() => toggleAngle(key)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isChecked
                    ? isHuman
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {label}
                {isChecked && <span className="text-[10px] ml-0.5">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Botão de Ação */}
      <Button
        onClick={generate}
        disabled={generating || !options.frontImage || !angles.length}
        className="h-12 w-full rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md transition-all text-sm gap-2"
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Gerando mockups humanizados e catálogo...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Gerar Mockups para Publicar na Loja
          </>
        )}
      </Button>

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {error}
        </div>
      )}

      <MockupResults results={results} />
    </div>
  );
}
