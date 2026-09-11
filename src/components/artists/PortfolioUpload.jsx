import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, Loader2 } from 'lucide-react';
export default function PortfolioUpload({ value, onChange }) {
  const [busy,setBusy]=useState(false), [error,setError]=useState('');
  const upload = async e => { const files=[...e.target.files].slice(0,5); if(!files.length)return; setBusy(true); setError(''); try { const results=await Promise.all(files.map(file=>base44.integrations.Core.UploadPrivateFile({file}))); onChange([...value,...results.map(item=>item.file_uri)].slice(0,5)); } catch(err){ setError(err.message||'Não foi possível enviar o portfólio.'); } finally { setBusy(false); e.target.value=''; } };
  return <div><label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-sm font-bold text-muted-foreground active:scale-95"><input className="hidden" type="file" accept="image/png,image/jpeg" multiple onChange={upload} disabled={busy}/>{busy?<Loader2 className="animate-spin"/>:<Upload/>}{busy?'Enviando...':'Enviar até 5 trabalhos'}</label>{value.length>0&&<p className="mt-2 text-sm text-emerald-700">{value.length} arquivo(s) protegido(s) enviado(s).</p>}{error&&<p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}</div>;
}