import React, { useState } from 'react';
import productRepository from '@/services/products/productRepository';
import { Button } from '@/components/ui/button';
import ProductFormFields from '@/components/products/ProductFormFields';

const list = (value) => value.split(',').map((item) => item.trim()).filter(Boolean);
const valuesFrom = (product) => ({
  name: product.name || '', type: product.type || 'camiseta', material: product.material || '',
  fit: product.fit || '', base_price: String(product.base_price ?? ''),
  sizes: (product.sizes_available || []).join(', '), colors: (product.colors_available || []).join(', '),
  description: product.description || ''
});

export default function ProductEditForm({ product, onUpdated, onCancel }) {
  const [form, setForm] = useState(() => valuesFrom(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    const sizes = list(form.sizes);
    if (!sizes.length) { setError('Informe ao menos um tamanho antes de salvar as alterações.'); return; }
    setSaving(true); setError('');
    try {
      const updated = await productRepository.update(product.id, { name: form.name.trim(), type: form.type, material: form.material.trim(), fit: form.fit.trim(), description: form.description.trim(), base_price: Number(form.base_price), sizes_available: sizes, colors_available: list(form.colors) });
      onUpdated(updated);
    } catch (cause) { setError(cause.message || 'Não foi possível salvar as alterações.'); setSaving(false); }
  };
  const hasSizes = list(form.sizes).length > 0;
  return <form onSubmit={submit} className="min-w-0 max-w-full space-y-6 text-ceu-navy"><ProductFormFields form={form} onChange={(name, value) => setForm((current) => ({ ...current, [name]: value }))} />{error && <p className="text-sm text-destructive" role="alert">{error}</p>}<div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button type="button" variant="outline" disabled={saving} onClick={onCancel} className="rounded-full">Cancelar</Button><Button disabled={saving || !hasSizes} className="rounded-full bg-ceu-navy px-6 text-ceu-cloud">{saving ? 'Salvando...' : 'Salvar alterações'}</Button></div></form>;
}