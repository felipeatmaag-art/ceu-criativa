import { PRINT_AREA, printGeometry } from '@/components/create/printGeometry';
import { getArtworkMetadata } from '@/components/create/artworkMetadata';
const images = new Map();
export function loadPrintImage(url) {
  if (!images.has(url)) images.set(url, new Promise((resolve, reject) => {
    const image = new Image(); image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = () => { images.delete(url); reject(new Error('Não foi possível carregar a imagem do mockup.')); };
    image.src = url;
  }));
  return images.get(url);
}
export async function renderPrintMockup(canvas, baseUrl, artworkUrl, transform) {
  const [base, artwork] = await Promise.all([baseUrl ? loadPrintImage(baseUrl) : null, artworkUrl ? loadPrintImage(artworkUrl) : null]);
  const buffer = document.createElement('canvas'); buffer.width = buffer.height = 1000;
  const ctx = buffer.getContext('2d');
  if (base) {
    const factor = Math.min(1000 / base.naturalWidth, 1000 / base.naturalHeight);
    const w = base.naturalWidth * factor, h = base.naturalHeight * factor;
    ctx.drawImage(base, (1000 - w) / 2, (1000 - h) / 2, w, h);
  }
  if (artwork) {
    const { bounds } = getArtworkMetadata(artworkUrl);
    const g = printGeometry(transform, bounds.width / bounds.height);
    const ink = document.createElement('canvas'); ink.width = ink.height = 1000;
    const pen = ink.getContext('2d');
    pen.translate(g.cx, g.cy); pen.rotate(g.rotation * Math.PI / 180);
    pen.drawImage(artwork, bounds.left, bounds.top, bounds.width, bounds.height, -g.width / 2, -g.height / 2, g.width, g.height);
    // White underbase: source-over preserves both black and white ink on dark garments.
    ctx.drawImage(ink, 0, 0);
    if (base) {
      pen.setTransform(1, 0, 0, 1, 0, 0);
      pen.globalCompositeOperation = 'source-in';
      pen.filter = 'grayscale(1) brightness(1.8)';
      const factor = Math.min(1000 / base.naturalWidth, 1000 / base.naturalHeight);
      pen.drawImage(base, (1000 - base.naturalWidth * factor) / 2, (1000 - base.naturalHeight * factor) / 2, base.naturalWidth * factor, base.naturalHeight * factor);
      ctx.globalCompositeOperation = 'multiply'; ctx.globalAlpha = 0.12;
      ctx.drawImage(ink, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    }
  }
  canvas.width = canvas.height = 1000;
  canvas.getContext('2d').drawImage(buffer, 0, 0);
  return PRINT_AREA;
}