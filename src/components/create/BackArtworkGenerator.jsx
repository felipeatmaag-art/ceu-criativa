import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { prepareGeneratedArtwork } from '@/components/create/preparePrintArtwork';
import { getPrintPrompt, getColorContrastPrompt } from '@/components/production/printStandards';

export default function BackArtworkGenerator({ frontImage, description, backImage, onGenerated, onBusyChange, disabled, productType, color = 'white', colorHex = '#FFFFFF' }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generateBack = async () => {
    setIsGenerating(true); onBusyChange?.(true);
    setError('');
    try {
      const contrastPrompt = getColorContrastPrompt(productType, color, color, colorHex);
      const cleanDesc = (description || '').replace(/\b(camiseta|camisas|camisa|t-?shirts?|roupas|roupa|moletom)\b/gi, 'arte gráfica');
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Pure 2D vector graphic design decal sticker, isolated screenprint graphic illustration: complementary back artwork inspired by "${cleanDesc}". ${getPrintPrompt(productType)} ${contrastPrompt} Mantenha exatamente a mesma linguagem visual, paleta de cores e traços da arte frontal. Composição decalque isolada e centralizada em fundo verde técnico #00FF00. Bordas nítidas, vãos vazados e arte gráfica plana pura.`,
        existing_image_urls: [frontImage].filter(Boolean),
        productColor: color,
        colorHex,
        productType
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
        {isGenerating ? <><Loader2 className="animate-spin" /> Gerando estampa das costas com Gemini...</> : <><Sparkles /> {backImage ? 'Gerar novas costas com Gemini' : 'Gerar estampa das costas com Gemini'}</>}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}