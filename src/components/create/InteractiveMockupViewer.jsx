import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, GalleryHorizontalEnd, Save, History, Trash2,
  FlipHorizontal2, Check, X, Box, Image as ImageIcon, MoveHorizontal,
} from 'lucide-react';
import MockupViewer3D from '@/components/design/MockupViewer3D';
import ApparelPrintStage from '@/components/create/ApparelPrintStage';
import { lockPrintPlacement } from '@/components/create/printGeometry';
import { getArtworkMetadata } from '@/components/create/artworkMetadata';
import { captureStudioElement } from '@/components/create/studioMockups';

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
}) {
  const [localSide, setLocalSide] = useState('front');
  const side = controlledSide ?? localSide;
  const setSide = (nextSide) => {
    setLocalSide(nextSide);
    onSideChange?.(nextSide);
  };
  const isApparel = productType === 'camiseta' || productType === 'baby_look';
  const isMug = productType === 'caneca';
  const [viewMode, setViewMode] = useState(isMug ? '3d' : '2d');
  const [baseImages, setBaseImages] = useState({ front: null, back: null });
  const baseImage = (customBaseImages || baseImages)[side];
  const updateTransform = (next) => {
    if (!isApparel || !designImage) return onTransformChange(next);
    const bounds = getArtworkMetadata(designImage).bounds;
    const placement = lockPrintPlacement(next, bounds.width / bounds.height);
    onTransformChange(placement.transform);
  };

  useEffect(() => {
    setViewMode(isMug ? '3d' : '2d');
    setSide('front');
  }, [productType, isMug]);
  const [isUploadingBase, setIsUploadingBase] = useState(false);
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

  // Upload da foto base do produto
  const handleBaseUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBase(true);
    try {
      const { base44 } = await import('@/api/base44Client');
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result?.file_url) {
        const next = { ...(customBaseImages || baseImages), [side]: result.file_url };
        setBaseImages(next);
        onBaseImagesChange?.(next);
      }
    } catch (err) {
      console.error('Erro no upload da base:', err);
    }
    setIsUploadingBase(false);
  };

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
          <div className="flex gap-1 rounded-full bg-ceu-navy/5 p-1">
            <button onClick={() => setSide('front')} className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider ${side === 'front' ? 'bg-ceu-navy text-ceu-cloud' : 'text-ceu-navy/50'}`}>Frente</button>
            <button onClick={() => setSide('back')} className={`rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-wider ${side === 'back' ? 'bg-ceu-navy text-ceu-cloud' : 'text-ceu-navy/50'}`}>Costas</button>
          </div>
        ) : (
          <span className="rounded-full border border-neutral-700 px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-300">{isMug ? 'Visualização 360°' : 'Vista frontal'}</span>
        )}
        <div className="ml-auto flex items-center gap-2 text-[10px] uppercase tracking-widest text-ceu-navy/50">
          {isMug ? <MoveHorizontal className="h-4 w-4" /> : <GalleryHorizontalEnd className="h-4 w-4" />}
          {isMug ? 'Arraste para girar' : PRODUCT_LABELS[productType]}
        </div>
      </div>

      {/* Área de preview */}
      <div ref={stageRef} className={isApparel ? 'flex-1 relative min-h-[420px] lg:min-h-[640px] flex items-center justify-center p-6' : 'relative aspect-square w-full flex items-center justify-center'}>
        {/* Modo 3D — rotação 360° por arraste */}
        {isApparel ? (
          <><ApparelPrintStage baseUrl={baseImage || productViews?.[side]} designImage={designImage} transform={transform} onChange={updateTransform} />
          {!baseImage && <button onClick={() => fileInputRef.current?.click()} disabled={isUploadingBase} className="absolute right-3 top-3 z-20 rounded-full bg-card px-3 py-2 text-xs text-foreground border border-border">Base própria</button>}</>
        ) : viewMode === '3d' ? (
          <div className="absolute inset-0">
            <MockupViewer3D
              productType={productType}
              designImage={designImage}
              productColor={color}
            />
          </div>
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
          <>
            <div className="absolute inset-0">{renderMockup?.(null)}</div>
            {designImage && (
              <div
                ref={designRef}
                className="absolute z-10 touch-none cursor-grab select-none active:cursor-grabbing"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerEnd}
                onPointerCancel={handlePointerEnd}
                style={{ left: `${50 + transform.x / 10}%`, top: `${50 + transform.y / 10}%`, width: '60%', height: '60%', transform: `translate(-50%, -50%) scale(${transform.scale}) rotate(${transform.rotation}deg)`, transformOrigin: 'center', willChange: 'transform' }}
              >
                <img src={designImage} alt="Estampa" draggable={false} className="h-full w-full select-none object-contain pointer-events-none" />
              </div>
            )}
            <button onClick={() => fileInputRef.current?.click()} disabled={isUploadingBase} className="absolute right-3 top-3 z-20 flex items-center gap-2 rounded-full border border-ceu-navy/15 bg-card/90 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-ceu-navy/60 shadow-sm" title="Usar foto própria do produto">
              <Upload className="h-3.5 w-3.5" /> Base própria
            </button>
          </>
        )}

        {/* Trocar peça base */}
        {baseImage && (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute top-2 right-2 z-20 w-9 h-9 rounded-xl bg-card/90 hover:bg-ceu-aqua flex items-center justify-center border border-ceu-navy/10 shadow-sm transition-colors"
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

      {/* Painel de controles — 4 sliders (apenas 2D) */}
      {viewMode === '2d' && designImage && (
        <div className="px-6 py-5 border-t border-ceu-navy/10 space-y-5">
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
                className="flex-1 h-10 px-3 rounded-xl bg-card border border-ceu-navy/15 text-sm text-ceu-navy placeholder:text-ceu-navy/35 focus:outline-none focus:border-ceu-aqua"
              />
              <button
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="h-10 px-4 rounded-xl border border-ceu-navy/15 hover:border-ceu-aqua hover:text-ceu-aqua text-ceu-navy/60 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
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