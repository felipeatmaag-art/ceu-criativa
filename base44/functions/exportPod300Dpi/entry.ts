import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { buildCompositionMetadata } from '../../shared/podComposition.ts';
const targets = { camiseta: [3543, 4724], baby_look: [3543, 4724], quadro: [3543, 4724], ecobag: [3307, 4134], caneca: [2362, 1063], logo_uniforme: [1181, 1181] };
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { designId, side = 'front', transform, artworkWidth, artworkHeight } = await req.json();
    if (!designId || !['front', 'back'].includes(side)) return Response.json({ error: 'Design e lado válidos são obrigatórios.' }, { status: 400 });
    const design = await base44.entities.Design.get(designId);
    if (!design || (user.role !== 'admin' && design.artist_id !== user.id)) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const composition = buildCompositionMetadata({ transform, artworkWidth, artworkHeight });
    const productType = design.production?.product_type || 'camiseta';
    const [width, height] = targets[productType] || targets.camiseta;
    return Response.json({ version: 1, designId, side, dpi: 300, colorMode: 'sRGB', format: 'PNG', target: { width, height }, sourceUrl: design.production?.[side]?.print_ready_url || design.image_url, downloadUrl: design.production?.[side]?.print_ready_url || null, placement: composition.placement, printArea: composition.print_area, effectiveDpi: composition.effective_dpi, ready: composition.effective_dpi >= 300 });
  } catch (error) {
    console.error('exportPod300Dpi:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
}