import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MockupResults from '@/components/create/MockupResults';

const STYLES = { studio: 'estúdio profissional minimalista', external: 'área externa com luz natural', beige: 'estúdio com fundo bege editorial', artistic: 'cenário artístico contemporâneo' };
const ANGLES = { front: 'Frente', back: 'Costas', left: '45° esquerda', right: '45° direita' };

export default function MockupStyleGenerator({ productType, color, frontImage, backImage, onGenerated }) {
  const [style, setStyle] = useState('studio');
  const [angles, setAngles] = useState(['front', 'back']);
  const [results, setResults] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const toggleAngle = (angle) => setAngles((current) => current.includes(angle) ? current.filter((item) => item !== angle) : [...current, angle]);
  const generate = async () => {
    setGenerating(true); setResults([]); setError('');
    try {
      const generated = await Promise.all(angles.map(async (angle) => {
        const reference = angle === 'back' && backImage ? backImage : frontImage;
        const result = await base44.integrations.Core.GenerateImage({
          prompt: `Mockup fotográfico comercial de ${productType}, cor ${color}, vista ${ANGLES[angle]}, em ${STYLES[style]}. Aplicar fielmente a arte de referência na peça, respeitando proporção, textura do tecido, iluminação realista e sem textos adicionais.`,
          existing_image_urls: [reference]
        });
        return { angle, label: ANGLES[angle], url: result.url };
      }));
      setResults(generated); onGenerated({ style, items: generated });
    } catch {
      setError('Não foi possível gerar os mockups. Tente novamente.');
    }
    setGenerating(false);
  };
  return (
    <div className="rounded-3xl border bg-muted/40 p-5">
      <h3 className="font-bold text-foreground">Mockups para o catálogo</h3>
      <p className="mt-1 text-sm text-muted-foreground">Escolha o ambiente e os ângulos que a IA deve produzir.</p>
      <div className="mt-4 grid grid-cols-2 gap-2">{Object.entries(STYLES).map(([key, label]) => <button key={key} onClick={() => setStyle(key)} className={`rounded-xl border px-3 py-3 text-left text-xs font-semibold ${style === key ? 'border-ceu-aqua bg-ceu-aqua/10 text-ceu-navy' : 'bg-card text-muted-foreground'}`}>{label}</button>)}</div>
      <div className="mt-4 flex flex-wrap gap-2">{Object.entries(ANGLES).map(([key, label]) => <button key={key} onClick={() => toggleAngle(key)} className={`rounded-full px-3 py-2 text-xs font-semibold ${angles.includes(key) ? 'bg-ceu-navy text-white' : 'bg-card border text-muted-foreground'}`}>{label}</button>)}</div>
      <Button onClick={generate} disabled={generating || !frontImage || !angles.length} className="mt-4 h-12 w-full rounded-full bg-ceu-aqua text-ceu-navy hover:bg-ceu-sky">{generating ? <><Loader2 className="w-4 h-4 animate-spin" />Gerando mockups...</> : <><Sparkles className="w-4 h-4" />Gerar imagens com IA</>}</Button>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <MockupResults results={results} />
    </div>
  );
}