import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Zap,
  Scissors,
  RefreshCw,
  AlertCircle,
  Upload,
  FolderOpen,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { reconstructWithGeminiAI, instantSmartUpscale } from './smartArtworkReconstruction';

export default function AIReconstructionCard({
  sourceUrl,
  metadata,
  editorSide = 'front',
  productColor = '',
  colorName = '',
  onReconstructSuccess,
  onDismiss,
  onUploadArtwork,
  isUploading = false,
}) {
  const [isBusy, setIsBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('fidelity');
  const [removeBg, setRemoveBg] = useState(metadata?.hasSolidBackground || false);
  const fileInputRef = useRef(null);

  const width = metadata?.width || 800;
  const height = metadata?.height || 800;
  const isSmall = width < 2400 || height < 2400;

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onUploadArtwork) {
      onUploadArtwork(file);
    }
    e.target.value = '';
  };

  // Reconstrução via Gemini
  const handleGeminiReconstruct = async () => {
    if (!sourceUrl) {
      setError('Por favor, insira uma imagem primeiro clicando no botão "Inserir Imagem".');
      return;
    }
    setIsBusy(true);
    setError('');
    setStatusMessage('Iniciando IA do Gemini para reconstrução...');

    try {
      let instructions = 'Preserve todos os elementos visuais, textos e detalhes originais da arte do artista.';
      if (selectedStyle === 'vector') {
        instructions += ' Destaque traços vetoriais ultra-nítidos, curvas limpas e cores sólidas sem ruídos.';
      } else if (selectedStyle === 'vibrant') {
        instructions += ' Aumente a vivacidade das cores e o contraste para impacto máximo na estampa têxtil.';
      }

      const result = await reconstructWithGeminiAI({
        sourceUrl,
        instructions,
        style: selectedStyle,
        productColor,
        colorName,
        onProgress: (msg) => setStatusMessage(msg),
      });

      if (onReconstructSuccess) {
        onReconstructSuccess(result.url, {
          reconstructed: true,
          method: 'gemini-ai',
          width: 3000,
          height: 3000,
        });
      }
    } catch (err) {
      console.error('Erro na reconstrução com Gemini:', err);
      setError(err.message || 'Não foi possível reconstruir com IA. Tente a ampliação instantânea HD!');
    } finally {
      setIsBusy(false);
      setStatusMessage('');
    }
  };

  // Ampliação rápida HD via Canvas
  const handleInstantUpscale = async () => {
    if (!sourceUrl) {
      setError('Por favor, insira uma imagem primeiro clicando no botão "Inserir Imagem".');
      return;
    }
    setIsBusy(true);
    setError('');
    setStatusMessage('Ampliando imagem para 3000×3000 px em alta resolução...');

    try {
      const result = await instantSmartUpscale({
        sourceUrl,
        targetDimension: 3000,
        removeSolidBackground: removeBg,
        onProgress: (msg) => setStatusMessage(msg),
      });

      if (onReconstructSuccess) {
        onReconstructSuccess(result.url, {
          reconstructed: true,
          method: 'smart-upscale',
          width: result.width,
          height: result.height,
        });
      }
    } catch (err) {
      console.error('Erro na ampliação HD:', err);
      setError(err.message || 'Erro ao processar imagem.');
    } finally {
      setIsBusy(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="rounded-3xl border-2 border-purple-300 bg-gradient-to-br from-purple-50/90 via-white to-pink-50/70 p-5 sm:p-6 shadow-lg shadow-purple-500/10">
      {/* Input de arquivo oculto acionado pelos botões */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*,image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-purple-100">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-md shadow-purple-500/25 shrink-0">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 flex items-center gap-2 text-base sm:text-lg">
              IA de Reconstrução & Ultra Definição
              <span className="rounded-full bg-purple-100 text-purple-800 border border-purple-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                300 DPI
              </span>
            </h4>
            <p className="text-xs text-slate-600 mt-0.5">
              Reconstrói e amplia artes de qualquer tamanho para impressão DTF nítida sem serrilhado.
            </p>
          </div>
        </div>

        {sourceUrl && (
          <div className="rounded-xl border border-purple-200 bg-white/95 px-3 py-1.5 text-right backdrop-blur shadow-xs shrink-0">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Resolução Atual</span>
            <span className={`text-xs font-mono font-bold ${isSmall ? 'text-amber-600' : 'text-emerald-600'}`}>
              {width} × {height} px
            </span>
          </div>
        )}
      </div>

      {/* ÁREA DA IMAGEM DO ARTISTA (INSERIR / TROCAR / PRÉ-VISUALIZAR) */}
      <div className="mt-4">
        {sourceUrl ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-purple-200/90 shadow-sm">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="relative w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:8px_8px] shrink-0 shadow-xs">
                <img
                  src={sourceUrl}
                  alt="Arte do artista"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-slate-900">
                    Arte do Artista ({editorSide === 'front' ? 'Frente' : 'Costas'})
                  </span>
                  <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Carregada
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Dimensão: <strong className="text-slate-800">{width} × {height} px</strong> • Destino: <strong className="text-purple-700">3000 × 3000 px (300 DPI)</strong>
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isBusy || isUploading}
              className="rounded-xl border-purple-300 text-purple-700 bg-purple-50/50 hover:bg-purple-100 hover:text-purple-900 text-xs font-bold shrink-0 h-9"
            >
              <FolderOpen className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
              Inserir Outra Imagem
            </Button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer border-2 border-dashed border-purple-300 hover:border-purple-500 rounded-2xl p-6 text-center bg-white/70 hover:bg-purple-50/40 transition-all shadow-xs"
          >
            <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-900">
              Clique aqui para Inserir a Imagem do Artista
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Selecione o arquivo da sua arte (PNG, JPG, WEBP) para reconstruir em 300 DPI
            </p>
            <Button
              type="button"
              size="sm"
              className="mt-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Selecionar Imagem do Dispositivo
            </Button>
          </div>
        )}
      </div>

      {/* Opções de Ajuste e Estilo */}
      <div className="mt-4 rounded-2xl bg-white/95 p-3.5 border border-purple-100 space-y-3 shadow-xs">
        {isSmall && sourceUrl && (
          <div className="flex items-center gap-2 text-xs text-amber-900 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Resolução detectada abaixo de 2400px. Reconstruir garante que a estampa DTF não fique pixelizada na peça física.
            </span>
          </div>
        )}

        {/* Opções de estilo de reconstrução */}
        <div>
          <span className="text-xs font-bold text-slate-700 block mb-2">
            Modo de Reconstrução Artística da IA:
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedStyle('fidelity')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedStyle === 'fidelity'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
              }`}
            >
              🎯 Fidelidade Máxima ao Original
            </button>
            <button
              type="button"
              onClick={() => setSelectedStyle('vector')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedStyle === 'vector'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
              }`}
            >
              ⚡ Traços Vetoriais Nítidos
            </button>
            <button
              type="button"
              onClick={() => setSelectedStyle('vibrant')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                selectedStyle === 'vibrant'
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
              }`}
            >
              🎨 Cores Vivas & Contraste Têxtil
            </button>
          </div>
        </div>

        {/* Toggle de remoção de fundo */}
        {metadata?.hasSolidBackground && (
          <label className="flex items-center gap-2 cursor-pointer pt-1 text-xs text-slate-800">
            <input
              type="checkbox"
              checked={removeBg}
              onChange={(e) => setRemoveBg(e.target.checked)}
              className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
            />
            <span className="font-semibold flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-purple-600" />
              Remover fundo sólido ao redor da arte (deixar transparente para DTF)
            </span>
          </label>
        )}

        {/* Mensagem de progresso */}
        {(isBusy || isUploading) && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold animate-pulse">
            <RefreshCw className="w-4 h-4 animate-spin text-purple-600" />
            <span>{statusMessage || (isUploading ? 'Carregando arquivo do artista...' : 'Processando reconstrução de imagem...')}</span>
          </div>
        )}

        {error && (
          <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="mt-4 flex flex-col sm:flex-row gap-2.5">
        <Button
          type="button"
          onClick={handleGeminiReconstruct}
          disabled={isBusy || isUploading || !sourceUrl}
          className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl h-11 text-xs font-bold shadow-md shadow-purple-600/20"
        >
          {isBusy ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Reconstruindo com Gemini...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Reconstruir com IA (300 DPI)
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleInstantUpscale}
          disabled={isBusy || isUploading || !sourceUrl}
          className="rounded-2xl border-purple-300 text-purple-700 hover:bg-purple-50 h-11 text-xs font-bold"
        >
          <Zap className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
          Ampliação Rápida HD
        </Button>

        {onDismiss && (
          <Button
            type="button"
            variant="ghost"
            onClick={onDismiss}
            disabled={isBusy || isUploading}
            className="rounded-2xl text-slate-500 hover:text-slate-800 h-11 text-xs"
          >
            Manter como está
          </Button>
        )}
      </div>
    </div>
  );
}
