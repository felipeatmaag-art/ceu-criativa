import { UploadCloud, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import useBatchUpload from '@/components/profile/useBatchUpload';

const categories = ['abstrato', 'natureza', 'urbano', 'minimalista', 'ilustracao', 'tipografia', 'geometrico', 'vintage', 'pop_art', 'surreal'];

export default function BatchUploadTab({ user, onComplete }) {
  const batch = useBatchUpload(user, onComplete);
  return (
    <section className="rounded-3xl bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-bold text-ceu-navy">Subir Estampas em Lote</h2>
      <p className="mt-1 text-sm text-ceu-navy/60">Selecione várias artes; o nome de cada arquivo será usado como título.</p>
      <div className="mt-6 grid gap-5 md:grid-cols-[1fr_240px]">
        <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ceu-sky bg-ceu-cloud text-center">
          <UploadCloud className="mb-3 h-9 w-9 text-ceu-aqua" />
          <span className="font-semibold text-ceu-navy">Selecionar imagens</span>
          <span className="mt-1 text-sm text-ceu-navy/50">PNG transparente • 300 DPI recomendado</span>
          <input type="file" accept="image/png" multiple className="hidden" onChange={(e) => batch.chooseFiles(Array.from(e.target.files || []))} />
        </label>
        <div className="space-y-4">
          <div><Label>Categoria das estampas</Label><select value={batch.category} onChange={(e) => batch.setCategory(e.target.value)} className="mt-2 h-11 w-full rounded-xl border bg-white px-3 text-sm">{categories.map((item) => <option key={item} value={item}>{item.replace('_', ' ')}</option>)}</select></div>
          <div className="rounded-xl bg-ceu-cloud p-4 text-sm text-ceu-navy"><strong>{batch.files.length}</strong> arquivo(s) selecionado(s)</div>
          <Button onClick={batch.upload} disabled={!batch.files.length || batch.uploading} className="w-full rounded-xl bg-ceu-navy text-white">{batch.uploading ? <><Loader2 className="animate-spin" />Enviando...</> : 'Enviar para aprovação'}</Button>
          {batch.message && <p className="text-sm font-medium text-ceu-navy">{batch.message}</p>}
        </div>
      </div>
    </section>
  );
}