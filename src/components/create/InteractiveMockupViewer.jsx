import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCw, Maximize2, Crosshair, Hand } from 'lucide-react';

/**
 * Editor interativo de estampa.
 * Renderiza o mockup do produto (sem design) e sobrepõe a arte como camada
 * arrastável, redimensionável e rotacionável em tempo real.
 *
 * Áreas de impressão calibradas a partir das coordenadas SVG de cada mockup
 * dentro de um container aspect-square com preserveAspectRatio=xMidYMid meet.
 */
const PRINT_AREAS = {
  camiseta:       { x: 38.5, y: 35.4, w: 22.9, h: 29.2 },
  moletom:        { x: 38.5, y: 35.4, w: 22.9, h: 29.2 },
  caneca:         { x: 26.4, y: 34.7, w: 33.3, h: 30.6 },
  caneca_termica: { x: 26.4, y: 34.7, w: 33.3, h: 30.6 },
  quadro:         { x: 17.6, y: 17.6, w: 64.7, h: 64.7 },
  mousepad:       { x: 15, y: 15, w: 70, h: 70 },
};

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
  const dragState = useRef({ startX: 0, startY: 0, startTx: 0, startTy: 0 });

  const pa = PRINT_AREAS[productType] || PRINT_AREAS.camiseta;
  const isDark = color === 'black' || color === 'navy';

  // --- Drag handlers (mouse + touch unificados via Pointer Events) ---
  const handlePointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    setHasInteracted(true);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTx: transform.x,
      startTy: transform.y,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragState.current.startX;
    const dy = e.clientY - dragState.current.startY;
    onTransformChange({
      ...transform,
      x: dragState.current.startTx + dx,
      y: dragState.current.startTy + dy,
    });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    try { e.currentTarget.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };

  // --- Controles ---
  const setScale = (s) => onTransformChange({ ...transform, scale: Math.max(0.3, Math.min(2.5, s)) });
  const setRotation = (r) => onTransformChange({ ...transform, rotation: r });
  const center = () => onTransformChange({ ...transform, x: 0, y: 0 });
  const reset = () => onTransformChange({ x: 0, y: 0, scale: 1, rotation: 0 });

  // Guias de alinhamento (snap visual quando próximo ao centro)
  const isCenteredX = Math.abs(transform.x) < 6;
  const isCenteredY = Math.abs(transform.y) < 6;

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Mockup do produto sem a estampa */}
      {renderMockup()}

      {designImage && (
        <>
          {/* Borda da área de impressão */}
          <motion.div
            className="absolute pointer-events-none border-2 border-dashed border-purple-400/50 rounded-lg z-10"
            style={{ left: `${pa.x}%`, top: `${pa.y}%`, width: `${pa.w}%`, height: `${pa.h}%` }}
            animate={{ opacity: isDragging ? 1 : 0.25 }}
          />

          {/* Guias de alinhamento */}
          <AnimatePresence>
            {isDragging && isCenteredX && (
              <motion.div
                className="absolute pointer-events-none w-px bg-purple-500 z-20"
                style={{ left: `${pa.x + pa.w / 2}%`, top: `${pa.y}%`, height: `${pa.h}%` }}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              />
            )}
            {isDragging && isCenteredY && (
              <motion.div
                className="absolute pointer-events-none h-px bg-purple-500 z-20"
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
                  boxShadow: isDragging ? '0 0 0 2px rgba(168,85,247,0.6), 0 0 20px rgba(168,85,247,0.3)' : 'none',
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
                  className="bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Hand className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Arraste para posicionar</span>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Painel de controles */}
          <motion.div
            className="absolute bottom-3 left-3 right-3 z-40"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl p-3 space-y-2.5 border border-white/60">
              {/* Tamanho */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setScale(transform.scale - 0.1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
                >
                  <ZoomOut className="w-4 h-4 text-gray-600" />
                </button>
                <input
                  type="range" min="0.3" max="2.5" step="0.05"
                  value={transform.scale}
                  onChange={(e) => setScale(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500 cursor-pointer"
                />
                <button
                  onClick={() => setScale(transform.scale + 0.1)}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
                >
                  <ZoomIn className="w-4 h-4 text-gray-600" />
                </button>
                <span className="text-xs font-semibold text-gray-500 w-10 text-right tabular-nums">
                  {Math.round(transform.scale * 100)}%
                </span>
              </div>

              {/* Rotação + Ações */}
              <div className="flex items-center gap-2">
                <RotateCw className="w-4 h-4 text-gray-400 ml-1 shrink-0" />
                <input
                  type="range" min="0" max="360" step="1"
                  value={transform.rotation}
                  onChange={(e) => setRotation(parseFloat(e.target.value))}
                  className="flex-1 h-1.5 accent-purple-500 cursor-pointer"
                />
                <button
                  onClick={center}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
                  title="Centralizar"
                >
                  <Crosshair className="w-4 h-4 text-gray-600" />
                </button>
                <button
                  onClick={reset}
                  className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
                  title="Resetar"
                >
                  <Maximize2 className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}