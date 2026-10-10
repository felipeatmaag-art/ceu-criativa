import React, { useState } from 'react';
import {
  Sparkles,
  Eye,
  Check,
  Download,
  Loader2,
  Palette,
  Sliders,
  Type,
  Feather,
  Leaf,
  Shapes,
  Zap,
  BookOpen,
  SprayCan,
  Award,
  Dices
} from 'lucide-react';
import { prepareGeneratedArtwork } from '@/components/create/preparePrintArtwork';
import { getArtworkMetadata } from '@/components/create/artworkMetadata';
import VoiceDictationButton from '@/components/audio/VoiceDictationButton';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// Estilos artísticos disponíveis com presets especializados para estamparia
export const ARTISTIC_STYLES = [
  {
    id: 'typography',
    name: 'Tipografia Urbana',
    badge: 'Popular',
    icon: Type,
    accent: 'from-amber-500 to-orange-600',
    description: 'Lettering arrojado e moderno',
    promptSuffix: 'bold expressive urban typography lettering design, modern vector calligraphy, striking font hierarchy, clean sharp contours, high-contrast flat 2D vector graphic art only, isolated standalone decal sticker on pure solid flat green background #00FF00, pure flat graphic sticker only',
    suggestions: [
      'Lettering "CÉU É O LIMITE" com detalhes geométricos',
      'Frase motivacional "CRIE SEU PRÓPRIO UNIVERSO"',
      'Tipografia vintage "ORIGINAL BRASIL 1994" com florais',
      'Wordmark "RESISTÊNCIA & ARTE" estilo grafite moderno'
    ]
  },
  {
    id: 'minimalist',
    name: 'Minimalista & Linhas',
    badge: 'Elegante',
    icon: Feather,
    accent: 'from-slate-700 to-zinc-900',
    description: 'Traços finos e estética nórdica',
    promptSuffix: 'minimalist continuous line art, single stroke drawing, elegant modern silhouette, fine vector line art, simple sophisticated aesthetic, clean contours, flat graphic illustration decal, isolated on pure solid flat green background #00FF00, pure flat graphic only',
    suggestions: [
      'Rosto abstrato em traço contínuo com folha botânica',
      'Silhueta de montanhas e sol minimalista em linha fina',
      'Mãos se entrelaçando em estilo minimalista contemporâneo',
      'Contorno elegante de xícara de café com fumaça fluida'
    ]
  },
  {
    id: 'botanical',
    name: 'Botânica & Aquarela',
    badge: 'Orgânico',
    icon: Leaf,
    accent: 'from-emerald-500 to-teal-700',
    description: 'Folhagens e florais fluidos',
    promptSuffix: 'botanical watercolor illustration, lush tropical monstera and delicate exotic flora, vibrant watercolor pigments, fluid organic brushwork, artistic botanical graphic artwork decal, isolated on pure solid flat green background #00FF00, crisp vector edges, pure flat graphic only',
    suggestions: [
      'Arranjo de costela-de-adão tropical com toques dourados',
      'Jardim botânico abstrato com orquídeas e tucano sutil',
      'Ramo de café brasileiro com folhas e grãos em aquarela',
      'Folhagem amazônica exuberante com texturas vibrantes'
    ]
  },
  {
    id: 'geometric',
    name: 'Geométrico & Bauhaus',
    badge: 'Modernista',
    icon: Shapes,
    accent: 'from-blue-600 to-indigo-800',
    description: 'Formas puras e arquitetura',
    promptSuffix: 'Bauhaus constructivism inspired geometric composition, abstract bold geometric shapes, balanced chromatic palette, clean vector geometry, modern minimalist poster aesthetic, isolated decal on pure solid flat green background #00FF00, razor-sharp edges, pure flat graphic only',
    suggestions: [
      'Composição geométrica com círculos e arcos Bauhaus',
      'Padrão abstrato moderno com formas sobrepostas e cores primárias',
      'Sol nascente geométrico com linhas radiais e diagonais',
      'Abstracionismo arquitetônico com cubos e curvas limpas'
    ]
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk Retrô',
    badge: 'Vibrante',
    icon: Zap,
    accent: 'from-fuchsia-600 to-cyan-500',
    description: 'Neons e synthwave futurista',
    promptSuffix: 'cyberpunk synthwave aesthetic, glowing neon gradients, retro 1980s futuristic vector artwork, tech grid motifs, vibrant saturated colors, striking standalone graphic illustration decal, isolated on pure solid flat green background #00FF00, pure flat graphic only',
    suggestions: [
      'Pôr do sol synthwave com montanhas neon e grade wireframe',
      'Carro esportivo retrô futurista 1986 em velocidade neon',
      'Fita cassete estilizada com raios elétricos e cores cyberpunk',
      'Capacete cibernético com reflexos roxos e ciano neon'
    ]
  },
  {
    id: 'xilogravura',
    name: 'Gravura & Cordel',
    badge: 'Autoral',
    icon: BookOpen,
    accent: 'from-amber-800 to-stone-900',
    description: 'Entalhe rústico brasileiro',
    promptSuffix: 'Brazilian cordel woodcut print style, traditional xilogravura woodblock carving engraving, expressive carved lines, dramatic stark contrast, folk cultural art aesthetic, isolated standalone woodcut graphic decal on pure solid flat green background #00FF00, sharp woodcut edges, pure flat graphic only',
    suggestions: [
      'Sol e lua em xilogravura tradicional de cordel nordestino',
      'Onça-pintada estilizada em gravura de entalhe em madeira',
      'Pássaro carcará em xilogravura com flores do sertão',
      'Cacto mandacaru sob o luar em estilo cordel brasileiro'
    ]
  },
  {
    id: 'street_art',
    name: 'Street & Grafite',
    badge: 'Urbano',
    icon: SprayCan,
    accent: 'from-rose-500 to-violet-600',
    description: 'Stencils e arte urbana',
    promptSuffix: 'urban street art stencil graffiti style, expressive acrylic paint splatters, dynamic street culture illustration, crisp vector stenciling, pop-culture edge, standalone graphic artwork decal, isolated on pure solid flat green background #00FF00, pure flat graphic only',
    suggestions: [
      'Urso polar com fones de ouvido em estilo grafite urbano',
      'Coração anatômico estilizado com spray e respingos de tinta',
      'Skate voador com asas em arte de rua colorida e dinâmica',
      'Tigre rugindo em stencil de grafite multicolorido'
    ]
  },
  {
    id: 'vintage',
    name: 'Vintage Emblema',
    badge: 'Clássico',
    icon: Award,
    accent: 'from-amber-700 to-yellow-600',
    description: 'Selos e estética retrô',
    promptSuffix: 'vintage badge emblem logo design, classic outdoors adventure stamp, ornate heritage typography, intricate retro filigree, circular seal aesthetic, crisp standalone vector badge decal, isolated on pure solid flat green background #00FF00, pure flat graphic only',
    suggestions: [
      'Emblema circular "CLUBE DOS VIAJANTES" com bússola e pinheiros',
      'Selo vintage de cafeteria artesanal com grãos e ornamentos',
      'Brasão retrô de surfe com onda estilizada e sol poente',
      'Emblema de montanhismo e expedição com lema em arco'
    ]
  }
];

