import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Loader2, Upload } from 'lucide-react';

export default function ArtworkSidesPanel({ frontImage, backImage, onBackChange }) {
  const [uploading, setUploading] = useState(false);
  const uploadBack = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const result = await base44.integrations.Core.UploadFile({ file });
    onBackChange(result.file_url);
    setUploading(false);
  };

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="rounded-2xl border bg-card p-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Check className="w-4 h-4 text-ceu-aqua" />Arte da frente</div>
        {frontImage && <img src={frontImage} alt="Arte da frente" className="mt-3 h-20 w-full rounded-xl object-contain bg-muted" />}
      </div>
      <label className="relative cursor-pointer rounded-2xl border bg-card p-3 hover:border-ceu-aqua">
        <input type="file" accept="image/*" className="hidden" onChange={uploadBack} disabled={uploading} />
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">{uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 text-ceu-aqua" />}Arte das costas</div>
        {backImage ? <img src={backImage} alt="Arte das costas" className="mt-3 h-20 w-full rounded-xl object-contain bg-muted" /> : <p className="mt-4 text-xs text-muted-foreground">Clique para adicionar uma arte diferente.</p>}
      </label>
    </div>
  );
}