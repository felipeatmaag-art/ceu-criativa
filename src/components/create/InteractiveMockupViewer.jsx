import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GalleryHorizontalEnd, Save, History, Trash2, Check, Copy, ArrowLeftRight, Sparkles, AlertCircle,
  Ruler, User
} from 'lucide-react';
import ApparelPrintStage from '@/components/create/ApparelPrintStage';
import TshirtInUseMockup from '@/components/create/TshirtInUseMockup';
import { lockPrintPlacement } from '@/components/create/printGeometry';
import { getArtworkMetadata } from '@/components/create/artworkMetadata';
import { captureStudioElement } from '@/components/create/studioMockups';
import { calculatePrintDimensions } from '@/components/create/dtfPricing';
import StandardPrintSizesGuide from '@/components/create/StandardPrintSizesGuide';
import ProductPrintSizeSelector from '@/components/create/ProductPrintSizeSelector';

/**
 * Editor de mockup inspirado no Marketgen 2026.
 *
 * - Upload da foto base do produto (em vez de outline SVG)
 * - Toggle FRENTE / COSTAS
 * - 4 sliders precisos: Escala, Rotação, Offset X, Offset Y
 * - Sistema de presets (salvar/carregar posições) via localStorage
 * - Tema dark com acento laranja
 */

