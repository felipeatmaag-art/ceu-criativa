const records = new Map();
export const rememberArtwork = (url, metadata) => records.set(url, metadata);
export function getArtworkMetadata(url) {
  const metadata = records.get(url);
  if (!metadata || metadata.quality_version !== 2) throw new Error('Esta arte usa a validação anterior. Gere ou envie novamente para aplicar a limpeza avançada antes de salvar.');
  return metadata;
}
export async function validateArtworkFile(file) {
  if (file.type !== 'image/png') throw new Error('Envie um arquivo PNG com fundo transparente.');
  if (file.size > 10 * 1024 * 1024) throw new Error('O arquivo deve ter no máximo 10 MB.');
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  if (width < 256 || height < 256) { bitmap.close(); throw new Error('A imagem precisa ter pelo menos 256 px de largura e altura.'); }
  if (width * height > 16000000) { bitmap.close(); throw new Error('Use uma imagem de até 16 megapixels.'); }
  const scale = Math.min(1, 512 / Math.max(width, height));
  const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(width * scale)); canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d', { willReadFrequently: true }); context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data; let transparent = 0;
  for (let i = 3; i < pixels.length; i += 4) if (pixels[i] < 250) transparent++;
  canvas.width = canvas.height = 0;
  if (transparent / (pixels.length / 4) < 0.02) throw new Error('O PNG precisa ter fundo transparente ao redor da arte.');
  return { width, height, warning: width < 3000 || height < 3000 ? `Resolução ${width}×${height}px: abaixo dos 300 DPI recomendados para impressão grande.` : '' };
}