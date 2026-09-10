import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { calculateArtistFinance } from '../../shared/artistFinance.ts';
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const finance = await calculateArtistFinance(base44.asServiceRole.entities, user);
    if (finance.available < 1) return Response.json({ error: 'Você ainda não possui saldo disponível.' }, { status: 400 });
    const request = await base44.entities.PayoutRequest.create({ artist_id: user.id, artist_name: user.artist_name || user.full_name || 'Artista', amount: finance.available, status: 'pending', requested_at: new Date().toISOString() });
    return Response.json({ id: request.id, amount: request.amount, status: request.status });
  } catch (error) {
    console.error('requestArtistPayout:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}