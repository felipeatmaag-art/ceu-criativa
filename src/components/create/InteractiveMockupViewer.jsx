import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, GalleryHorizontalEnd, Save, History, Trash2,
  FlipHorizontal2, Check, X,
} from 'lucide-react';

/**
 * Editor de mockup inspirado no Marketgen 2026.
 *
 * - Upload da foto base do produto (em vez de outline SVG)
 * - Toggle FRENTE / COSTAS
 * - 4 sliders precisos: Escala, Rotação, Offset X, Offset Y
 * - Sistema de presets (salvar/carregar posições) via localStorage
 * - Tema dark com acento laranja
 */

const ACCENT = '#ff6600';
const PRESETS_KEY = 'ceu_mockup_presets';

function loadPresets() {
  try {
    return JSON.parse(localStorage.getItem(PRESETS_KEY) || '{}');
  } catch { return {}; }
}

function savePresets(presets) {
  localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
}

// Slider individual com label, valor e track dark
function SliderControl({ label, value, min, max, step, unit, onChange }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{label}</span>
        <span className="text-xs font-semibold text-white tabular-nums">
          {Math.round(value)}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 appearance-none rounded-full cursor-pointer
                   bg-neutral-800
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-[#ff6600]
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-orange-500/30
                   [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-orange-400
                   [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-[#ff6600]
                   [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-orange-400
                   [&::-moz-range-thumb]:cursor-pointer"
        style={{ accentColor: ACCENT }}
      />
    </div>
  );
}

export default function InteractiveMockupViewer({
  productType,
  designImage,
  color,
  renderMockup,
  transform,
  onTransformChange,
}) {
  const [side, setSide] = useState('front');
  const [baseImage, setBaseImage] = useState(null);
  const [isUploadingBase, setIsUploadingBase] = useState(false);
  const [presets, setPresets] = useState({});
  const [showPresets, setShowPresets] = useState(false);
  const [presetName, setPresetName] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  // Upload da foto base do produto
  const handleBaseUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBase(true);
    try {
      const { base44 } = await import('@/api/base44Client');
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result?.file_url) setBaseImage(result.file_url);
    } catch (err) {
      console.error('Erro no upload da base:', err);
    }
    setIsUploadingBase(false);
  };

  // --- Transform helpers ---
  const setScale = (v) => onTransformChange({ ...transform, scale: v / 100 });
  const setRotation = (v) => onTransformChange({ ...transform, rotation: v });
  const setOffsetX = (v) => onTransformChange({ ...transform, x: v });
  const setOffsetY = (v) => onTransformChange({ ...transform, y: v });

  const scalePct = Math.round(transform.scale * 100);
  const rotDeg = Math.round(transform.rotation);
  const offsetX = Math.round(transform.x);
  const offsetY = Math.round(transform.y);

  // --- Presets ---
  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    const key = `${productType}_${side}`;
    const updated = {
      ...presets,
      [key]: [
        ...(presets[key] || []),
        {
          id: Date.now(),
          name: presetName.trim(),
          transform: { ...transform },
        },
      ],
    };
    setPresets(updated);
    savePresets(updated);
    setPresetName('');
  };

  const handleApplyPreset = (preset) => {
    onTransformChange({ ...preset.transform });
    setShowPresets(false);
  };

  const handleDeletePreset = (presetId) => {
    const key = `${productType}_${side}`;
    const updated = {
      ...presets,
      [key]: (presets[key] || []).filter((p) => p.id !== presetId),
    };
    setPresets(updated);
    savePresets(updated);
  };

  const currentPresets = presets[`${productType}_${side}`] || [];

  return (
    <div className="w-full h-full bg-[#0f0f0f] rounded-2xl overflow-hidden flex flex-col">
      {/* Toggle FRENTE / COSTAS */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800/60">
        <div className="flex gap-1 bg-neutral-900 rounded-full p-1">
          <button
            onClick={() => setSide('front')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all ${
              side === 'front' ? 'bg-[#ff6600] text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Frente
          </button>
          <button
            onClick={() => setSide('back')}
            className={`px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase transition-all flex items-center gap-1 ${
              side === 'back' ? 'bg-[#ff6600] text-white' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <FlipHorizontal2 className="w-3 h-3" />
            Costas
          </button>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-600 uppercase tracking-wider">
          <GalleryHorizontalEnd className="w-3.5 h-3.5" />
          {baseImage ? 'Peça carregada' : 'Sem peça base'}
        </div>
      </div>

      {/* Área de preview */}
      <div className="flex-1 relative min-h-[280px] flex items-center justify-center p-4">
        {baseImage ? (
          <>
            {/* Foto base do produto */}
            <img
              src={baseImage}
              alt="Peça base"
              className="absolute inset-0 w-full h-full object-contain"
              draggable={false}
            />
            {/* Estampa sobreposta */}
            {designImage && (
              <div
                className="absolute z-10 touch-none"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${offsetX}px, ${offsetY}px) scale(${transform.scale}) rotate(${rotDeg}deg)`,
                  transition: 'transform 0.15s ease-out',
                }}
              >
                <img
                  src={designImage}
                  alt="Estampa"
                  draggable={false}
                  className="max-w-[60%] max-h-[60%] object-contain pointer-events-none select-none"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
                />
              </div>
            )}
          </>
        ) : (
          /* Upload prompt — AGUARDANDO PEÇA BASE */
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingBase}
            className="w-full h-full min-h-[240px] rounded-xl border border-dashed border-neutral-700 hover:border-[#ff6600]/50 hover:bg-orange-500/5 transition-all flex flex-col items-center justify-center gap-3 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleBaseUpload}
              className="hidden"
            />
            {isUploadingBase ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-[#ff6600] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-gray-500 uppercase tracking-wider">Carregando...</span>
              </div>
            ) : (
              <>
                <div className="w-14 h-14 rounded-2xl bg-neutral-800 group-hover:bg-orange-500/10 flex items-center justify-center transition-colors">
                  <GalleryHorizontalEnd className="w-7 h-7 text-gray-500 group-hover:text-[#ff6600] transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-white uppercase tracking-wider mb-1">
                    Aguardando peça base
                  </p>
                  <p className="text-xs text-gray-600 max-w-xs">
                    Faça upload de uma foto do produto em branco para posicionar a estampa
                  </p>
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-[10px] text-[#ff6600] uppercase tracking-wider font-semibold">
                  <Upload className="w-3 h-3" />
                  Enviar foto
                </div>
              </>
            )}
          </button>
        )}

        {/* Trocar peça base */}
        {baseImage && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute top-2 right-2 z-20 w-8 h-8 rounded-lg bg-neutral-900/80 hover:bg-[#ff6600] flex items-center justify-center transition-colors"
            title="Trocar peça base"
          >
            <Upload className="w-4 h-4 text-gray-400" />
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleBaseUpload}
          className="hidden"
        />
      </div>

      {/* Painel de controles — 4 sliders */}
      {baseImage && designImage && (
        <div className="px-4 py-3 border-t border-neutral-800/60 space-y-3">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <SliderControl
              label="Escala da estampa"
              value={scalePct}
              min={10} max={250} step={1}
              unit="%"
              onChange={setScale}
            />
            <SliderControl
              label="Rotação da arte"
              value={rotDeg}
              min={0} max={360} step={1}
              unit="°"
              onChange={setRotation}
            />
            <SliderControl
              label="Offset horizontal (X)"
              value={offsetX}
              min={-200} max={200} step={1}
              unit="px"
              onChange={setOffsetX}
            />
            <SliderControl
              label="Offset vertical (Y)"
              value={offsetY}
              min={-200} max={200} step={1}
              unit="px"
              onChange={setOffsetY}
            />
          </div>

          {/* Presets */}
          <div className="pt-2 border-t border-neutral-800/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-gray-500" />
                <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">
                  Presets de posição
                </span>
              </div>
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="text-[10px] text-gray-500 hover:text-[#ff6600] uppercase tracking-wider font-semibold"
              >
                {showPresets ? 'Ocultar' : 'Ver'} ({currentPresets.length})
              </button>
            </div>

            {/* Salvar preset */}
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Nome do preset..."
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSavePreset()}
                className="flex-1 h-8 px-3 rounded-lg bg-neutral-900 border border-neutral-800 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ff6600]/50"
              />
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="h-8 px-3 rounded-lg border border-neutral-700 hover:border-[#ff6600] hover:text-[#ff6600] text-gray-400 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Save className="w-3 h-3" />
                Salvar
              </button>
            </div>

            {/* Lista de presets */}
            <AnimatePresence>
              {showPresets && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  {currentPresets.length === 0 ? (
                    <p className="text-[10px] text-gray-600 uppercase tracking-wider py-2 text-center">
                      Nenhum preset salvo ainda
                    </p>
                  ) : (
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {currentPresets.map((preset) => (
                        <div
                          key={preset.id}
                          className="flex items-center gap-2 p-2 rounded-lg bg-neutral-900 hover:bg-neutral-800 transition-colors group"
                        >
                          <button
                            onClick={() => handleApplyPreset(preset)}
                            className="flex-1 text-left flex items-center gap-2"
                          >
                            <Check className="w-3 h-3 text-gray-600 group-hover:text-[#ff6600]" />
                            <span className="text-xs text-gray-300 font-medium">{preset.name}</span>
                          </button>
                          <button
                            onClick={() => handleDeletePreset(preset.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-gray-600 hover:text-red-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}