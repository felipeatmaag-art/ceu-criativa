import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import ProductFormFields from '@/components/products/ProductFormFields';
import ProductModelUploads from '@/components/products/ProductModelUploads';

const initial = { name: '', type: 'camiseta', material: '', fit: '', base_price: '49.90', sizes: '', colors: '', description: '' };
const list = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

export default function ProductCatalogForm({ onCreated }) {
  const [form, setForm] = useState(initial);
  const [files, setFiles] = useState({ front: null, back: null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const prepareModel = async (imageUrl, side) => {
    const result = await base44.integrations.Core.GenerateImage({
      existing_image_urls: [imageUrl],
      prompt: `Transforme esta foto caseira em uma fotografia profissional de catálogo do produto "${form.name}", visto de ${side}. Preserve rigorosamente o formato, modelagem ${form.fit}, material ${form.material}, cor, textura, costuras, proporções e todos os detalhes reais do item enviado. Remova apenas o ambiente e imperfeições da captura, centralize o produto inteiro, corrija iluminação e perspectiva e use fundo cinza-claro neutro de estúdio. Não adicione estampa, texto, logotipo, pessoa, cabide ou acessórios. Resultado fotográfico realista, frontal, nítido e pronto para receber uma arte no mock-up.`
    });
    return result.url;
  };
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const [front, back] = await Promise.all([base44.integrations.Core.UploadFile({ file: files.front }), files.back ? base44.integrations.Core.UploadFile({ file: files.back }) : null]);
      const [frontModel, backModel] = await Promise.all([prepareModel(front.file_url, 'frente'), back?.file_url ? prepareModel(back.file_url, 'costas') : null]);
      const product = await base44.entities.Product.create({ name: form.name, type: form.type, material: form.material, fit: form.fit, description: form.description, base_price: Number(form.base_price), sizes_available: list(form.sizes), colors_available: list(form.colors), front_model_url: frontModel, ...(backModel ? { back_model_url: backModel } : {}), catalog_product: true, is_active: true });
      setForm(initial); setFiles({ front: null, back: null }); onCreated(product);
    } catch (cause) { setError(cause.message || 'Não foi possível preparar e cadastrar o produto.'); }
    setSaving(false);
  };
  return <form onSubmit={submit} className="min-w-0 max-w-full space-y-6 overflow-hidden rounded-3xl border bg-card p-6 text-ceu-navy shadow-sm"><ProductFormFields form={form} onChange={(name, value) => setForm((current) => ({ ...current, [name]: value }))} /><ProductModelUploads files={files} onChange={(side, file) => setFiles((current) => ({ ...current, [side]: file }))} />{error && <p className="text-sm text-destructive">{error}</p>}<Button disabled={saving || !files.front} className="w-full rounded-full bg-ceu-navy text-ceu-cloud">{saving ? 'Preparando modelo...' : 'Preparar e cadastrar produto'}</Button></form>;
}