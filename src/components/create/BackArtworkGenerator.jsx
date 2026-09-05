import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { prepareGeneratedArtwork } from '@/components/create/preparePrintArtwork';

export default function BackArtworkGenerator({ frontImage, description, backImage, onGenerated, onBusyChange, disabled }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateBack = async () => {
    setIsGenerating(true); onBusyChange?.(true);
    setError('');
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Crie somente uma estampa traseira complementar à arte de referência. Mantenha exatamente a mesma linguagem visual, paleta de cores, traços e tema da frente descrita como: "${description}". Faça uma composição nova e mais simples para as costas, isolada, centralizada e com fundo totalmente transparente. Não mostre camiseta, roupa, produto, pessoa, manequim, mockup, cenário, etiqueta ou superfície. Entregue apenas o arquivo gráfico da estampa. Se não houver suporte a canal alfa nativo, use fundo branco puro uniforme, sem quadradinhos, sombras ou gradiente, e mantenha uma margem vazia em todas as bordas.`,
        existing_image_urls: [frontImage]
      });
      if (!result?.url) throw new Error('Não foi possível gerar a estampa das costas.');
      onGenerated(await prepareGeneratedArtwork(result.url));
    } catch (generationError) {
      setError(generationError.message || 'Não foi possível gerar a estampa das costas.');
    } finally { setIsGenerating(false); onBusyChange?.(false); }
  };

  return (
    <div className="mt-4 rounded-2xl border border-ceu-navy/10 bg-ceu-navy/5 p-4">
      <Button onClick={generateBack} disabled={isGenerating || disabled} className="w-full rounded-xl bg-ceu-navy text-ceu-cloud hover:bg-ceu-navy/90">
        {isGenerating ? <><Loader2 className="animate-spin" /> Gerando estampa das costas...</> : <><Sparkles /> {backImage ? 'Gerar novas costas' : 'Gerar estampa das costas'}</>}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}