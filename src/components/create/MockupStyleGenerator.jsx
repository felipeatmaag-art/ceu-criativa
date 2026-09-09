import React, { useEffect, useRef, useState } from 'react';
import generateCatalogMockups from '@/components/create/generateCatalogMockups';
import { hasPrintStage } from '@/components/create/studioMockups';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MockupResults from '@/components/create/MockupResults';

const STYLES = { studio: 'estúdio profissional minimalista', external: 'área externa com luz natural', beige: 'estúdio com fundo bege editorial', artistic: 'cenário artístico contemporâneo' };
const ANGLES = { front: 'Frente', back: 'Costas' };

export default function MockupStyleGenerator({ options, onGenerated, onBusyChange }) {
  const availableAngles = hasPrintStage(options.productType) && options.views?.back ? ANGLES : { front: ANGLES.front };
  const [style, setStyle] = useState('studio');
  const [angles, setAngles] = useState(Object.keys(availableAngles));
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; onBusyChange(false); }; }, [onBusyChange]);
  const [results, setResults] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const toggleAngle = (angle) => setAngles((current) => current.includes(angle) ? current.filter((item) => item !== angle) : [...current, angle]);
  const generate = async () => {
    setGenerating(true); setResults([]); setError(''); onBusyChange(true);
    try {
      const generated = await generateCatalogMockups(options, style, STYLES[style], angles);
      if (active.current) { setResults(generated); onGenerated({ style, items: generated }); }
    } catch (e) {
      if (active.current) setError(e.message || 'Não foi possível gerar os mockups. Tente novamente.');
    } finally { if (active.current) { setGenerating(false); onBusyChange(false); } }
  };
  return (
    <div className="rounded-3xl border bg-muted/40 p-5">
      <h3 className="font-bold text-foreground">Mockups para o catálogo</h3>
      <p className="mt-1 text-sm text-muted-foreground">Sua aplicação fica fixa. A IA cria apenas o fundo; posição, tamanho e rotação não mudam. Usamos somente vistas reais disponíveis, sem inventar ângulos.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">{Object.entries(STYLES).map(([key, label]) => <button key={key} disabled={generating} onClick={() => setStyle(key)} className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold ${style === key ? 'border-ceu-aqua bg-ceu-aqua/10 text-ceu-navy' : 'bg-card text-muted-foreground'}`}>{label}</button>)}</div>
      <div className="mt-4 flex flex-wrap gap-2">{Object.entries(availableAngles).map(([key, label]) => <button key={key} disabled={generating} onClick={() => toggleAngle(key)} className={`rounded-full px-3 py-2 text-xs font-semibold ${angles.includes(key) ? 'bg-ceu-navy text-white' : 'bg-card border text-muted-foreground'}`}>{label}</button>)}</div>
      <Button onClick={generate} disabled={generating || !options.frontImage || !angles.length} className="mt-4 h-12 w-full rounded-full bg-ceu-aqua text-ceu-navy hover:bg-ceu-sky">{generating ? <><Loader2 className="w-4 h-4 animate-spin" />Gerando mockups...</> : <><Sparkles className="w-4 h-4" />Gerar mockups fiéis</>}</Button>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <MockupResults results={results} />
    </div>
  );
}