import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateArtworkFile } from '@/components/create/artworkMetadata';
import { Loader2, Upload } from 'lucide-react';
export default function CompetitionUploadForm({ competition }) {
  const [title, setTitle] = useState(''), [file, setFile] = useState(null), [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const cache = useQueryClient();
  const submit = async event => {
    event.preventDefault(); setMessage('');
    if (!await base44.auth.isAuthenticated()) return base44.auth.redirectToLogin(window.location.href);
    if (!file || !title.trim()) return setMessage('Informe um título e selecione a arte.');
    setBusy(true);
    try {
      await validateArtworkFile(file);
      const uploaded = await base44.integrations.Core.UploadFile({ file });
      await base44.functions.invoke('submitCompetitionEntry', { competitionId: competition.id, title, imageUrl: uploaded.file_url });
      setTitle(''); setFile(null); setMessage('Arte enviada e adicionada ao ranking.');
      await cache.invalidateQueries({ queryKey: ['competition-entries', competition.id] });
    } catch (error) { setMessage(error.response?.data?.error || error.message || 'Não foi possível enviar a arte.'); }
    finally { setBusy(false); }
  };
  return <form onSubmit={submit} className="rounded-3xl border bg-card p-6 shadow-sm"><h3 className="text-lg font-bold">Enviar arte</h3><p className="mt-1 text-sm text-muted-foreground">Até 3 artes por artista.</p><div className="mt-4 space-y-3"><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da arte" maxLength={100} /><Input type="file" accept="image/png,image/jpeg,image/webp" onChange={e => setFile(e.target.files?.[0] || null)} /><Button type="submit" disabled={busy} className="w-full rounded-full">{busy ? <Loader2 className="animate-spin" /> : <Upload />}Participar do concurso</Button>{message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}</div></form>;
}