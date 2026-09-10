import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { buildPodQuote } from '../../shared/podPricing.ts';
import { getArtistCommissionRate } from '../../shared/artistCommission.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { productId, designId, quantity = 1 } = await req.json();
    if (!productId || !designId) return Response.json({ error: 'Produto e estampa são obrigatórios.' }, { status: 400 });
    const [product, design] = await Promise.all([base44.entities.Product.get(productId), base44.entities.Design.get(designId)]);
    if (!product?.is_active || !design) return Response.json({ error: 'Produto ou estampa indisponível.' }, { status: 404 });
    const commissionRate = await getArtistCommissionRate(base44.asServiceRole.entities, design.artist_id);
    return Response.json({ productId, designId, artistId: design.artist_id || '', ...buildPodQuote(product, { ...design, commission_rate: commissionRate }, quantity) });
  } catch (error) {
    console.error('calculatePodQuote:', error.message);
    return Response.json({ error: error.message }, { status: 400 });
  }
}