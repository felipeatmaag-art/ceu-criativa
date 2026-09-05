import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import ProductFormFields from '@/components/products/ProductFormFields';

const initial = { name: '', type: 'camiseta', material: '', fit: '', base_price: '49.90', sizes: '', colors: '', description: '' };
const list = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);

export default function ProductCatalogForm({ onCreated, onCancel }) {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const product = await base44.entities.Product.create({ name: form.name.trim(), type: form.type, material: form.material.trim(), fit: form.fit.trim(), description: form.description.trim(), base_price: Number(form.base_price), sizes_available: list(form.sizes), colors_available: list(form.colors), catalog_product: true, is_active: false });
      setForm(initial); onCreated(product);
    } catch (cause) { setError(cause.message || 'Não foi possível cadastrar o produto.'); setSaving(false); }
  };
  return <form onSubmit={submit} className="min-w-0 max-w-full space-y-6 text-ceu-navy"><ProductFormFields form={form} onChange={(name, value) => setForm((current) => ({ ...current, [name]: value }))} />{error && <p className="text-sm text-destructive" role="alert">{error}</p>}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="outline" disabled={saving} onClick={onCancel} className="rounded-full">Cancelar</Button><Button disabled={saving} className="rounded-full bg-ceu-navy px-6 text-ceu-cloud">{saving ? 'Cadastrando...' : 'Cadastrar produto'}</Button></div></form>;
}