export async function getArtistCommissionRate(entities, artistId) {
  if (!artistId) return 25;
  const rows = await entities.ArtistCommission.filter({ artist_id: artistId }, '-updated_date', 1);
  const rate = Number(rows[0]?.rate ?? 25);
  return Math.max(0, Math.min(100, rate));
}