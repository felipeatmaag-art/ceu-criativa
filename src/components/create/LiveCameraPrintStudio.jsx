import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  Check,
  RotateCcw,
  Upload,
  Loader2,
  Wand2,
  FlipHorizontal,
  Scissors
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { prepareGeneratedArtwork } from '@/components/create/preparePrintArtwork';

const CAMERA_STYLES = [
  {
    id: 'vector_pop',
    name: 'Vetor Pop Art & Decalque',
    desc: 'Transforma sua foto em ilustração vetorial nítida com linhas fortes de estampa.',
    promptSuffix: 'Pure standalone 2D vector graphic design decal sticker, isolated screenprint graphic illustration, sharp clean crisp contour edges, pop-art vector aesthetic, centered on solid flat vibrant green background #00FF00.'
  },
  {
    id: 'streetwear',
    name: 'Arte Urbana & Streetwear',
    desc: 'Estilo serigrafia contemporânea de alta energia, alto contraste e traços urbanos.',
    promptSuffix: 'Modern streetwear screenprint illustration decal, sharp graphic lines, high contrast bold artistic interpretation of the subject, centered on solid flat vibrant green background #00FF00.'
  },
  {
    id: 'cartoon_sticker',
    name: 'Adesivo Cartoon Autoral',
    desc: 'Estilo sticker/adesivo autoral com traço cartoon limpo e contorno de destaque.',
    promptSuffix: 'Expressive cartoon character sticker decal, bold thick clean outlines, colorful graphic design, centered on solid flat vibrant green background #00FF00.'
  },
  {
    id: 'retro_vintage',
    name: 'Serigrafia Vintage / Retrô',
    desc: 'Visual clássico de estamparia vintage com linhas duo-tone e textura suave.',
    promptSuffix: 'Vintage retro screenprint linework graphic decal, classic duo-tone apparel artwork, high-contrast clean contours, centered on solid flat vibrant green background #00FF00.'
  },
  {
    id: 'photo_cutout',
    name: 'Foto Direta com Fundo Limpo',
    desc: 'Preserva os detalhes reais da foto recortando perfeitamente o fundo para a camiseta.',
    promptSuffix: 'High resolution standalone isolated photographic cutout decal sticker of the subject, clean edges, crisp transparent foreground subject, centered on solid flat vibrant green background #00FF00.'
  }
];

