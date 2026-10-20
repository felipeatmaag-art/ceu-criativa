import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  RotateCcw, 
  RotateCw, 
  Crosshair, 
  Maximize2, 
  Minimize2
} from 'lucide-react';

/**
 * FloatingMockupControls
 * Painel transparente e flutuante sobreposto nas laterais do produto (mockup)
 * Permite movimentar para cima, baixo, lados, rotacionar e dar zoom na estampa com visão direta da peça.
 */
export default function FloatingMockupControls({
  transform = { x: 0, y: 0, scale: 1, rotation: 0 },
  onTransformChange,
  side = 'front',
  onSideChange,
  isApparel = true,
  hasFront = true,
  hasBack = false,
  className = ''
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [quickPos, setQuickPos] = useState('');
  const intervalRef = useRef(null);

  // Helper para atualizar parcialmente a transformação
  const update = (patch) => {
    if (!onTransformChange) return;
    const next = { ...transform, ...patch };
    onTransformChange(next);
  };

  // Movimentação por passos
  const moveX = (delta) => {
    update({ x: Math.max(-200, Math.min(200, (transform.x || 0) + delta)) });
  };

  const moveY = (delta) => {
    update({ y: Math.max(-200, Math.min(200, (transform.y || 0) + delta)) });
  };

  const changeScale = (delta) => {
    const currentScale = transform.scale || 1;
    const nextScale = Math.max(0.2, Math.min(2.5, +(currentScale + delta).toFixed(2)));
    update({ scale: nextScale });
  };

  const rotate = (delta) => {
    const nextRot = ((transform.rotation || 0) + delta) % 360;
    update({ rotation: nextRot });
  };

  const centerAll = () => {
    update({ x: 0, y: 0, rotation: 0 });
    setQuickPos('center');
    setTimeout(() => setQuickPos(''), 1500);
  };

  // Posicionamento no peito esquerdo (logo clássico)
  const setChestLeft = () => {
    update({ x: -45, y: -45, scale: 0.55 });
    setQuickPos('chest');
    setTimeout(() => setQuickPos(''), 1500);
  };

  // Suporte a clique longo / segurar botão para movimento fluido
  const startContinuous = (action) => {
    action();
    intervalRef.current = setInterval(action, 90);
  };

  const stopContinuous = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopContinuous();
  }, []);

  const scalePercent = Math.round((transform.scale || 1) * 100);

  return (
    <div 
      className={`absolute right-3 top-1/2 -translate-y-1/2 z-20 flex flex-col items-end pointer-events-auto select-none transition-all ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* PAINEL COMPACTO TRANSLÚCIDO COM BLUR */}
      <div className="bg-slate-950/70 hover:bg-slate-950/85 backdrop-blur-md border border-white/20 text-white rounded-2xl shadow-2xl p-2 sm:p-2.5 flex flex-col items-center gap-2 transition-all">
        {/* Cabeçalho do Painel com Botão de Minimizar */}
        <div className="w-full flex items-center justify-between gap-1 pb-1 border-b border-white/10 text-[10px] font-bold tracking-wider text-slate-300">
          <span className="hidden sm:inline-block px-1 uppercase text-slate-400">
            Ajustar
          </span>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title={isCollapsed ? 'Expandir painel' : 'Minimizar painel'}
          >
            {isCollapsed ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!isCollapsed ? (
          <>
            {/* TOGGLE FRENTE / COSTAS SE FOR VESTUÁRIO */}
            {isApparel && onSideChange && (
              <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded-xl border border-white/10 text-[10px] font-bold">
                <button
                  type="button"
                  onClick={() => onSideChange('front')}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    side === 'front' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Ajustar estampa na Frente"
                >
                  Frente {hasFront && '✓'}
                </button>
                <button
                  type="button"
                  onClick={() => onSideChange('back')}
                  className={`px-2 py-1 rounded-lg transition-all ${
                    side === 'back' 
                      ? 'bg-purple-600 text-white shadow-sm' 
                      : 'text-slate-300 hover:text-white'
                  }`}
                  title="Ajustar estampa nas Costas"
                >
                  Costas {hasBack && '✓'}
                </button>
              </div>
            )}

            {/* D-PAD TRANSLÚCIDO: CIMA, BAIXO, ESQUERDA, DIREITA, CENTRO */}
            <div className="flex flex-col items-center gap-1 py-1">
              {/* Botão CIMA */}
              <button
                type="button"
                onMouseDown={() => startContinuous(() => moveY(-10))}
                onMouseUp={stopContinuous}
                onMouseLeave={stopContinuous}
                onTouchStart={() => startContinuous(() => moveY(-10))}
                onTouchEnd={stopContinuous}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 active:bg-purple-600 border border-white/15 flex items-center justify-center text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Mover Estampa para CIMA (segure para mover contínuo)"
                aria-label="Mover para Cima"
              >
                <ChevronUp className="w-5 h-5" />
              </button>

              {/* Linha Central: ESQUERDA, CENTRO, DIREITA */}
              <div className="flex items-center gap-1">
                {/* Botão ESQUERDA */}
                <button
                  type="button"
                  onMouseDown={() => startContinuous(() => moveX(-10))}
                  onMouseUp={stopContinuous}
                  onMouseLeave={stopContinuous}
                  onTouchStart={() => startContinuous(() => moveX(-10))}
                  onTouchEnd={stopContinuous}
                  className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 active:bg-purple-600 border border-white/15 flex items-center justify-center text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                  title="Mover Estampa para a ESQUERDA"
                  aria-label="Mover para a Esquerda"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Botão CENTRALIZAR */}
                <button
                  type="button"
                  onClick={centerAll}
                  className="w-8 h-8 rounded-xl bg-purple-600/80 hover:bg-purple-600 border border-purple-400/40 flex items-center justify-center text-white transition-all shadow-sm active:scale-90 cursor-pointer"
                  title="Centralizar Estampa no Peito"
                  aria-label="Centralizar Estampa"
                >
                  <Crosshair className="w-4 h-4" />
                </button>

                {/* Botão DIREITA */}
                <button
                  type="button"
                  onMouseDown={() => startContinuous(() => moveX(10))}
                  onMouseUp={stopContinuous}
                  onMouseLeave={stopContinuous}
                  onTouchStart={() => startContinuous(() => moveX(10))}
                  onTouchEnd={stopContinuous}
                  className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 active:bg-purple-600 border border-white/15 flex items-center justify-center text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                  title="Mover Estampa para a DIREITA"
                  aria-label="Mover para a Direita"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Botão BAIXO */}
              <button
                type="button"
                onMouseDown={() => startContinuous(() => moveY(10))}
                onMouseUp={stopContinuous}
                onMouseLeave={stopContinuous}
                onTouchStart={() => startContinuous(() => moveY(10))}
                onTouchEnd={stopContinuous}
                className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 active:bg-purple-600 border border-white/15 flex items-center justify-center text-white transition-all shadow-sm active:scale-95 cursor-pointer"
                title="Mover Estampa para BAIXO"
                aria-label="Mover para Baixo"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>

            {/* SEPARADOR SUTIL */}
            <div className="w-full h-px bg-white/10" />

            {/* CONTROLES DE ZOOM / TAMANHO */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeScale(-0.05)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:bg-purple-600 flex items-center justify-center text-white transition-all cursor-pointer"
                title="Diminuir Estampa (-5%)"
                aria-label="Diminuir Tamanho"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <span className="text-[10px] font-mono font-bold text-slate-300 w-9 text-center">
                {scalePercent}%
              </span>

              <button
                type="button"
                onClick={() => changeScale(0.05)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:bg-purple-600 flex items-center justify-center text-white transition-all cursor-pointer"
                title="Aumentar Estampa (+5%)"
                aria-label="Aumentar Tamanho"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* CONTROLES DE GIRO / ROTAÇÃO */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => rotate(-15)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:bg-purple-600 flex items-center justify-center text-white transition-all cursor-pointer"
                title="Girar para Esquerda (-15°)"
                aria-label="Girar Esquerda"
              >
                <RotateCcw className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => update({ rotation: 0 })}
                className="text-[9px] font-mono text-slate-400 hover:text-white px-1 py-0.5 rounded hover:bg-white/10 transition-colors"
                title="Resetar rotação para 0°"
              >
                {Math.round(transform.rotation || 0)}°
              </button>

              <button
                type="button"
                onClick={() => rotate(15)}
                className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:bg-purple-600 flex items-center justify-center text-white transition-all cursor-pointer"
                title="Girar para Direita (+15°)"
                aria-label="Girar Direita"
              >
                <RotateCw className="w-3 h-3" />
              </button>
            </div>

            {/* BOTÃO RÁPIDO: PEITO ESQUERDO */}
            <div className="pt-1 w-full flex flex-col gap-1">
              <button
                type="button"
                onClick={setChestLeft}
                className="w-full py-1 px-1.5 rounded-lg bg-white/10 hover:bg-purple-600/60 text-[9px] font-bold text-slate-200 hover:text-white transition-all text-center cursor-pointer"
                title="Posicionar como logotipo no peito esquerdo"
              >
                Peito Esq.
              </button>
            </div>
          </>
        ) : (
          /* MODO MINIMIZADO: APENAS ÍCONES ESSENCIAIS */
          <div className="flex flex-col items-center gap-2 py-1">
            <button
              type="button"
              onClick={() => moveY(-15)}
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
              title="Subir"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => moveY(15)}
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
              title="Descer"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={centerAll}
              className="w-7 h-7 rounded-lg bg-purple-600/80 hover:bg-purple-600 flex items-center justify-center text-white"
              title="Centralizar"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