const ACCENT = '#d4d4d4';
const PRESETS_KEY = 'ceu_mockup_presets';
const PRODUCT_LABELS = { camiseta: 'Camiseta', baby_look: 'Baby Look', caneca: 'Caneca', quadro: 'Quadro' };

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
        <span className="text-xs font-bold tracking-widest text-ceu-navy/55 uppercase">{label}</span>
        <span className="text-sm font-semibold text-ceu-navy tabular-nums">
          {Math.round(value)}{unit}
        </span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min} max={max} step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2.5 appearance-none rounded-full cursor-pointer touch-pan-x
                   bg-ceu-navy/15
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-ceu-aqua
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:shadow-ceu-aqua/30
                   [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ceu-cloud
                   [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:h-6
                   [&::-moz-range-thumb]:rounded-full
                   [&::-moz-range-thumb]:bg-ceu-aqua
                   [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-ceu-cloud
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
  side: controlledSide,
  onSideChange,
  productViews,
  customBaseImages,
  onBaseImagesChange,
  captureRef,
  frontImage,
  backImage,
  onCopyFrontToBack,
  onCopyBackToFront,
  onMoveFrontToBack,
  onMoveBackToFront,
  onGenerateBackAI,
  onRemoveArtwork,
  selectedSize,
  onSizeChange,
}) {
  const [localSide, setLocalSide] = useState('front');
  const side = controlledSide ?? localSide;
  const setSide = (nextSide) => {
    setLocalSide(nextSide);
    onSideChange?.(nextSide);
  };
  const isApparel = productType === 'camiseta' || productType === 'baby_look';
  const baseImage = productViews?.[side] || productViews?.front;
  const updateTransform = (next) => {
    if (!isApparel || !designImage) return onTransformChange(next);
    let ratio = 1;
    try {
      const bounds = getArtworkMetadata(designImage)?.bounds;
      if (bounds && bounds.width && bounds.height) {
        ratio = bounds.width / bounds.height;
      }
    } catch {}
    const placement = lockPrintPlacement(next, ratio);
    onTransformChange(placement.transform);
  };

  useEffect(() => {
    setSide('front');
  }, [productType]);
  const [isPreviewHuman, setIsPreviewHuman] = useState(false);
  const [presets, setPresets] = useState({});
  const [showPresets, setShowPresets] = useState(false);
  const [presetName, setPresetName] = useState('');
  const fileInputRef = useRef(null);
  const designRef = useRef(null);
  const stageRef = useRef(null);
  useEffect(() => {
    if (captureRef) captureRef.current = () => captureStudioElement(stageRef.current);
    return () => { if (captureRef) captureRef.current = null; };
  }, [captureRef]);
  const pointersRef = useRef(new Map());
  const gestureRef = useRef(null);
  const frameRef = useRef(null);
  const liveTransformRef = useRef(transform);

  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  // --- Transform helpers ---
  const setScale = (v) => updateTransform({ ...transform, scale: v / 100 });
  const setRotation = (v) => updateTransform({ ...transform, rotation: v });
  const setOffsetX = (v) => updateTransform({ ...transform, x: v });
  const setOffsetY = (v) => updateTransform({ ...transform, y: v });

  const paintTransform = useCallback((next) => {
    liveTransformRef.current = next;
    if (frameRef.current) return;
    frameRef.current = requestAnimationFrame(() => {
      frameRef.current = null;
      if (!designRef.current) return;
      designRef.current.style.left = `${50 + next.x / 10}%`;
      designRef.current.style.top = `${50 + next.y / 10}%`;
      designRef.current.style.transform = `translate(-50%, -50%) scale(${next.scale}) rotate(${next.rotation}deg)`;
    });
  }, []);

  useEffect(() => {
    if (!gestureRef.current) paintTransform(transform);
  }, [transform, paintTransform]);

  useEffect(() => () => frameRef.current && cancelAnimationFrame(frameRef.current), []);

  const rebaseGesture = useCallback(() => {
    const points = [...pointersRef.current.values()];
    if (!points.length) {
      gestureRef.current = null;
      return;
    }
    const center = points.reduce((acc, point) => ({ x: acc.x + point.x / points.length, y: acc.y + point.y / points.length }), { x: 0, y: 0 });
    const distance = points.length > 1 ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y) : 0;
    gestureRef.current = { center, distance, transform: { ...liveTransformRef.current } };
  }, []);

  const handlePointerDown = useCallback((event) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    rebaseGesture();
  }, [rebaseGesture]);

  const handlePointerMove = useCallback((event) => {
    if (!pointersRef.current.has(event.pointerId) || !gestureRef.current) return;
    event.preventDefault();
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointersRef.current.values()];
    const center = points.reduce((acc, point) => ({ x: acc.x + point.x / points.length, y: acc.y + point.y / points.length }), { x: 0, y: 0 });
    const start = gestureRef.current;
    let scale = start.transform.scale;
    if (points.length > 1 && start.distance > 0) {
      const distance = Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
      scale = Math.min(2.5, Math.max(0.1, start.transform.scale * distance / start.distance));
    }
    paintTransform({
      ...start.transform,
      x: start.transform.x + (center.x - start.center.x) * 1000 / stageRef.current.clientWidth,
      y: start.transform.y + (center.y - start.center.y) * 1000 / stageRef.current.clientWidth,
      scale,
    });
  }, [paintTransform]);

  const handlePointerEnd = useCallback((event) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.delete(event.pointerId);
    if (pointersRef.current.size) {
      rebaseGesture();
      return;
    }
    gestureRef.current = null;
    onTransformChange({ ...liveTransformRef.current });
  }, [onTransformChange, rebaseGesture]);

  const scalePct = Math.round(transform.scale * 100);
  const rotDeg = Math.round(transform.rotation);
  const offsetX = Math.round(transform.x);
  const offsetY = Math.round(transform.y);

  // Dimensões reais físicas e custo de DTF proporcional
  let designRatio = 1;
  try {
    const bounds = getArtworkMetadata(designImage)?.bounds;
    if (bounds?.width && bounds?.height) {
      designRatio = bounds.width / bounds.height;
    }
  } catch {}
  const dtfMetrics = calculatePrintDimensions(transform, designRatio, productType);

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
    updateTransform({ ...preset.transform });
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
    <div className="w-full h-full bg-card rounded-2xl border border-ceu-navy/10 shadow-sm overflow-hidden flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-ceu-navy/10 px-5 py-4">
        {isApparel ? (
          <div className="flex gap-1.5 rounded-full bg-ceu-navy/5 p-1">
            <button
              type="button"
              onClick={() => setSide('front')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                side === 'front' ? 'bg-ceu-navy text-ceu-cloud shadow-sm' : 'text-ceu-navy/60 hover:text-ceu-navy'
              }`}
            >
              Frente
              {frontImage ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Estampa ativa na frente" />
              ) : (
                <span className="text-[10px] text-ceu-navy/40 font-normal lowercase">(lisa)</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSide('back')}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                side === 'back' && !isPreviewHuman ? 'bg-ceu-navy text-ceu-cloud shadow-sm' : 'text-ceu-navy/60 hover:text-ceu-navy'
              }`}
            >
              Costas
              {backImage ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Estampa ativa nas costas" />
              ) : (
                <span className="text-[10px] text-ceu-navy/40 font-normal lowercase">(lisa)</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsPreviewHuman(!isPreviewHuman)}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition-all ${
                isPreviewHuman
                  ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-400/40'
                  : 'text-amber-800 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/80'
              }`}
              title="Pré-visualizar a estampa no modelo humanizado em uso (estilo Felipe Silvério)"
            >
              <User className="w-3.5 h-3.5 text-amber-500" />
              {isPreviewHuman ? 'Voltar ao Editor' : '👤 No Modelo'}
            </button>
          </div>
        ) : (
          <span className="rounded-full border border-ceu-navy/15 px-4 py-2 text-xs font-bold uppercase tracking-wider text-ceu-navy/60">Vista frontal</span>
        )}
        <div className="ml-auto flex items-center gap-2 text-[10px] uppercase tracking-widest text-ceu-navy/50">
          <GalleryHorizontalEnd className="h-4 w-4" />
          {PRODUCT_LABELS[productType]}
        </div>
      </div>

      {/* Área de preview */}
      <div ref={stageRef} className={isApparel ? 'flex-1 relative min-h-[420px] lg:min-h-[640px] flex items-center justify-center p-6' : 'relative aspect-square w-full flex items-center justify-center'}>
        {isPreviewHuman ? (
          <div className="relative w-full h-full min-h-[400px] flex items-center justify-center">
            <TshirtInUseMockup
              designImage={side === 'back' ? (backImage || designImage) : (frontImage || designImage)}
              color={color}
              transform={transform}
            />
          </div>
        ) : isApparel ? (
          <ApparelPrintStage baseUrl={baseImage} designImage={designImage} transform={transform} onChange={updateTransform} />
        ) : baseImage ? (
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
                ref={designRef}
                className="absolute z-10 touch-none cursor-grab active:cursor-grabbing select-none"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                style={{
                  left: `${50 + transform.x / 10}%`,
                  top: `${50 + transform.y / 10}%`,
                  width: '60%', height: '60%',
                  transform: `translate(-50%, -50%) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
                  transformOrigin: 'center',
                  willChange: 'transform',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                }}
              >
                <img
                  src={designImage}
                  alt="Estampa"
                  draggable={false}
                  className="w-full h-full object-contain pointer-events-none select-none"
                  style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))' }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0">{renderMockup?.(designImage)}</div>
        )}
      </div>

      {/* Painel de controles da estampa */}
      {designImage ? (
        <div className="px-6 py-5 border-t border-ceu-navy/10 space-y-5">
          <div className="flex items-center justify-between text-xs text-muted-foreground pb-1">
            <span className="font-semibold text-ceu-navy">
              Ajustando estampa: <span className="uppercase text-amber-600">{side === 'front' ? 'Frente' : 'Costas'}</span>
            </span>
            <div className="flex items-center gap-2">
              {side === 'front' && onCopyFrontToBack && !backImage && (
                <button
                  type="button"
                  onClick={onCopyFrontToBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ceu-navy/5 hover:bg-ceu-navy/10 text-ceu-navy text-xs font-semibold transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar para as costas
                </button>
              )}
              {side === 'front' && onMoveFrontToBack && (
                <button
                  type="button"
                  onClick={onMoveFrontToBack}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ceu-navy/15 hover:bg-ceu-navy/5 text-ceu-navy text-xs font-semibold transition-all"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Mover para as costas
                </button>
              )}
              {side === 'back' && onCopyBackToFront && !frontImage && (
                <button
                  type="button"
                  onClick={onCopyBackToFront}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ceu-navy/5 hover:bg-ceu-navy/10 text-ceu-navy text-xs font-semibold transition-all"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar para a frente
                </button>
              )}
              {side === 'back' && onRemoveArtwork && (
                <button
                  type="button"
                  onClick={() => onRemoveArtwork('back')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remover das costas
                </button>
              )}
            </div>
          </div>

          {/* Métrica Física de DTF / Sublimação & Custo em Tempo Real */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50/80 border border-emerald-200/90 p-3.5 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Ruler className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      {productType === 'caneca' ? 'Gabarito Oficial de Sublimação' : `Tamanho Físico Real (${side === 'front' ? 'Frente' : 'Costas'})`}
                    </span>
                    <span className="text-[10px] font-semibold bg-emerald-200/70 text-emerald-800 px-1.5 py-0.2 rounded-md">
                      {productType === 'caneca' ? 'Sublimada / DTF UV' : 'DTF 58cm'}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 font-medium">
                    {productType === 'caneca' ? (
                      <>Área Padrão: <strong className="text-emerald-950 font-bold">23,2 × 17,9 cm</strong> (Panorâmica 360° da Caneca)</>
                    ) : (
                      <>Dimensão: <strong className="text-emerald-950 font-bold">{dtfMetrics.widthCm} × {dtfMetrics.heightCm} cm</strong> ({dtfMetrics.areaCm2} cm²)</>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-emerald-200/60">
                <StandardPrintSizesGuide variant="modal-button" activeProductType={productType} />
                <div className="sm:text-right">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    {productType === 'caneca' ? 'Impressão da Caneca' : 'Custo DTF da Estampa'}
                  </span>
                  <span className="text-base font-extrabold text-emerald-900">
                    {productType === 'caneca' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-black">
                        Inclusa (R$ 0,00)
                      </span>
                    ) : (
                      `R$ ${dtfMetrics.dtfCost.toFixed(2)}`
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seletor Dinâmico de Tamanho de Estampa por Produto */}
          <ProductPrintSizeSelector
            productType={productType}
            currentTransform={transform}
            onTransformChange={updateTransform}
            selectedProductSize={selectedSize}
            onProductSizeChange={onSizeChange}
            side={side}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
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
              unit=" un."
              onChange={setOffsetX}
            />
            <SliderControl
              label="Offset vertical (Y)"
              value={offsetY}
              min={-200} max={200} step={1}
              unit=" un."
              onChange={setOffsetY}
            />
          </div>

          {/* Presets */}
          <div className="pt-4 border-t border-ceu-navy/10">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-ceu-navy/50" />
                <span className="text-[10px] font-bold tracking-widest text-ceu-navy/50 uppercase">
                  Presets de posição
                </span>
              </div>
              <button
                onClick={() => setShowPresets(!showPresets)}
                className="text-[10px] text-ceu-navy/50 hover:text-ceu-aqua uppercase tracking-wider font-semibold"
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
                className="flex-1 h-10 px-3 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 focus:border-slate-800 shadow-sm"
              />
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="h-10 px-4 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
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
      ) : isApparel && (
        <div className="px-6 py-5 border-t border-ceu-navy/10 bg-amber-50/70">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-950">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                {side === 'back' ? 'Costas lisas (sem estampa)' : 'Frente lisa (sem estampa)'}
              </div>
              <p className="text-xs text-amber-900 leading-relaxed">
                {side === 'back'
                  ? 'Você pode aplicar a mesma estampa da frente aqui, mover a arte para as costas ou gerar uma estampa exclusiva com IA.'
                  : 'Você pode aplicar a mesma estampa das costas na frente ou mover a arte para a frente.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {side === 'back' && frontImage && (
                <>
                  <button
                    type="button"
                    onClick={onCopyFrontToBack}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-ceu-navy text-ceu-cloud hover:bg-ceu-navy/90 transition-all shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Arte da Frente para as Costas
                  </button>
                  <button
                    type="button"
                    onClick={onMoveFrontToBack}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-amber-300 text-amber-950 hover:bg-amber-100 transition-all shadow-sm"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Mover para as Costas
                  </button>
                </>
              )}
              {side === 'front' && backImage && (
                <>
                  <button
                    type="button"
                    onClick={onCopyBackToFront}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-ceu-navy text-ceu-cloud hover:bg-ceu-navy/90 transition-all shadow-sm"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Arte das Costas para Frente
                  </button>
                  <button
                    type="button"
                    onClick={onMoveBackToFront}
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white border border-amber-300 text-amber-950 hover:bg-amber-100 transition-all shadow-sm"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    Mover para a Frente
                  </button>
                </>
              )}
              {side === 'back' && onGenerateBackAI && (
                <button
                  type="button"
                  onClick={onGenerateBackAI}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-sm"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Gerar Costas com IA
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}