import { loadPrintImage } from '@/components/create/renderPrintMockup';

const MIN_PRINT_SIDE = 3000;

export async function createPrintReadyBlob(sourceUrl) {
  const image = await loadPrintImage(sourceUrl);
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  const scale = Math.max(1, MIN_PRINT_SIDE / longestSide);
  const width = Math.round(image.naturalWidth * scale);
  const height = Math.round(image.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: true });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.clearRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Não foi possível preparar o PNG em alta resolução.');
  return { blob, width, height };
}

export async function downloadPrintReadyPng(sourceUrl, fileName) {
  const { blob } = await createPrintReadyBlob(sourceUrl);
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `${fileName.replace(/[^a-z0-9-_]/gi, '-')}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}