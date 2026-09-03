import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

export default function ProductImageSetupCard({ product, onUpdated }) {
  const [files, setFiles] = useState({ front: null, back: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const prepare = async (file, side) => {
    const upload = await base44.integrations.Core.UploadFile({ file });
    const result = await base44.integrations.Core.GenerateImage({
      existing_image_urls: [upload.file_url],
      prompt: `Converta esta foto em uma fotografia profissional de catálogo de ${product.name}, vista de ${side}. Preserve rigorosamente produto, cor, material ${product.material}, modelagem ${product.fit}, textura, costuras e proporções. Remova o ambiente, centralize o item inteiro, corrija iluminação e perspectiva e use fundo cinza-claro neutro. Não adicione arte, texto, pessoa, cabide ou acessórios.`
    });
    return result.url;
  };
  const save = async () => {
    setSaving(true); setError('');
    try {
      const [front, back] = await Promise.all([files.front ? prepare(files.front, 'frente') : product.front_model_url, files.back ? prepare(files.back, 'costas') : product.back_model_url]);
      if (!front) throw new Error('Envie pelo menos a foto da frente.');
      const updated = await base44.entities.Product.update(product.id, { front_model_url: front, ...(back ? { back_model_url: back } : {}), is_active: true });
      setFiles({ front: null, back: null }); onUpdated(updated);
    } catch (cause) { setError(cause.message || 'Não foi possível preparar as imagens.'); }
    setSaving(false);
  };
  const field = (side, label) => <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ceu-navy/25 bg-ceu-cloud px-3 py-4 text-sm font-semibold text-ceu-navy active:scale-95"><Upload className="h-4 w-4" />{files[side]?.name || label}<input type="file" accept="image/*" className="sr-only" onChange={(event) => setFiles((current) => ({ ...current, [side]: event.target.files?.[0] || null }))} /></label>;
  return <article className="rounded-3xl border bg-card p-5 text-ceu-navy shadow-sm"><div className="flex items-center gap-4"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-ceu-cloud">{product.front_model_url ? <img src={product.front_model_url} alt={product.name} className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sem foto</div>}</div><div><h3 className="font-bold">{product.name}</h3><p className="text-sm text-muted-foreground">{product.material} • {product.fit}</p><p className="mt-1 text-sm font-semibold">R$ {Number(product.base_price).toFixed(2).replace('.', ',')}</p></div></div><div className="mt-4 grid gap-3 sm:grid-cols-2">{field('front', product.front_model_url ? 'Trocar frente' : 'Anexar frente')}{field('back', product.back_model_url ? 'Trocar costas' : 'Anexar costas')}</div>{error && <p className="mt-3 text-sm text-destructive">{error}</p>}<Button type="button" disabled={saving || (!files.front && !files.back)} onClick={save} className="mt-4 w-full rounded-full bg-ceu-navy text-ceu-cloud">{saving ? 'Preparando imagens...' : 'Salvar imagens'}</Button></article>;
}