import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ZoomIn, ZoomOut, RotateCw, Crosshair, Maximize2, Hand,
  FlipHorizontal2, Check,
} from 'lucide-react';

/**
 * Editor interativo de estampa — experiência premium touchscreen.
 *
 * Renderiza o mockup do produto (sem design) e sobrepõe a arte como camada
 * arrastável, redimensionável e rotacionável em tempo real.
 *
 * Recursos:
 *  - Arraste com Pointer Events (mouse + toque unificados)
 *  - Pinch-to-zoom com dois dedos (touchscreen)
 *  - Frente/verso para camisetas e moletons
 *  - Área de impressão com marcadores de canto elegantes (sem linha tracejada feia)
 *  - Guias de alinhamento snap ao centro
 *  - Controles com alvos de toque grandes para mobile
 */
const PRINT_AREAS = {
  camiseta:       { x: 38.5, y: 35.4, w: 22.9, h: 29.2 },
  moletom:        { x: 38.5, y: 35.4, w: 22.9, h: 29.2 },
  caneca:         { x: 26.4, y: 34.7, w: 33.3, h: 30.6 },
  caneca_termica: { x: 26.4, y: 34.7, w: 33.3, h: 30.6 },
  quadro:         { x: 17.6, y: 17.6, w: 64.7, h: 64.7 },
  mousepad:       { x: 15, y: 15, w: 70, h: 70 },
};

const HAS_BACK_SIDE = ['camiseta', 'moletom'];

// Marcador de canto (L-shaped bracket) para delinear a área de impressão
function CornerMarker({ position, side }) {
  const base = 'absolute w-4 h-4 pointer-events-none';
  const border = 'border-purple-500/70';
  const styles = {
    'top-left':     `${base} ${border} border-t-2 border-l-2 rounded-tl-md`,
    'top-right':    `${base} ${border} border-t-2 border-r-2 rounded-tr-md`,
    'bottom-left':  `${base} ${border} border-b-2 border-l-2 rounded-bl-md`,
    'bottom-right': `${base} ${border} border-b-2 border-r-2 rounded-br-md`,
  };
  return <div className={styles[position]} />;
}

