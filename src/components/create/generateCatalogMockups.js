import { base44 } from '@/api/base44Client';
import { loadPrintImage } from '@/components/create/renderPrintMockup';
import { mockupSourceKey, renderStudioMockup, uploadMockup } from '@/components/create/studioMockups';

export default async function generateCatalogMockups(options, style, environment, angles) {
  // Render the product and its artwork ourselves. Never ask AI to redraw either.
  const proofs = await Promise.all(angles.map(side => renderStudioMockup(options, side)));
  let background;
  if (style !== 'studio') {
    const generated = await base44.integrations.Core.GenerateImage({ prompt: `Fotografia quadrada de um ambiente vazio: ${environment}. Fundo para catálogo, composição discreta. Sem produtos, roupas, pessoas, estampas, desenhos, logotipos ou texto. Não inclua objetos no centro.` });
    if (!generated?.url) throw new Error('Não foi possível gerar o ambiente.');
    background = await loadPrintImage(generated.url);
  }
  return Promise.all(proofs.map(async (proof, index) => {
    const canvas = document.createElement('canvas');
    canvas.width = proof.width; canvas.height = proof.height;
    const ctx = canvas.getContext('2d');
    if (background) ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(proof, 0, 0);
    const angle = angles[index];
    return { angle, label: angle === 'back' ? 'Costas' : 'Frente', sourceKey: mockupSourceKey(options), url: await uploadMockup(canvas, `catalogo-${angle}`) };
  }));
}