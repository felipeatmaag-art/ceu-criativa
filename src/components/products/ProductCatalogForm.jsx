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
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const [front, back] = await Promise.all([base44.integrations.Core.UploadFile({ file: files.front }), files.back ? base44.integrations.Core.UploadFile({ file: files.back }) : null]);
      const product = await base44.entities.Product.create({ name: form.name, type: form.type, material: form.material, fit: form.fit, description: form.description, base_price: Number(form.base_price), sizes_available: list(form.sizes), colors_available: list(form.colors), front_model_url: front.file_url, ...(back?.file_url ? { back_model_url: back.file_url } : {}), catalog_product: true, is_active: true });
      setForm(initial); setFiles({ front: null, back: null }); onCreated(product);
    } catch (cause) { setError(cause.message || 'Não foi possível cadastrar o produto.'); }
    setSaving(false);
  };
  return <form onSubmit={submit} className="min-w-0 max-w-full space-y-6 overflow-hidden rounded-3xl border bg-card p-6 text-ceu-navy shadow-sm"><ProductFormFields form={form} onChange={(name, value) => setForm((current) => ({ ...current, [name]: value }))} /><ProductModelUploads files={files} onChange={(side, file) => setFiles((current) => ({ ...current, [side]: file }))} />{error && <p className="text-sm text-destructive">{error}</p>}<Button disabled={saving || !files.front} className="w-full rounded-full bg-ceu-navy text-ceu-cloud">{saving ? 'Cadastrando...' : 'Cadastrar produto'}</Button></form>;
}