export default function InteractiveMockupViewer({
  productType,
  designImage,
  color,
  renderMockup,
  transform,
  onTransformChange,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [side, setSide] = useState('front');

  // Estado de drag e pinch
  const dragState = useRef({ startX: 0, startY: 0, startTx: 0, startTy: 0 });
  const pointers = useRef(new Map()); // pointerId -> {x, y}
  const pinchState = useRef({ startDist: 0, startScale: 1 });

  const pa = PRINT_AREAS[productType] || PRINT_AREAS.camiseta;
  const isDark = color === 'black' || color === 'navy';
  const canFlip = HAS_BACK_SIDE.includes(productType);

  const setScale = useCallback((s) => {
    onTransformChange({ ...transform, scale: Math.max(0.3, Math.min(2.5, s)) });
  }, [transform, onTransformChange]);

  // --- Pointer handlers com pinch-to-zoom ---
  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    setHasInteracted(true);

    if (pointers.current.size === 1) {
      setIsDragging(true);
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        startTx: transform.x,
        startTy: transform.y,
      };
    } else if (pointers.current.size === 2) {
      // Iniciar pinch
      const pts = Array.from(pointers.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      pinchState.current = { startDist: dist, startScale: transform.scale };
      setIsDragging(false);
    }
  };

  const handlePointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size >= 2) {
      // Pinch-to-zoom
      const pts = Array.from(pointers.current.values());
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      if (pinchState.current.startDist > 0) {
        const ratio = dist / pinchState.current.startDist;
        setScale(pinchState.current.startScale * ratio);
      }
    } else if (isDragging) {
      // Arraste simples
      const dx = e.clientX - dragState.current.startX;
      const dy = e.clientY - dragState.current.startY;
      onTransformChange({
        ...transform,
        x: dragState.current.startTx + dx,
        y: dragState.current.startTy + dy,
      });
    }
  };

  const handlePointerUp = (e) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) {
      pinchState.current = { startDist: 0, startScale: 1 };
    }
    if (pointers.current.size === 1) {
      // Retomar arraste com o dedo restante
      const [pt] = Array.from(pointers.current.values());
      dragState.current = { startX: pt.x, startY: pt.y, startTx: transform.x, startTy: transform.y };
      setIsDragging(true);
    } else if (pointers.current.size === 0) {
      setIsDragging(false);
    }
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };

  // --- Controles ---
  const setRotation = (r) => onTransformChange({ ...transform, rotation: r });
  const center = () => onTransformChange({ ...transform, x: 0, y: 0 });
  const reset = () => onTransformChange({ x: 0, y: 0, scale: 1, rotation: 0 });

  // Guias de alinhamento (snap visual quando próximo ao centro)
  const isCenteredX = Math.abs(transform.x) < 6;
  const isCenteredY = Math.abs(transform.y) < 6;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Mockup do produto sem a estampa (passa o lado ativo) */}
      {renderMockup(side)}

      {designImage && (
        <>
          {/* Área de impressão — marcadores de canto elegantes + glow sutil */}
          <motion.div
            className="absolute pointer-events-none z-10"
            style={{ left: `${pa.x}%`, top: `${pa.y}%`, width: `${pa.w}%`, height: `${pa.h}%` }}
            animate={{ opacity: isDragging ? 1 : 0.45 }}
            transition={{ duration: 0.2 }}
          >
            {/* Glow de fundo da área de impressão */}
            <div
              className="absolute inset-0 rounded-lg"
              style={{
                background: 'radial-gradient(ellipse at center, rgba(168,85,247,0.06) 0%, transparent 70%)',
              }}
            />
            {/* Marcadores de canto */}
            <CornerMarker position="top-left" />
            <CornerMarker position="top-right" />
            <CornerMarker position="bottom-left" />
            <CornerMarker position="bottom-right" />
          </motion.div>

          {/* Guias de alinhamento */}
          <AnimatePresence>
            {isDragging && isCenteredX && (
              <motion.div
                className="absolute pointer-events-none w-px bg-purple-500/80 z-20"
                style={{ left: `${pa.x + pa.w / 2}%`, top: `${pa.y}%`, height: `${pa.h}%` }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              />
            )}
            {isDragging && isCenteredY && (
              <motion.div
                className="absolute pointer-events-none h-px bg-purple-500/80 z-20"
                style={{ left: `${pa.x}%`, top: `${pa.y + pa.h / 2}%`, width: `${pa.w}%` }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              />
            )}
          </AnimatePresence>

          {/* Camada da estampa (arrastável) */}
          <div
            className="absolute z-20 touch-none"
            style={{ left: `${pa.x}%`, top: `${pa.y}%`, width: `${pa.w}%`, height: `${pa.h}%` }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            <div className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing">
              <img
                src={designImage}
                draggable={false}
                alt="Estampa"
                className="select-none max-w-full max-h-full"
                style={{
                  transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale}) rotate(${transform.rotation}deg)`,
                  transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  filter: isDark ? 'brightness(1.08) contrast(1.05)' : 'none',
                  boxShadow: isDragging
                    ? '0 0 0 2px rgba(168,85,247,0.5), 0 8px 30px rgba(168,85,247,0.25)'
                    : '0 2px 12px rgba(0,0,0,0.08)',
                  borderRadius: '4px',
                }}
              />
            </div>
          </div>

          {/* Dica de arraste */}
          <AnimatePresence>
            {!hasInteracted && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              >
                <motion.div
                  className="bg-white/90 backdrop-blur px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Hand className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Arraste para posicionar</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Frente/Verso */}
          {canFlip && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40">
              <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-lg p-1 flex gap-1 border border-white/60">
                <button
                  onClick={() => setSide('front')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    side === 'front' ? 'ceu-gradient text-white shadow' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Frente
                </button>
                <button
                  onClick={() => setSide('back')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    side === 'back' ? 'ceu-gradient text-white shadow' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FlipHorizontal2 className="w-3 h-3" />
                  Verso
                </button>
              </div>
            </div>
          )}

          {/* Indicador de lado ativo (quando não pode flipar) */}
          {!canFlip && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40">
              <div className="bg-white/90 backdrop-blur-xl rounded-full shadow-lg px-4 py-1.5 border border-white/60">
                <span className="text-xs font-semibold text-gray-600">Frente</span>
              </div>
            </div>
          )}

          {/* Painel de controles — alvos de toque grandes para mobile */}
          <motion.div
            className="absolute bottom-3 left-3 right-3 z-40"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-3.5 space-y-3 border border-white/60">
              {/* Tamanho */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setScale(transform.scale - 0.1)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center transition-all shrink-0"
                >
                  <ZoomOut className="w-5 h-5 text-gray-600" />
                </button>
                <input
                  type="range" min="0.3" max="2.5" step="0.05"
                  value={transform.scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="flex-1 h-2 accent-purple-500 cursor-pointer"
                />
                <button
                  onClick={() => setScale(transform.scale + 0.1)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center transition-all shrink-0"
                >
                  <ZoomIn className="w-5 h-5 text-gray-600" />
                </button>
                <span className="text-xs font-semibold text-gray-500 w-11 text-right tabular-nums">
                  {Math.round(transform.scale * 100)}%
                </span>
              </div>

              {/* Rotação + Ações */}
              <div className="flex items-center gap-3">
                <RotateCw className="w-5 h-5 text-gray-400 ml-1 shrink-0" />
                <input
                  type="range" min="0" max="360" step="1"
                  value={transform.rotation}
                  onChange={(e) => setRotation(parseFloat(e.target.value))}
                  className="flex-1 h-2 accent-purple-500 cursor-pointer"
                />
                <button
                  onClick={center}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center transition-all shrink-0"
                  title="Centralizar"
                >
                  <Crosshair className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={reset}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 active:scale-95 flex items-center justify-center transition-all shrink-0"
                  title="Resetar"
                >
                  <Maximize2 className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}