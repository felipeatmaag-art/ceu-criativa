import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Check, Loader2, Upload } from 'lucide-react';

export default function ArtworkSidesPanel({ frontImage, backImage, onBackChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const uploadBack = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError('');
    const dimensions = await new Promise((resolve) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.width, height: image.height });
      image.src = URL.createObjectURL(file);
    });
    if (file.size > 10 * 1024 * 1024 || dimensions.width < 2000 || dimensions.height < 2000) {
      setError('Use uma arte de no mínimo 2000 × 2000 px e até 10 MB.');
      return;
    }
    setUploading(true);
    const result = await base44.integrations.Core.UploadFile({ file });
    onBackChange(result.file_url);
    setUploading(false);
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-ceu-navy/15 bg-card p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-ceu-navy"><Check className="w-4 h-4" />Frente</div>
          <img src={frontImage} alt="Arte da frente" className="mt-3 h-20 w-full rounded-xl bg-muted object-contain" />
        </div>
        <label className="relative cursor-pointer rounded-2xl border border-ceu-navy/15 bg-card p-3 hover:border-ceu-navy">
          <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={uploadBack} disabled={uploading} />
          <div className="flex items-center gap-2 text-sm font-semibold text-ceu-navy">{uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}Costas</div>
          {backImage ? <img src={backImage} alt="Arte das costas" className="mt-3 h-20 w-full rounded-xl bg-muted object-contain" /> : <p className="mt-4 text-xs text-muted-foreground">Adicionar arte no mesmo padrão.</p>}
        </label>
      </div>
      {error && <p className="mt-2 text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}