import { base44 } from '@/api/base44Client';
import { loadPrintImage } from '@/components/create/renderPrintMockup';
import { mockupSourceKey, renderStudioMockup, uploadMockup } from '@/components/create/studioMockups';
import { renderHumanMockup } from '@/components/create/renderHumanMockup';

export default async function generateCatalogMockups(options, style, environment, angles) {
  const isHumanStyle = style && style.startsWith('human_');

  // Separa ângulos técnicos de estúdio (frente / costas) do ângulo humanizado
  const studioAngles = angles.filter(a => a === 'front' || a === 'back');
  const hasHumanAngle = angles.includes('human') || isHumanStyle;

  const results = [];

  // 1. Gera provas de estúdio (frente / costas)
  if (studioAngles.length > 0) {
    const proofs = await Promise.all(studioAngles.map(side => renderStudioMockup(options, side)));
    let background = null;
    if (style && style !== 'studio' && !isHumanStyle) {
      try {
        const generated = await base44.integrations.Core.GenerateImage({
          prompt: `Fotografia quadrada de um ambiente vazio: ${environment}. Fundo para catálogo de produto, composição discreta. Sem roupas, pessoas, manequins, estampas ou desenhos.`
        });
        if (generated?.url) {
          background = await loadPrintImage(generated.url);
        }
      } catch (err) {
        console.warn('Aviso ao gerar fundo ambiente:', err);
      }
    }

    for (let i = 0; i < studioAngles.length; i++) {
      const angle = studioAngles[i];
      const proof = proofs[i];
      const canvas = document.createElement('canvas');
      canvas.width = proof.width;
      canvas.height = proof.height;
      const ctx = canvas.getContext('2d');
      if (background) ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(proof, 0, 0);

      const url = await uploadMockup(canvas, `catalogo-${angle}`);
      results.push({
        angle,
        label: angle === 'back' ? 'Costas' : 'Frente',
        sourceKey: mockupSourceKey(options),
        url,
      });
    }
  }

  // 2. Gera mockup humanizado com modelo real em uso (estilo Felipe Silvério)
  if (hasHumanAngle) {
    try {
      const humanCanvas = await renderHumanMockup(options, isHumanStyle ? style : 'human_street');
      if (humanCanvas) {
        const humanUrl = await uploadMockup(humanCanvas, 'catalogo-human');
        results.push({
          angle: 'human',
          label: 'Modelo Humanizado (Em Uso)',
          sourceKey: mockupSourceKey(options),
          url: humanUrl,
        });
      }
    } catch (err) {
      console.warn('Aviso ao gerar mockup humanizado de catálogo:', err);
    }
  }

  return results;
}
