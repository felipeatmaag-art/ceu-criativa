import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function ReviewDesignDialog({ design, decision, open, onClose, onConfirm }) {
  const [note, setNote] = useState(''), [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => { setNote(''); setError(''); }, [design, decision]);
  if (!design) return null;
  const submit = async () => { if (decision === 'rejeitado' && !note.trim()) return setError('Explique o motivo da rejeição.'); setBusy(true); await onConfirm(note.trim()); setBusy(false); };
  const reviewing = decision === 'review';
  return <Dialog open={open} onOpenChange={value => !value && onClose()}><DialogContent className="max-w-3xl rounded-3xl"><DialogHeader><DialogTitle>{reviewing ? 'Revisar estampa' : decision === 'aprovado' ? 'Aprovar estampa' : 'Rejeitar estampa'}</DialogTitle></DialogHeader><div className="grid gap-5 md:grid-cols-2"><img src={design.image_url} alt={design.title} className="aspect-square w-full rounded-2xl object-cover"/><div><h3 className="text-xl font-bold">{design.title}</h3><p className="mt-1 text-sm text-muted-foreground">por {design.artist_name || 'Artista'} · {design.category}</p><p className="mt-4 text-sm leading-6 text-muted-foreground">{design.description || 'Sem descrição enviada.'}</p>{!reviewing && <><label className="mb-2 mt-5 block text-sm font-medium">Parecer {decision === 'rejeitado' ? '*' : '(opcional)'}</label><Textarea value={note} onChange={event => setNote(event.target.value)} rows={4} placeholder="Registre a orientação para o artista"/>{error && <p className="mt-2 text-sm text-destructive">{error}</p>}</>}</div></div><DialogFooter><Button variant="outline" onClick={onClose}>Fechar</Button>{!reviewing && <Button onClick={submit} disabled={busy} className={decision === 'aprovado' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}>{busy ? 'Salvando...' : decision === 'aprovado' ? 'Confirmar aprovação' : 'Confirmar rejeição'}</Button>}</DialogFooter></DialogContent></Dialog>;
}