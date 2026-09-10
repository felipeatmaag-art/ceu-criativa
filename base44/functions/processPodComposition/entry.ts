import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { buildCompositionMetadata } from '../../shared/podComposition.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { designId, productId, side = 'front', transform, artworkWidth, artworkHeight, artworkUrl, persist = false } = await req.json();
    if (!designId || !productId || !['front', 'back'].includes(side)) return Response.json({ error: 'Composição inválida.' }, { status: 400 });
    const [design, product] = await Promise.all([base44.entities.Design.get(designId), base44.entities.Product.get(productId)]);
    if (!design || !product?.catalog_product || !product.is_active) return Response.json({ error: 'Produto ou estampa indisponível.' }, { status: 404 });
    if (user.role !== 'admin' && design.artist_id !== user.id) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const metadata = buildCompositionMetadata({ transform, artworkWidth, artworkHeight });
    const sideMetadata = { source_url: artworkUrl || design.image_url, ...metadata.artwork, placement: metadata.placement, effective_dpi: metadata.effective_dpi };
    if (persist) {
      const production = { ...(design.production || {}), version: 1, catalog_product_id: product.id, product_type: product.type, print_area: metadata.print_area, [side]: { ...(design.production?.[side] || {}), ...sideMetadata }, technical_review: metadata.effective_dpi >= 150 ? 'ready' : 'low_dpi' };
      await base44.entities.Design.update(design.id, { production });
    }
    return Response.json({ designId, productId, side, metadata: sideMetadata, printArea: metadata.print_area, technicalReview: metadata.effective_dpi >= 150 ? 'ready' : 'low_dpi' });
  } catch (error) {
    console.error('processPodComposition:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
}