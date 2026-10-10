import { base44 } from '@/api/base44Client';
import { getArtworkMetadata } from '@/components/create/artworkMetadata';
import { PRINT_AREA, lockPrintPlacement, normalizePrintTransform } from '@/components/create/printGeometry';
import { hasPrintStage, renderStudioMockup, uploadMockup } from '@/components/create/studioMockups';
import { renderHumanMockup } from '@/components/create/renderHumanMockup';
import { createPrintReadyBlob } from '@/components/production/exportPrintReadyPng';
import { calculateTotalDtfCost } from '@/components/create/dtfPricing';

export default async function buildProductionSnapshot(options) {
  const { frontImage, backImage, transforms, views, product, color, size, productType, mockupStyle } = options;
  const artworkSides = [['front', frontImage], ['back', backImage]].filter(([, url]) => url);
  const placements = Object.fromEntries(artworkSides.map(([side, url]) => {
    const bounds = getArtworkMetadata(url).bounds;
    return [side, lockPrintPlacement(transforms[side], bounds.width / bounds.height)];
  }));
  const lockedOptions = { ...options, transforms: Object.fromEntries(Object.entries(transforms).map(([side, transform]) => [side, normalizePrintTransform(transform)])), placements };
  const dtfSummary = calculateTotalDtfCost({ frontImage, backImage, transforms, productType });
  const production = {
    version: 1,
    placement_version: 1,
    catalog_product_id: product?.id || '',
    product_type: productType,
    technique: productType === 'caneca' ? 'sublimacao_dtf_uv' : 'dtf_textil_hd',
    color,
    size,
    approved_at: new Date().toISOString(),
    print_area: productType === 'caneca'
      ? { width_mm: 232, height_mm: 179, coordinate_space: 1000, calibrated: true }
      : { ...PRINT_AREA, coordinate_space: 1000, calibrated: false },
    dtf: dtfSummary,
    technical_review: 'pending'
  };

  // 1. Arquivos de impressão em alta resolução 300 DPI
  await Promise.all(artworkSides.map(async ([side, url]) => {
    const metadata = getArtworkMetadata(url);
    const g = placements[side];
    const printReady = await createPrintReadyBlob(url, productType);
    const printUpload = await base44.integrations.Core.UploadFile({ file: new File([printReady.blob], `estampa-${side}-${Date.now()}.png`, { type: 'image/png' }) });
    production[side] = { ...metadata, placement: g, effective_dpi: Math.floor(metadata.bounds.width / (g.width / PRINT_AREA.width * PRINT_AREA.width_mm / 25.4)), print_ready_url: printUpload.file_url, print_ready_width: printReady.width, print_ready_height: printReady.height, print_ready_dpi: 300 };
  }));

  // 2. Provas visuais técnicas de estúdio (frente e costas)
  const sides = hasPrintStage(productType) && (views?.back || backImage) ? ['front', 'back'] : ['front'];
  await Promise.all(sides.map(async side => {
    try {
      const canvas = await renderStudioMockup(lockedOptions, side);
      production[`mockup_${side}_url`] = await uploadMockup(canvas, `mockup-${side}`);
      if (views?.[side]) production[`base_${side}_url`] = views[side];
    } catch (mockupErr) {
      console.warn(`Aviso ao gerar prova visual de ${side}:`, mockupErr);
    }
  }));

  // 3. Mockup Humanizado com modelo em uso (estilo perfil Felipe Silvério) para vitrine da loja
  if (hasPrintStage(productType)) {
    try {
      const humanStyleKey = (mockupStyle && mockupStyle.startsWith('human_')) ? mockupStyle : 'human_street';
      const humanCanvas = await renderHumanMockup(lockedOptions, humanStyleKey);
      if (humanCanvas) {
        production.mockup_human_url = await uploadMockup(humanCanvas, 'mockup-human');
      }
    } catch (humanErr) {
      console.warn('Aviso ao gerar mockup humanizado de produção:', humanErr);
    }
  }

  return production;
}
