import { base44 } from '@/api/base44Client';
import { getArtworkMetadata } from '@/components/create/artworkMetadata';
import { PRINT_AREA, printGeometry } from '@/components/create/printGeometry';
import { renderPrintMockup } from '@/components/create/renderPrintMockup';
import { createPrintReadyBlob } from '@/components/production/exportPrintReadyPng';
export default async function buildProductionSnapshot({ frontImage, backImage, transforms, views, product, color, size, productType }) {
  const apparel = ['camiseta', 'baby_look'].includes(productType);
  const production = { version: 1, catalog_product_id: product?.id || '', product_type: productType, color, size, approved_at: new Date().toISOString(), print_area: { ...PRINT_AREA, coordinate_space: 1000, calibrated: false }, technical_review: 'pending' };
  await Promise.all([['front', frontImage], ['back', backImage]].filter(([, url]) => url).map(async ([side, url]) => {
    const metadata = getArtworkMetadata(url);
    const g = printGeometry(transforms[side], metadata.bounds.width / metadata.bounds.height);
    const printReady = await createPrintReadyBlob(url);
    const printUpload = await base44.integrations.Core.UploadFile({ file: new File([printReady.blob], `estampa-${side}-${Date.now()}.png`, { type: 'image/png' }) });
    production[side] = { ...metadata, placement: g, effective_dpi: Math.floor(metadata.bounds.width / (g.width / PRINT_AREA.width * PRINT_AREA.width_mm / 25.4)), print_ready_url: printUpload.file_url, print_ready_width: printReady.width, print_ready_height: printReady.height };
    if (apparel) {
      if (!views[side]) throw new Error(`Adicione uma foto de ${side === 'front' ? 'frente' : 'costas'} antes de aprovar o mockup.`);
      const canvas = document.createElement('canvas');
      await renderPrintMockup(canvas, views[side], url, transforms[side]);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Não foi possível salvar a prova visual.');
      const { file_url } = await base44.integrations.Core.UploadFile({ file: new File([blob], `mockup-${side}-${Date.now()}.png`, { type: 'image/png' }) });
      production[`mockup_${side}_url`] = file_url;
      production[`base_${side}_url`] = views[side];
    }
  }));
  return production;
}