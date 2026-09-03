import { base44 } from '@/api/base44Client';

async function uploadPng(sourceUrl) {
  const response = await fetch(sourceUrl);
  if (!response.ok) throw new Error('Não foi possível preparar a imagem.');

  const sourceBlob = await response.blob();
  const bitmap = await window.createImageBitmap(sourceBlob);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0);
  bitmap.close();

  const pngBlob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!pngBlob) throw new Error('Não foi possível converter a imagem para PNG.');

  const pngFile = new File([pngBlob], `estampa-${Date.now()}.png`, { type: 'image/png' });
  const uploaded = await base44.integrations.Core.UploadFile({ file: pngFile });
  return uploaded.file_url;
}

async function removeBackground(sourceUrl) {
  const result = await base44.integrations.Core.GenerateImage({
    prompt: 'Extraia exclusivamente a estampa desta imagem e deixe o fundo totalmente transparente. Preserve exatamente os desenhos, cores, contornos, proporções, textos e detalhes da arte. Se houver camiseta, roupa, caneca, quadro, produto, manequim, embalagem, etiqueta, mockup, ambiente ou superfície, elimine esses elementos por completo e mantenha somente a estampa isolada. Não adicione sombras, cenário, margem ou novos elementos. Entregue apenas o arquivo gráfico da estampa, centralizado e pronto para impressão.',
    existing_image_urls: [sourceUrl]
  });
  if (!result?.url) throw new Error('Não foi possível remover o fundo da imagem.');
  return result.url;
}

export async function prepareGeneratedArtwork(sourceUrl) {
  const transparentUrl = await removeBackground(sourceUrl);
  return uploadPng(transparentUrl);
}

export async function prepareUploadedArtwork(file, sourceUrl) {
  if (file.type === 'image/jpeg' || /\.jpe?g$/i.test(file.name)) {
    const transparentUrl = await removeBackground(sourceUrl);
    return uploadPng(transparentUrl);
  }

  return uploadPng(sourceUrl);
}