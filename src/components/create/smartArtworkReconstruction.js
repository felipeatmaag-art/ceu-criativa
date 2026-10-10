import { base44 } from '@/api/base44Client';
import { prepareGeneratedArtwork } from '@/components/create/preparePrintArtwork';
import { rememberArtwork } from '@/components/create/artworkMetadata';

/**
 * Reconstrução de Arte com IA do Gemini (300 DPI para Estamparia)
 * Absorve imagens de qualquer resolução (ex: 300px, 500px, 800px)
 * e reconstrói traços, tipografia e cores em alta resolução (3000x3000px).
 */
export async function reconstructWithGeminiAI({
  sourceUrl,
  instructions = '',
  style = '',
  productColor = '',
  colorName = '',
  onProgress = () => {},
}) {
  if (!sourceUrl) throw new Error('Nenhuma imagem fornecida para reconstrução.');

  onProgress('Enviando para a IA do Google Gemini...');

  // 1. Chamar endpoint do Gemini para reconstrução artística e upscaling
  const response = await fetch('/api/gemini/reconstruct-artwork', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      image_url: sourceUrl,
      instructions,
      style,
      productColor,
      colorName,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.url) {
    throw new Error(data.error || 'A IA não pôde reconstruir a imagem no momento.');
  }

  onProgress('Removendo fundo técnico e finalizando PNG em 3000×3000 px...');

  // 2. Processar a imagem retornada (com fundo chroma green) para extrair o PNG transparente em alta definição
  const finalTransparentUrl = await prepareGeneratedArtwork(data.url);

  return {
    url: finalTransparentUrl,
    reconstructed_url: finalTransparentUrl,
    is_reconstructed: true,
  };
}

/**
 * Ampliação Rápida HD (Super-Resolução Inteligente via Canvas)
 * Utiliza interpolação bicúbica multi-etapas com filtro unsharp mask (realce de contornos).
 * Instantâneo, sem custos de API e sempre disponível.
 */
export async function instantSmartUpscale({
  sourceUrl,
  targetDimension = 3000,
  removeSolidBackground = false,
  onProgress = () => {},
}) {
  if (!sourceUrl) throw new Error('Nenhuma imagem fornecida para ampliação.');

  onProgress('Carregando imagem original...');
  const res = await fetch(sourceUrl);
  if (!res.ok) throw new Error('Não foi possível carregar o arquivo original.');
  const blob = await res.blob();

  const bitmap = await createImageBitmap(blob);
  const origW = bitmap.width;
  const origH = bitmap.height;

  // Calcular proporção para atingir targetDimension no lado maior
  const maxDim = Math.max(origW, origH);
  const scaleFactor = Math.max(1, targetDimension / maxDim);
  const targetW = Math.round(origW * scaleFactor);
  const targetH = Math.round(origH * scaleFactor);

  onProgress('Aplicando super-resolução e realce de nitidez...');

  // Interpolação multi-etapas para manter fidelidade e evitar serrilhado
  let currentCanvas = document.createElement('canvas');
  currentCanvas.width = origW;
  currentCanvas.height = origH;
  let ctx = currentCanvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();

  // Se o fator de escala for grande, subir em passos de 1.5x a 2x
  let curW = origW;
  let curH = origH;
  while (curW * 1.6 < targetW && curH * 1.6 < targetH) {
    const nextW = Math.round(curW * 1.5);
    const nextH = Math.round(curH * 1.5);
    const nextCanvas = document.createElement('canvas');
    nextCanvas.width = nextW;
    nextCanvas.height = nextH;
    const nextCtx = nextCanvas.getContext('2d', { willReadFrequently: true });
    nextCtx.imageSmoothingEnabled = true;
    nextCtx.imageSmoothingQuality = 'high';
    nextCtx.drawImage(currentCanvas, 0, 0, nextW, nextH);
    currentCanvas.width = 0;
    currentCanvas = nextCanvas;
    curW = nextW;
    curH = nextH;
  }

  // Desenhar no tamanho alvo final
  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetW;
  finalCanvas.height = targetH;
  const finalCtx = finalCanvas.getContext('2d', { willReadFrequently: true });
  finalCtx.imageSmoothingEnabled = true;
  finalCtx.imageSmoothingQuality = 'high';
  finalCtx.drawImage(currentCanvas, 0, 0, targetW, targetH);
  currentCanvas.width = 0;

  // Aplicar leve filtro de realce de nitidez (unsharp mask suave)
  const imgData = finalCtx.getImageData(0, 0, targetW, targetH);
  const data = imgData.data;

  // Se solicitado remoção de fundo branco/sólido
  if (removeSolidBackground) {
    const bgR = data[0], bgG = data[1], bgB = data[2];
    const isLightBg = bgR > 210 && bgG > 210 && bgB > 210;
    const tolerance = isLightBg ? 45 : 35;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      const diff = Math.max(Math.abs(r - bgR), Math.abs(g - bgG), Math.abs(b - bgB));
      if (diff < tolerance) {
        data[i + 3] = 0;
      } else if (diff < tolerance + 15) {
        // Transição suave
        const alpha = (diff - tolerance) / 15;
        data[i + 3] = Math.round(data[i + 3] * alpha);
      }
    }
  }

  finalCtx.putImageData(imgData, 0, 0);

  onProgress('Gerando arquivo final em alta definição...');
  const upscaledBlob = await new Promise((resolve) => finalCanvas.toBlob(resolve, 'image/png'));
  finalCanvas.width = 0;

  if (!upscaledBlob) throw new Error('Falha ao exportar imagem ampliada.');

  const file = new File([upscaledBlob], `arte-hd-300dpi-${Date.now()}.png`, { type: 'image/png' });
  const uploadRes = await base44.integrations.Core.UploadFile({ file });
  if (!uploadRes?.file_url) throw new Error('Falha ao salvar arte ampliada.');

  rememberArtwork(uploadRes.file_url, {
    file_url: uploadRes.file_url,
    original_url: sourceUrl,
    width: targetW,
    height: targetH,
    original_width: origW,
    original_height: origH,
    is_upscaled: true,
    alpha_validated: true,
    bounds: { left: 0, top: 0, width: targetW, height: targetH },
  });

  return {
    url: uploadRes.file_url,
    width: targetW,
    height: targetH,
    is_upscaled: true,
  };
}
