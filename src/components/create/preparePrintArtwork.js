import { base44 } from '@/api/base44Client';
import { rememberArtwork } from '@/components/create/artworkMetadata';

async function prepareArtwork(sourceUrl) {
  const response = await fetch(sourceUrl, { signal: AbortSignal.timeout(30000) });
  if (!response.ok) throw new Error('Não foi possível baixar a arte para preparar o PNG.');
  const source = await response.blob();
  if (source.size > 20 * 1024 * 1024) throw new Error('Imagem grande demais para preparar. Limite: 20 MB.');
  const bitmap = await createImageBitmap(source);
  const { width: originalWidth, height: originalHeight } = bitmap;
  if (!originalWidth || !originalHeight || originalWidth * originalHeight > 16000000) { bitmap.close(); throw new Error('Use uma imagem de até 16 megapixels.'); }
  const desiredScale = Math.max(1, 2000 / originalWidth, 2000 / originalHeight);
  const safeScale = Math.min(desiredScale, Math.sqrt(16000000 / (originalWidth * originalHeight)));
  const width = Math.round(originalWidth * safeScale);
  const height = Math.round(originalHeight * safeScale);
  const canvas = document.createElement('canvas');
  canvas.width = width; canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(bitmap, 0, 0, width, height); bitmap.close();
  const image = context.getImageData(0, 0, width, height);
  const processed = await new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./artwork.worker.js', import.meta.url), { type: 'module' });
    const timer = setTimeout(() => { worker.terminate(); reject(new Error('A limpeza demorou demais. Tente uma imagem menor.')); }, 30000);
    worker.onmessage = ({ data }) => { clearTimeout(timer); worker.terminate(); data.error ? reject(new Error(data.error)) : resolve(data); };
    worker.onerror = () => { clearTimeout(timer); worker.terminate(); reject(new Error('Falha ao processar a transparência. Tente novamente.')); };
    worker.postMessage({ buffer: image.data.buffer, width, height }, [image.data.buffer]);
  });
  context.putImageData(new ImageData(new Uint8ClampedArray(processed.buffer), width, height), 0, 0);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  canvas.width = canvas.height = 0;
  if (!blob) throw new Error('Não foi possível exportar o PNG transparente.');
  const hash = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer());
  const sha256 = [...new Uint8Array(hash)].map(v => v.toString(16).padStart(2, '0')).join('');
  const { file_url } = await base44.integrations.Core.UploadFile({ file: new File([blob], `estampa-${sha256.slice(0, 16)}.png`, { type: 'image/png' }) });
  if (!file_url) throw new Error('Não foi possível salvar o arquivo de produção.');
  rememberArtwork(file_url, { file_url, original_url: sourceUrl, width, height, original_width: originalWidth, original_height: originalHeight, mime_type: 'image/png', bytes: blob.size, sha256, alpha_validated: true, ...processed.metadata, reconstructed: safeScale > 1 });
  return file_url;
}
export const prepareGeneratedArtwork = prepareArtwork;
export const prepareUploadedArtwork = (file, sourceUrl) => prepareArtwork(sourceUrl);