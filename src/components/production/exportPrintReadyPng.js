import { loadPrintImage } from '@/components/create/renderPrintMockup';
import { getPrintStandard } from '@/components/production/printStandards';

export async function createPrintReadyBlob(sourceUrl, productType) {
  const image = await loadPrintImage(sourceUrl);
  const standard = getPrintStandard(productType);
  const width = standard.widthPx;
  const height = standard.heightPx;
  const scale = Math.min(width / image.naturalWidth, height / image.naturalHeight);
  const artworkWidth = Math.round(image.naturalWidth * scale);
  const artworkHeight = Math.round(image.naturalHeight * scale);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { alpha: true });
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.clearRect(0, 0, width, height);
  context.drawImage(image, Math.round((width - artworkWidth) / 2), Math.round((height - artworkHeight) / 2), artworkWidth, artworkHeight);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Não foi possível preparar o PNG em alta resolução.');
  return { blob, width, height };
}

export async function downloadPrintReadyPng(sourceUrl, fileName, productType) {
  const { blob } = await createPrintReadyBlob(sourceUrl, productType);
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = `${fileName.replace(/[^a-z0-9-_]/gi, '-')}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}