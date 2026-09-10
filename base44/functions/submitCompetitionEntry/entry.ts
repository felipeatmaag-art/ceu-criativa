import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
export default async function(req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { competitionId, title, imageUrl } = await req.json();
    if (!competitionId || !title?.trim() || !imageUrl) return Response.json({ error: 'Título e arte são obrigatórios.' }, { status: 400 });
    const competition = await base44.entities.Competition.get(competitionId);
    if (!competition || competition.status !== 'active' || new Date(competition.end_date) < new Date()) return Response.json({ error: 'Este concurso não recebe novas artes.' }, { status: 400 });
    const existing = await base44.entities.CompetitionSubmission.filter({ competition_id: competitionId, artist_id: user.id }, '-created_date', 4);
    if (existing.length >= 3) return Response.json({ error: 'Você já enviou o limite de 3 artes.' }, { status: 400 });
    const submission = await base44.entities.CompetitionSubmission.create({ competition_id: competitionId, title: title.trim().slice(0, 100), image_url: imageUrl, artist_id: user.id, artist_name: user.artist_name || user.full_name || 'Artista', status: 'approved' });
    const all = await base44.asServiceRole.entities.CompetitionSubmission.filter({ competition_id: competitionId, status: 'approved' }, '-created_date', 500);
    await base44.asServiceRole.entities.Competition.update(competitionId, { participants_count: all.length });
    return Response.json({ id: submission.id, status: submission.status, participantsCount: all.length });
  } catch (error) {
    console.error('submitCompetitionEntry:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}