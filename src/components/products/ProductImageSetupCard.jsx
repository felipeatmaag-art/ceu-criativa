import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import ProductColorPicker from '@/components/products/ProductColorPicker';
import ProductInfoFields from '@/components/products/ProductInfoFields';
import ProductActionsMenu from '@/components/products/ProductActionsMenu';
import productRepository from '@/services/products/productRepository';

export default function ProductImageSetupCard({ product, onUpdated, onDeleted }) {
  const savedColors = product.product_color_variants?.map(({ name, hex }) => ({ name, hex })) || [];
  const [files, setFiles] = useState({ front: null, back: null });
  const [colors, setColors] = useState(savedColors);
  const [material, setMaterial] = useState(product.material || '');
  const [fit, setFit] = useState(product.fit || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const colorsChanged = JSON.stringify(colors) !== JSON.stringify(savedColors);
  const infoChanged = material !== (product.material || '') || fit !== (product.fit || '');
  const hasImageWork = Boolean(files.front || files.back || colorsChanged);
  const upload = async (file) => file ? (await base44.integrations.Core.UploadFile({ file })).file_url : null;
  const generate = async (reference, color, side, createBack = false) => (await base44.integrations.Core.GenerateImage({ existing_image_urls: [reference], prompt: `Fotografia profissional de catálogo do mesmo ${product.name}, na cor ${color.name} (${color.hex}), vista de ${side}. ${createBack ? 'Crie a vista traseira coerente a partir da frente, mantendo exatamente modelagem, tecido, costuras e proporções.' : 'Preserve exatamente modelagem, tecido, costuras, textura e proporções da referência, alterando somente a cor.'} Item inteiro centralizado, fundo cinza-claro neutro, sem arte, texto, pessoa, cabide ou acessórios.` })).url;
  const save = async () => {
    setSaving(true); setError('');
    try {
      const payload = { material: material.trim(), fit: fit.trim() };
      if (hasImageWork) {
        const frontSource = await upload(files.front) || product.front_model_url;
        if (!frontSource) throw new Error('Envie a foto da frente.');
        if (!colors.length) throw new Error('Adicione pelo menos uma cor.');
        const backSource = await upload(files.back);
        const variants = await Promise.all(colors.map(async (color) => { const front_url = await generate(frontSource, color, 'frente'); const back_url = await generate(backSource || front_url, color, 'costas', !backSource); return { ...color, front_url, back_url }; }));
        Object.assign(payload, { front_model_url: variants[0].front_url, back_model_url: variants[0].back_url, product_color_variants: variants, colors_available: variants.map(({ name }) => name), is_active: true });
      }
      const updated = await productRepository.update(product.id, payload);
      setFiles({ front: null, back: null }); onUpdated(updated);
    } catch (cause) { setError(cause.message || 'Não foi possível salvar o produto.'); }
    setSaving(false);
  };
  const field = (side, label) => <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-ceu-navy/25 bg-ceu-cloud px-3 py-4 text-sm font-semibold active:scale-95"><Upload className="h-4 w-4" />{files[side]?.name || label}<input type="file" accept="image/*" className="sr-only" onChange={(event) => setFiles((current) => ({ ...current, [side]: event.target.files?.[0] || null }))} /></label>;
  return <article className="min-w-0 overflow-hidden rounded-3xl border bg-card p-5 text-ceu-navy shadow-sm"><div className="flex items-center gap-4"><div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-ceu-cloud">{product.front_model_url ? <img src={product.front_model_url} alt={product.name} className="h-full w-full object-contain" /> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Sem foto</div>}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h3 className="truncate font-bold">{product.name}</h3><div className="flex shrink-0 items-center gap-1"><span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${product.is_active ? 'bg-ceu-aqua/15 text-ceu-navy' : 'bg-muted text-muted-foreground'}`}>{product.is_active ? 'Pronto' : 'Pendente'}</span><ProductActionsMenu product={product} onUpdated={onUpdated} onDeleted={onDeleted} /></div></div><p className="mt-1 text-sm font-semibold">R$ {Number(product.base_price).toFixed(2).replace('.', ',')}</p></div></div><ProductInfoFields material={material} fit={fit} onMaterialChange={setMaterial} onFitChange={setFit} /><div className="mt-4 grid gap-3 sm:grid-cols-2">{field('front', product.front_model_url ? 'Trocar frente' : 'Anexar frente')}{field('back', 'Costas opcional')}</div><ProductColorPicker colors={colors} onChange={setColors} />{error && <p className="mt-3 text-sm text-destructive">{error}</p>}<Button type="button" disabled={saving || (!hasImageWork && !infoChanged)} onClick={save} className="mt-4 w-full rounded-full bg-ceu-navy text-ceu-cloud">{saving ? (hasImageWork ? `Gerando ${colors.length} variações...` : 'Salvando informações...') : (hasImageWork ? 'Gerar cores e salvar produto' : 'Salvar informações')}</Button></article>;
}