export default function ArtisticPrintGenerator({
  onArtworkSelected,
  onSwitchToUpload,
  productType = 'camiseta',
  productColor = 'black',
  activeArtworkUrl = null,
  disabled = false,
  className = ''
}) {
  const [selectedStyleId, setSelectedStyleId] = useState('typography');
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [history, setHistory] = useState([]);
  const [currentArtworkUrl, setCurrentArtworkUrl] = useState(activeArtworkUrl);

  // Estado do Modal de Visualização Prévia (Preview)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewBg, setPreviewBg] = useState('checkerboard'); // 'checkerboard', 'black', 'white'
  const [previewZoom, setPreviewZoom] = useState(1);

  const selectedStyle = ARTISTIC_STYLES.find(s => s.id === selectedStyleId) || ARTISTIC_STYLES[0];
  const isDarkFabric = /black|preto|preta|navy|marinho|dark|escuro|escura|chumbo/i.test(productColor || '');

  // Aprimorar Prompt com Gemini
  const handleEnhancePrompt = async () => {
    if (!prompt.trim() || isEnhancingPrompt) return;
    setIsEnhancingPrompt(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/gemini/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          productType,
          productColor,
          style: selectedStyle.name
        })
      });
      const data = await response.json();
      if (data.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      } else if (data.suggestions?.[0]) {
        setPrompt(data.suggestions[0]);
      }
    } catch (err) {
      console.warn('Falha no aprimoramento de prompt:', err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  // Chamada Principal à API de IA para Gerar Estampa
  const handleGenerateArtwork = async () => {
    if (!prompt.trim() || isGenerating || disabled) return;

    setIsGenerating(true);
    setErrorMessage('');
    setGenerationStep('Consultando IA Gemini...');

    try {
      // Monta o prompt calibrado com o estilo artístico e foco estrito em decalque gráfico
      const cleanPrompt = prompt.trim()
        .replace(/\b(camiseta|camisa|blusa|baby\s*look|moletom|t-?shirt|regata|polo|jaqueta|vestu[aá]rio)\s+preta\s+(de|com|do|da)?\b/gi, 'arte gráfica vetorial em alto contraste com ')
        .replace(/\b(camiseta|camisa|blusa|baby\s*look|moletom|t-?shirt|regata|polo|jaqueta|vestu[aá]rio)\s+branca\s+(de|com|do|da)?\b/gi, 'arte gráfica vetorial com ')
        .replace(/\b(camiseta|camisa|blusa|baby\s*look|moletom|t-?shirt|regata|polo|jaqueta|vestu[aá]rio)\s+(de|com|do|da)?\b/gi, 'ilustração vetorial de ')
        .replace(/\b(estampa|desenho|arte)\s+(para|de|em|pra)\s+(camiseta|camisa|blusa|roupa|moletom|t-?shirt)\b/gi, 'ilustração gráfica vetorial isolada')
        .replace(/\b(em\s+uma|numa|na|no)\s+(camiseta|camisa|blusa|roupa|moletom|t-?shirt)\b/gi, 'em formato decalque adesivo')
        .replace(/\b(camiseta|camisetas|camisa|camisas|t-?shirts?|roupas|roupa|moletom)\b/gi, 'arte gráfica');

      let fullPrompt = `Pure standalone 2D vector graphic design decal sticker, isolated screenprint graphic illustration, sharp clean crisp contour edges, centered on solid flat vibrant green background #00FF00.
Subject: ${cleanPrompt}.
Style Details: ${selectedStyle.promptSuffix}`;

      if (isDarkFabric) {
        fullPrompt += '\n\nColor Contrast: High-contrast bright vivid palette (pure white, cream, vibrant light tones, bold highlights) designed to pop with brilliant contrast on dark surfaces.';
      }

      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio: '1:1',
          productType,
          productColor,
          colorName: productColor
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro ${res.status} ao gerar estampa com a IA.`);
      }

      const data = await res.json();
      if (!data.url) {
        throw new Error('A IA não retornou o arquivo da estampa. Tente novamente.');
      }

      setGenerationStep('Removendo fundo e gerando PNG de alta resolução...');

      // Processa a imagem bruta com remoção cirúrgica de fundo (#00FF00) e transparência
      const processedPngUrl = await prepareGeneratedArtwork(data.url);

      setCurrentArtworkUrl(processedPngUrl);
      setHistory(prev => [
        {
          url: processedPngUrl,
          rawUrl: data.url,
          prompt,
          style: selectedStyle,
          date: new Date().toISOString()
        },
        ...prev.filter(item => item.url !== processedPngUrl)
      ]);

      // Notifica o componente pai
      if (onArtworkSelected) {
        onArtworkSelected(processedPngUrl, {
          style: selectedStyle,
          prompt
        });
      }
    } catch (err) {
      console.error('Erro na geração artística de estampa:', err);
      setErrorMessage(err.message || 'Não foi possível gerar a estampa. Tente com outra descrição.');
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  // Metadados da arte atual para o modal de prévia
  const currentMetadata = currentArtworkUrl ? getArtworkMetadata(currentArtworkUrl) : null;

  return (
    <div className={`space-y-5 rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm ${className}`}>
      {/* Barra superior de status simples */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Criar Arte
        </span>

        {/* Indicador de contraste da peça */}
        <div className="flex items-center gap-1.5 text-xs bg-muted/60 px-2.5 py-1 rounded-full border border-border/40">
          <Palette className="w-3 h-3 text-muted-foreground" />
          <span className="text-muted-foreground">Tecido:</span>
          <span className="font-semibold text-foreground capitalize">{productColor}</span>
        </div>
      </div>

      {/* 1. SELETOR DE ESTILO ARTÍSTICO */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-primary" />
            Estilo
          </Label>
          <span className="text-xs font-medium text-foreground">
            {selectedStyle.name}
          </span>
        </div>

        {/* Grid de Estilos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {ARTISTIC_STYLES.map((style) => {
            const isSelected = selectedStyleId === style.id;
            const Icon = style.icon;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => setSelectedStyleId(style.id)}
                disabled={isGenerating || disabled}
                className={`group relative flex flex-col items-start p-2.5 sm:p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20'
                    : 'border-border/70 hover:border-border hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-br ${style.accent} text-white shadow-xs`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  {style.badge && (
                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground">
                      {style.badge}
                    </span>
                  )}
                </div>
                <span className="font-bold text-xs text-foreground block truncate w-full mt-0.5">
                  {style.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. CAMPO DE PROMPT E DESCRIÇÃO */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Descrição da Estampa
          </Label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const available = selectedStyle.suggestions;
                const pick = available[Math.floor(Math.random() * available.length)];
                setPrompt(pick);
              }}
              disabled={isGenerating || disabled}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-full transition-colors disabled:opacity-40"
              title="Sortear uma ideia"
            >
              <Dices className="w-3.5 h-3.5 text-purple-600" />
              Inspirar
            </button>
            <button
              type="button"
              onClick={handleEnhancePrompt}
              disabled={isGenerating || isEnhancingPrompt || !prompt.trim() || disabled}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-2.5 py-1 rounded-full transition-colors disabled:opacity-40"
            >
              {isEnhancingPrompt ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Aprimorando...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Aprimorar
                </>
              )}
            </button>
            <VoiceDictationButton
              onTranscript={(spoken) => setPrompt((prev) => (prev ? `${prev} ${spoken}` : spoken))}
              disabled={isGenerating || disabled}
              buttonText="Narrar por Voz"
            />
          </div>
        </div>

        <Textarea
          placeholder={`Descreva sua estampa...`}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating || disabled}
          rows={2}
          className="rounded-2xl resize-none text-sm bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-900 focus-visible:border-slate-900 shadow-sm"
        />

        {/* Sugestões rápidas simples */}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {selectedStyle.suggestions.slice(0, 3).map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setPrompt(suggestion)}
              disabled={isGenerating || disabled}
              className="text-[11px] bg-muted/60 hover:bg-muted text-foreground/80 hover:text-foreground px-2.5 py-1 rounded-full border border-border/50 transition-colors truncate max-w-[220px]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Mensagem de Erro */}
      {errorMessage && (
        <div className="p-3 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs">
          {errorMessage}
        </div>
      )}

      {/* 3. BOTÕES PRINCIPAIS DE AÇÃO (GERAR & VISUALIZAÇÃO PRÉVIA) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        {/* Botão Gerar Estampa */}
        <Button
          type="button"
          onClick={handleGenerateArtwork}
          disabled={isGenerating || !prompt.trim() || disabled}
          className="h-12 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:opacity-95 transition-all text-sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {generationStep || 'Gerando...'}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Gerar Estampa
            </>
          )}
        </Button>

        {/* BOTÃO DE VISUALIZAÇÃO PRÉVIA */}
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsPreviewOpen(true)}
          disabled={!currentArtworkUrl}
          className={`h-12 rounded-2xl font-semibold border-2 transition-all text-sm ${
            currentArtworkUrl
              ? 'border-primary/40 hover:border-primary text-foreground hover:bg-primary/5 shadow-sm'
              : 'border-border/60 text-muted-foreground opacity-60 cursor-not-allowed'
          }`}
        >
          <Eye className="w-4 h-4 mr-2 text-primary" />
          Visualização Prévia
          {currentArtworkUrl && (
            <span className="ml-1.5 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          )}
        </Button>
      </div>

      {/* 4. HISTÓRICO DE ESTAMPAS GERADAS NESTA SESSÃO */}
      {history.length > 0 && (
        <div className="pt-4 border-t border-border/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Estampas desta sessão ({history.length})
            </Label>
            <span className="text-[11px] text-muted-foreground">Clique para aplicar</span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {history.map((item, index) => {
              const isSelected = currentArtworkUrl === item.url;
              return (
                <div
                  key={index}
                  onClick={() => {
                    setCurrentArtworkUrl(item.url);
                    if (onArtworkSelected) {
                      onArtworkSelected(item.url, {
                        style: item.style,
                        prompt: item.prompt
                      });
                    }
                  }}
                  className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-primary ring-2 ring-primary/20 shadow-md'
                      : 'border-border/60 hover:border-border hover:shadow-sm'
                  }`}
                  style={{
                    backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
                    backgroundSize: '12px 12px',
                    backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px'
                  }}
                >
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="w-full h-full object-contain p-1 transition-transform group-hover:scale-105"
                  />
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. MODAL DE VISUALIZAÇÃO PRÉVIA (PREVIEW DIALOG) */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl rounded-3xl p-6 sm:p-8 bg-card border-border shadow-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  Visualização Prévia da Estampa
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  Examine os detalhes da arte recortada, resolução de impressão e simulação sobre diferentes fundos
                </DialogDescription>
              </div>

              {/* Seletor de fundo do preview */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl shrink-0">
                <button
                  type="button"
                  title="Fundo transparente quadriculado"
                  onClick={() => setPreviewBg('checkerboard')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    previewBg === 'checkerboard' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Transparente
                </button>
                <button
                  type="button"
                  title="Testar em fundo preto"
                  onClick={() => setPreviewBg('black')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    previewBg === 'black' ? 'bg-black text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Preto
                </button>
                <button
                  type="button"
                  title="Testar em fundo branco"
                  onClick={() => setPreviewBg('white')}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-all ${
                    previewBg === 'white' ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Branco
                </button>
              </div>
            </div>
          </DialogHeader>

          {/* Área Central de Visualização */}
          <div className="space-y-4 my-2">
            <div
              className="relative w-full aspect-square max-h-[420px] rounded-2xl overflow-hidden border border-border/80 flex items-center justify-center transition-colors"
              style={{
                backgroundColor: previewBg === 'black' ? '#09090b' : previewBg === 'white' ? '#ffffff' : undefined,
                backgroundImage: previewBg === 'checkerboard'
                  ? 'linear-gradient(45deg, #e4e4e7 25%, transparent 25%), linear-gradient(-45deg, #e4e4e7 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e4e4e7 75%), linear-gradient(-45deg, transparent 75%, #e4e4e7 75%)'
                  : 'none',
                backgroundSize: '16px 16px',
                backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px'
              }}
            >
              {currentArtworkUrl ? (
                <img
                  src={currentArtworkUrl}
                  alt="Pré-visualização da Estampa"
                  style={{
                    transform: `scale(${previewZoom})`,
                    transition: 'transform 0.2s ease-out'
                  }}
                  className="max-w-[85%] max-h-[85%] object-contain select-none filter drop-shadow-md"
                />
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma estampa selecionada.</p>
              )}

              {/* Controles de Zoom */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-card/90 backdrop-blur-md px-2 py-1 rounded-xl border border-border/60 shadow">
                <button
                  type="button"
                  onClick={() => setPreviewZoom(1)}
                  className={`text-xs px-2 py-0.5 rounded font-medium ${previewZoom === 1 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  100%
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(1.5)}
                  className={`text-xs px-2 py-0.5 rounded font-medium ${previewZoom === 1.5 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  150%
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewZoom(2)}
                  className={`text-xs px-2 py-0.5 rounded font-medium ${previewZoom === 2 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  200%
                </button>
              </div>
            </div>

            {/* Ficha Técnica da Estampa */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-muted/50 border border-border/50 text-xs">
              <div>
                <span className="text-muted-foreground block text-[11px]">Dimensões</span>
                <span className="font-semibold text-foreground">
                  {currentMetadata?.width ? `${currentMetadata.width} × ${currentMetadata.height} px` : '2048 × 2048 px'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Resolução de Impressão</span>
                <span className="font-semibold text-emerald-600">300 DPI (Alta Definição)</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Transparência</span>
                <span className="font-semibold text-foreground">Fundo Limpo (Alpha 100%)</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[11px]">Estilo Selecionado</span>
                <span className="font-semibold text-foreground truncate block">{selectedStyle.name}</span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/60">
            <div className="text-xs text-muted-foreground text-left w-full sm:w-auto">
              Arquivo otimizado para Silk Digital (DTG) e Serigrafia.
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {currentArtworkUrl && (
                <a
                  href={currentArtworkUrl}
                  download={`estampa-${selectedStyle.id}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center h-10 px-4 rounded-xl border border-border hover:bg-muted text-xs font-semibold transition-colors"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Baixar PNG
                </a>
              )}
              <Button
                type="button"
                onClick={() => {
                  if (onArtworkSelected && currentArtworkUrl) {
                    onArtworkSelected(currentArtworkUrl, {
                      style: selectedStyle,
                      prompt
                    });
                  }
                  setIsPreviewOpen(false);
                }}
                className="h-10 px-5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Aplicar no Produto
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
