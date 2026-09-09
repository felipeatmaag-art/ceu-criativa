import { base44 } from '@/api/base44Client';
import { getArtworkMetadata } from '@/components/create/artworkMetadata';
import { PRINT_AREA, printGeometry } from '@/components/create/printGeometry';
import { hasPrintStage, renderStudioMockup, uploadMockup } from '@/components/create/studioMockups';
import { createPrintReadyBlob } from '@/components/production/exportPrintReadyPng';
export default async function buildProductionSnapshot(options) {
  const { frontImage, backImage, transforms, views, product, color, size, productType } = options;
  const production = { version: 1, catalog_product_id: product?.id || '', product_type: productType, color, size, approved_at: new Date().toISOString(), print_area: { ...PRINT_AREA, coordinate_space: 1000, calibrated: false }, technical_review: 'pending' };
  await Promise.all([['front', frontImage], ['back', backImage]].filter(([, url]) => url).map(async ([side, url]) => {
    const metadata = getArtworkMetadata(url);
    const g = printGeometry(transforms[side], metadata.bounds.width / metadata.bounds.height);
    const printReady = await createPrintReadyBlob(url, productType);
    const printUpload = await base44.integrations.Core.UploadFile({ file: new File([printReady.blob], `estampa-${side}-${Date.now()}.png`, { type: 'image/png' }) });
    production[side] = { ...metadata, placement: g, effective_dpi: Math.floor(metadata.bounds.width / (g.width / PRINT_AREA.width * PRINT_AREA.width_mm / 25.4)), print_ready_url: printUpload.file_url, print_ready_width: printReady.width, print_ready_height: printReady.height, print_ready_dpi: 300 };
  }));
  const sides = hasPrintStage(productType) && (views.back || backImage) ? ['front', 'back'] : ['front'];
  await Promise.all(sides.map(async side => {
    const canvas = await renderStudioMockup(options, side);
    production[`mockup_${side}_url`] = await uploadMockup(canvas, `mockup-${side}`);
    if (views[side]) production[`base_${side}_url`] = views[side];
  }));
  return production;
}