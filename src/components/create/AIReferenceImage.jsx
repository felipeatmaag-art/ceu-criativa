import { useState } from 'react';
import { ImagePlus, Loader2, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { validateArtworkFile } from '@/components/create/artworkMetadata';
import { Button } from '@/components/ui/button';

export default function AIReferenceImage({ value, onChange, disabled }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const upload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      await validateArtworkFile(file);
      const result = await base44.integrations.Core.UploadFile({ file });
      if (!result?.file_url) throw new Error('O envio da referência não foi concluído.');
      onChange(result.file_url);
    } catch (e) { setError(e.message || 'Não foi possível enviar a referência.'); }
    finally { setUploading(false); event.target.value = ''; }
  };
  return <div><p className="mb-2 text-sm font-medium text-gray-700">Imagem de referência <span className="font-normal text-gray-500">(opcional)</span></p>{value ? <div className="flex items-center gap-3 rounded-2xl border border-ceu-navy/15 bg-card p-3"><img src={value} alt="Referência para a IA" className="h-16 w-16 rounded-xl object-cover"/><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-gray-900">Referência adicionada</p><p className="text-xs text-gray-500">A IA usará o estilo e os elementos visuais.</p></div><Button type="button" variant="ghost" size="icon" onClick={() => onChange(null)} aria-label="Remover referência"><X/></Button></div> : <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-ceu-navy/25 p-4 text-sm font-medium text-ceu-navy hover:bg-ceu-navy/5"><input aria-label="Enviar imagem de referência" type="file" accept="image/png,image/jpeg,image/webp" onChange={upload} disabled={disabled || uploading} className="sr-only"/>{uploading ? <><Loader2 className="animate-spin"/>Enviando referência...</> : <><ImagePlus/>Enviar imagem de referência</>}</label>}{error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}</div>;
}