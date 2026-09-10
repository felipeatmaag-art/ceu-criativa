import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const empty = { meta_pixel_id: '', ga4_id: '', tiktok_pixel_id: '', custom_domain: '' };
export default function MarketingSettings({ user }) {
  const [record, setRecord] = useState(null), [form, setForm] = useState(empty), [status, setStatus] = useState('');
  useEffect(() => { if (!user?.id) return; base44.entities.ArtistSettings.filter({ artist_id: user.id }).then((items) => { setRecord(items[0] || null); setForm({ ...empty, ...(items[0] || {}) }); }); }, [user?.id]);
  const save = async () => {
    setStatus('Salvando...');
    const payload = { artist_id: user.id, ...form };
    const saved = record ? await base44.entities.ArtistSettings.update(record.id, payload) : await base44.entities.ArtistSettings.create(payload);
    setRecord(saved); setStatus('Configurações salvas.');
  };
  const fields = [['meta_pixel_id', 'Meta Pixel', 'Ex: 123456789'], ['ga4_id', 'Google Analytics 4', 'Ex: G-XXXXXXXXXX'], ['tiktok_pixel_id', 'TikTok Pixel', 'Ex: ABCDE12345'], ['custom_domain', 'Domínio personalizado', 'Ex: loja.seudominio.com']];
  return (
    <section className="rounded-2xl bg-white p-6 text-gray-900 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900">Marketing e rastreamento</h3><p className="mt-1 text-sm text-gray-500">Salve os identificadores usados nas campanhas da sua loja.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">{fields.map(([key, label, hint]) => <label key={key} className="text-sm font-medium text-gray-700">{label}<Input className="mt-2" value={form[key]} placeholder={hint} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}</div>
      <div className="mt-6 flex items-center gap-3"><Button onClick={save} className="bg-gray-900 text-white">Salvar configurações</Button>{status && <span className="text-sm text-gray-500">{status}</span>}</div>
    </section>
  );
}