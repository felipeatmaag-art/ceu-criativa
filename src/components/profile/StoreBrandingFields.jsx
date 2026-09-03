import { useState } from 'react';
import { Globe2, ImagePlus, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function StoreBrandingFields({ data, onChange }) {
  const [uploading, setUploading] = useState(false);
  const uploadCover = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await base44.integrations.Core.UploadFile({ file });
    onChange('cover_image', result.file_url);
    setUploading(false);
  };
  const setSlug = (value) => onChange('store_slug', value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, ''));
  const address = `${window.location.origin}/${data.store_slug || 'nome-da-loja'}`;

  return <div className="space-y-5 rounded-2xl border border-ceu-navy/10 bg-ceu-cloud p-5">
    <div><Label className="text-base font-semibold">Capa da loja</Label><label className="mt-2 flex h-36 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-ceu-navy/10 bg-card">
      {data.cover_image ? <img src={data.cover_image} alt="Capa da loja" className="h-full w-full object-cover" /> : <span className="flex items-center gap-2 text-sm text-ceu-navy/55">{uploading ? <Loader2 className="animate-spin" /> : <ImagePlus />} Selecionar imagem de capa</span>}
      <input type="file" accept="image/*" onChange={uploadCover} className="hidden" disabled={uploading} />
    </label></div>
    <div><Label htmlFor="store-name">Nome do estabelecimento / loja</Label><Input id="store-name" required value={data.store_name} onChange={(e) => onChange('store_name', e.target.value)} placeholder="Ex.: Ateliê Felipe & Céu" className="mt-2 h-12 rounded-xl" /></div>
    <div><Label htmlFor="store-slug">Endereço da sua loja</Label><div className="relative mt-2"><Globe2 className="absolute left-4 top-3.5 h-5 w-5 text-ceu-navy/40" /><Input id="store-slug" required value={data.store_slug} onChange={(e) => setSlug(e.target.value)} placeholder="nome-da-loja" className="h-12 rounded-xl pl-12" /></div><p className="mt-2 break-all text-xs text-ceu-navy/55">Seu link: {address}</p></div>
  </div>;
}