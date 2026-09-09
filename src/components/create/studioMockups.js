import html2canvas from 'html2canvas';
import { base44 } from '@/api/base44Client';
import { renderPrintMockup } from '@/components/create/renderPrintMockup';

export const mockupSourceKey = ({ productType, color, frontImage, backImage, transforms, views }) => JSON.stringify({ productType, color, frontImage, backImage, transforms, views });
export const hasPrintStage = type => ['camiseta', 'baby_look'].includes(type);
export async function captureStudioElement(element) {
  if (!element) throw new Error('Abra a pré-visualização antes de salvar.');
  const webgl = element.querySelector('canvas');
  if (webgl) {
    const canvas = document.createElement('canvas');
    canvas.width = webgl.width; canvas.height = webgl.height;
    canvas.getContext('2d').drawImage(webgl, 0, 0);
    return canvas;
  }
  await Promise.all([...element.querySelectorAll('img')].map(image => image.decode()));
  return html2canvas(element, { backgroundColor: null, useCORS: true, logging: false, scale: 1000 / element.clientWidth, ignoreElements: el => ['BUTTON', 'INPUT'].includes(el.tagName) });
}
export async function renderStudioMockup(options, side = 'front') {
  if (!hasPrintStage(options.productType)) {
    if (!options.captureRef?.current) throw new Error('Abra a pré-visualização antes de salvar.');
    return options.captureRef.current();
  }
  if (!options.views?.[side]) throw new Error(`Adicione uma foto de ${side === 'front' ? 'frente' : 'costas'} antes de salvar.`);
  const canvas = document.createElement('canvas');
  await renderPrintMockup(canvas, options.views[side], side === 'front' ? options.frontImage : options.backImage, options.transforms[side]);
  return canvas;
}
export async function uploadMockup(canvas, name) {
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Não foi possível salvar a prova visual.');
  const { file_url } = await base44.integrations.Core.UploadFile({ file: new File([blob], `${name}-${Date.now()}.png`, { type: 'image/png' }) });
  return file_url;
}