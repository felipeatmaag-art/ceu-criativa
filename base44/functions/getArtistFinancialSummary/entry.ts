import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { calculateArtistFinance } from '../../shared/artistFinance.ts';

export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    return Response.json(await calculateArtistFinance(base44.asServiceRole.entities, user));
  } catch (error) {
    console.error('Financial summary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}