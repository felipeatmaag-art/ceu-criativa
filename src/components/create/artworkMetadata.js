const records = new Map();
export const rememberArtwork = (url, metadata) => records.set(url, metadata);
export function getArtworkMetadata(url) {
  const metadata = records.get(url);
  if (!metadata) throw new Error('Prepare novamente a arte antes de salvar; a transparência ainda não foi validada.');
  return metadata;
}
export async function validateArtworkFile(file) {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('Use PNG, JPG ou WebP.');
  if (file.size > 10 * 1024 * 1024) throw new Error('O arquivo deve ter no máximo 10 MB.');
  const bitmap = await createImageBitmap(file);
  const { width, height } = bitmap;
  bitmap.close();
  if (width < 2000 || height < 2000) throw new Error('Envie uma arte com pelo menos 2000 × 2000 px.');
  if (width * height > 16000000) throw new Error('Use uma imagem de até 16 megapixels.');
}