export default function LiveCameraPrintStudio({
  onArtworkSelected,
  productType = 'camiseta',
  productColor = 'white',
  disabled = false
}) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [facingMode, setFacingMode] = useState('user'); // 'user' (selfie) ou 'environment' (traseira)
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [selectedStyle, setSelectedStyle] = useState(CAMERA_STYLES[0]);
  const [customInstructions, setCustomInstructions] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Iniciar stream de vídeo ao vivo
  const startCamera = async (mode = facingMode) => {
    setCameraError('');
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada diretamente neste navegador. Use a captura por arquivo abaixo.');
      }

      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1080 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.warn('Erro ao acessar webcam:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Permissão de câmera negada. Você pode permitir no navegador ou tirar foto pelo botão de captura nativa abaixo.'
          : 'Não foi possível abrir a câmera ao vivo. Use o botão de captura do celular abaixo.'
      );
      setCameraActive(false);
    }
  };

  // Parar stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Alternar entre Câmera Frontal e Traseira
  const toggleFacingMode = () => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capturar foto do vídeo ao vivo
  const takeSnapshot = () => {
    if (!videoRef.current) return;

    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      const size = Math.min(video.videoWidth || 640, video.videoHeight || 640);
      canvas.width = size;
      canvas.height = size;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Centralizar e recortar em quadrado 1:1 perfeito para a estampa
      const startX = ((video.videoWidth || size) - size) / 2;
      const startY = ((video.videoHeight || size) - size) / 2;

      // Se for selfie (user), espelha horizontalmente para parecer espelho
      if (facingMode === 'user') {
        ctx.translate(size, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, startX, startY, size, size, 0, 0, size, size);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      setCapturedPhoto(dataUrl);
      stopCamera();
    } catch (err) {
      console.error('Erro ao capturar frame:', err);
      setErrorMessage('Falha ao tirar a foto. Tente novamente.');
    }
  };

  // Captura via input nativo do celular (fallback e atalho móvel)
  const handleNativeCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setCapturedPhoto(event.target.result);
      stopCamera();
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Retirar foto e reabrir câmera
  const retakePhoto = () => {
    setCapturedPhoto(null);
    setErrorMessage('');
    startCamera(facingMode);
  };

  // Transformar Foto em Estampa DTF com IA Gemini
  const handleGeneratePrintFromPhoto = async () => {
    if (!capturedPhoto || isProcessing || disabled) return;

    setIsProcessing(true);
    setErrorMessage('');
    setProcessingStep('Analisando foto com IA Gemini...');

    try {
      const isDarkFabric = /black|preto|preta|navy|marinho|dark|escuro|escura|chumbo|militar/i.test(productColor);

      let fullPrompt = `Transform the primary subject from this reference photo into a ${selectedStyle.promptSuffix}`;
      if (customInstructions.trim()) {
        fullPrompt += ` Additional styling request: ${customInstructions.trim()}.`;
      }
      if (isDarkFabric) {
        fullPrompt += '\n\nColor Contrast: High-contrast bright vivid palette (pure white, bright highlights, bold tones) calibrated to pop brilliantly on dark fabric.';
      }

      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          existing_image_urls: [capturedPhoto],
          aspectRatio: '1:1',
          productType,
          productColor,
          colorName: productColor
        })
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error || `Erro ${res.status} ao gerar estampa da foto.`);
      }

      const data = await res.json();
      if (!data?.url) {
        throw new Error('A IA não retornou o arquivo da estampa. Tente novamente.');
      }

      setProcessingStep('Removendo fundo e gerando PNG de alta definição...');
      const processedPngUrl = await prepareGeneratedArtwork(data.url);

      if (onArtworkSelected) {
        onArtworkSelected(processedPngUrl, {
          prompt: `Foto transformada (${selectedStyle.name}): ${customInstructions || 'Autoral'}`,
          style: selectedStyle.name,
          source: 'camera'
        });
      }

      setProcessingStep('✓ Estampa aplicada com sucesso na peça!');
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStep('');
      }, 1500);

    } catch (err) {
      console.error('Erro ao gerar estampa da foto:', err);
      setErrorMessage(err.message || 'Falha ao transformar a foto em estampa. Tente novamente.');
      setIsProcessing(false);
    }
  };

  // Usar a foto diretamente como estampa (removendo fundo)
  const handleUsePhotoDirectly = async () => {
    if (!capturedPhoto || isProcessing || disabled) return;

    setIsProcessing(true);
    setErrorMessage('');
    setProcessingStep('Preparando foto para estampar...');

    try {
      const processedPngUrl = await prepareGeneratedArtwork(capturedPhoto);
      if (onArtworkSelected) {
        onArtworkSelected(processedPngUrl, {
          prompt: 'Foto autoral capturada na câmera',
          style: 'Fotográfico',
          source: 'camera'
        });
      }
      setProcessingStep('✓ Foto aplicada na camiseta!');
      setTimeout(() => {
        setIsProcessing(false);
        setProcessingStep('');
      }, 1000);
    } catch (err) {
      console.error(err);
      setErrorMessage('Falha ao processar a foto. Tente novamente.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 rounded-3xl bg-white p-5 border border-slate-200/90 shadow-sm text-slate-900">
      
      {/* Cabeçalho da Câmera */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Tirar Foto &amp; Gerar Estampa
              </h3>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-[10px] font-black">
                INOVAÇÃO
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Tire uma foto sua, do seu pet ou de qualquer objeto e transforme em estampa na hora!
            </p>
          </div>
        </div>

        {capturedPhoto && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={retakePhoto}
            className="text-xs text-slate-500 hover:text-purple-600 font-bold gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Tirar Outra
          </Button>
        )}
      </div>

      {/* ÁREA DE VISUALIZAÇÃO: CÂMERA AO VIVO OU FOTO CONGELADA */}
      <div className="relative aspect-square max-h-[380px] w-full max-w-[380px] mx-auto rounded-3xl bg-slate-950 overflow-hidden flex items-center justify-center shadow-inner border border-slate-800">
        
        {capturedPhoto ? (
          /* Foto Capturada Congelada */
          <div className="relative w-full h-full">
            <img
              src={capturedPhoto}
              alt="Foto capturada"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1.5 border border-white/20">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Foto Pronta
            </div>
          </div>
        ) : cameraActive ? (
          /* Vídeo ao Vivo da Câmera */
          <div className="relative w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Alternador de Câmera Frontal / Traseira */}
            <button
              type="button"
              onClick={toggleFacingMode}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md border border-white/20 shadow-lg active:scale-95 transition-all"
              title="Alternar câmera frontal / traseira"
            >
              <FlipHorizontal className="w-5 h-5" />
            </button>

            {/* Botão Disparador */}
            <div className="absolute bottom-4 inset-x-0 flex items-center justify-center">
              <button
                type="button"
                onClick={takeSnapshot}
                className="w-16 h-16 rounded-full bg-white border-4 border-purple-600 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
                title="Tirar Foto Agora"
              >
                <div className="w-11 h-11 rounded-full bg-purple-600" />
              </button>
            </div>
          </div>
        ) : (
          /* Tela Inicial / Sem Câmera Ativa */
          <div className="text-center p-6 space-y-4 text-white">
            <div className="w-16 h-16 rounded-full bg-white/10 mx-auto flex items-center justify-center border border-white/15">
              <Camera className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Pronto para fotografar?</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                Ative sua câmera para tirar uma selfie ou apontar para algo legal que você quer ver estampado.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
              <Button
                type="button"
                onClick={() => startCamera(facingMode)}
                className="rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs h-11 px-5 shadow-lg shadow-purple-600/30 gap-1.5"
              >
                <Camera className="w-4 h-4" />
                Abrir Câmera ao Vivo
              </Button>

              <label className="rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 text-white font-bold text-xs h-11 px-4 inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all">
                <Upload className="w-4 h-4" />
                Tirar com Câmera do Celular
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleNativeCapture}
                  className="hidden"
                />
              </label>
            </div>

            {cameraError && (
              <p className="text-xs text-amber-300 font-medium max-w-xs mx-auto pt-2">
                {cameraError}
              </p>
            )}
          </div>
        )}

      </div>

      {/* CONTROLES APÓS A FOTO SER TIRADA */}
      {capturedPhoto && (
        <div className="space-y-4 pt-2">
          
          {/* Seletor de Estilos de Transformação */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-purple-600" />
              Escolha o Estilo Artístico para transformar sua foto:
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {CAMERA_STYLES.map((style) => {
                const isSelected = selectedStyle.id === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50/70 ring-1 ring-purple-600 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-extrabold text-slate-900">{style.name}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{style.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instruções Adicionais Opcionais */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-slate-800">
              Detalhes Extras (Opcional):
            </Label>
            <Input
              type="text"
              placeholder="Ex: adicione óculos escuros, cores neon vibrantes, estilo grafite..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              className="h-10 rounded-xl bg-slate-50 border-slate-200 text-xs text-slate-900"
              disabled={isProcessing}
            />
          </div>

          {/* Feedback de Processamento / Erro */}
          {processingStep && (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
              <span>{processingStep}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
              {errorMessage}
            </div>
          )}

          {/* Botões de Ação */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            <Button
              type="button"
              disabled={isProcessing || disabled}
              onClick={handleGeneratePrintFromPhoto}
              className="h-13 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Transformando com IA...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Gerar Estampa da Foto</span>
                </>
              )}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={isProcessing || disabled}
              onClick={handleUsePhotoDirectly}
              className="h-13 rounded-2xl border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs flex items-center justify-center gap-2"
            >
              <Scissors className="w-4 h-4 text-emerald-600" />
              <span>Estampar Foto Direta (Sem IA)</span>
            </Button>
          </div>

        </div>
      )}

    </div>
  );
}
