import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import {
  Sparkles,
  Upload,
  Wand2,
  Image as ImageIcon,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  RefreshCw,
  ShoppingBag } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductSelector from '@/components/create/ProductSelector';
import TshirtMockup from '@/components/create/TshirtMockup';
import MugMockup from '@/components/create/MugMockup';
import FrameMockup from '@/components/create/FrameMockup';
import InteractiveMockupViewer from '@/components/create/InteractiveMockupViewer';
import ArtworkSidesPanel from '@/components/create/ArtworkSidesPanel';
import MockupStyleGenerator from '@/components/create/MockupStyleGenerator';
import CatalogProductMockup from '@/components/create/CatalogProductMockup';
import ProductColorSelector from '@/components/create/ProductColorSelector';
import ProductSizeSelector from '@/components/create/ProductSizeSelector';
import { prepareGeneratedArtwork, prepareUploadedArtwork } from '@/components/create/preparePrintArtwork';
import BackArtworkGenerator from '@/components/create/BackArtworkGenerator';
import { validateArtworkFile, getArtworkMetadata, rememberArtwork } from '@/components/create/artworkMetadata';
import productViews from '@/components/create/productViews';
import useStudioSubmission from '@/components/create/useStudioSubmission';
import PrintApproval from '@/components/create/PrintApproval';

const PRODUCTS = [
  { value: 'camiseta', label: 'Camiseta' },
  { value: 'baby_look', label: 'Baby Look' },
  { value: 'caneca', label: 'Caneca' },
  { value: 'quadro', label: 'Quadro' }
];

export default function Create() {
  const navigate = useNavigate();
  const requestedProduct = new URLSearchParams(window.location.search).get('product');
  const hasRequestedProduct = PRODUCTS.some((product) => product.value === requestedProduct);
  const [mode, setMode] = useState('ai');
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStage, setUploadStage] = useState('Enviando...');
  const [uploadError, setUploadError] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [backBusy, setBackBusy] = useState(false);
  const [approved, setApproved] = useState(false);
  const [customBaseImages, setCustomBaseImages] = useState({ front: null, back: null });

  const [aiPrompt, setAiPrompt] = useState('');
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const [designData, setDesignData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    price_base: 49.90
  });

  const [selectedProduct, setSelectedProduct] = useState(hasRequestedProduct ? requestedProduct : 'camiseta');
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [selectedCatalogId, setSelectedCatalogId] = useState(null);
  const [productColor, setProductColor] = useState('white');
  const [selectedSize, setSelectedSize] = useState('');

  const [backDesignImage, setBackDesignImage] = useState(null);
  const [editorSide, setEditorSide] = useState('front');
  const [designTransforms, setDesignTransforms] = useState({
    front: { x: 0, y: 0, scale: 1, rotation: 0 },
    back: { x: 0, y: 0, scale: 1, rotation: 0 }
  });
  const [generatedMockups, setGeneratedMockups] = useState([]);
  const [mockupStyle, setMockupStyle] = useState('studio');

  useEffect(() => {
    base44.entities.Product.filter({ catalog_product: true, is_active: true }, '-created_date', 100).then((items) => {
      setCatalogProducts(items);
      if (items.length) {
        const chosen = items.find((item) => item.type === requestedProduct) || items[0];
        setSelectedCatalogId(chosen.id);
        setSelectedProduct(chosen.type);
        setProductColor(chosen.product_color_variants?.[0]?.name || 'white');
        setSelectedSize('');
      }
      if (new URLSearchParams(window.location.search).get('resume') === '1') {
        const draft = JSON.parse(sessionStorage.getItem('ceu-studio-resume') || 'null');
        if (draft) {
          Object.entries(draft.artwork || {}).forEach(([url, metadata]) => rememberArtwork(url, metadata));
          setSelectedImage(draft.frontImage); setBackDesignImage(draft.backImage);
          setDesignTransforms(draft.transforms); setDesignData(draft.designData);
          setSelectedProduct(draft.productType); setSelectedCatalogId(draft.product?.id || null);
          setProductColor(draft.color); setSelectedSize(draft.size); setMode(draft.mode);
          setCustomBaseImages(draft.customBaseImages || { front: null, back: null });
          setGeneratedMockups(draft.generatedMockups || []); setStep(3);
        }
      }
    });
  }, [requestedProduct]);

  const categories = [
  { value: 'abstrato', label: 'Abstrato' },
  { value: 'natureza', label: 'Natureza' },
  { value: 'urbano', label: 'Urbano' },
  { value: 'minimalista', label: 'Minimalista' },
  { value: 'ilustracao', label: 'Ilustração' },
  { value: 'tipografia', label: 'Tipografia' },
  { value: 'geometrico', label: 'Geométrico' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'pop_art', label: 'Pop Art' },
  { value: 'surreal', label: 'Surreal' }];


  const promptSuggestions = [
  "Frase divertida com tipografia retrô e cores vibrantes",
  "Ilustração botânica centralizada em estilo serigrafia",
  "Composição geométrica abstrata com formas fluidas",
  "Mascote original em traço cartoon para estampa",
  "Lettering motivacional com elementos decorativos",
  "Ilustração minimalista de natureza em duas cores",
  "Arte urbana com lettering e textura de spray",
  "Emblema vintage com frase e ornamentos gráficos"];


  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setGenerationError('');
    setGeneratedImages([]);

    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Você é Iara, uma designer especializada exclusivamente em criar estampas. Crie SOMENTE a arte gráfica plana solicitada pelo usuário: "${aiPrompt}". Mostre apenas os desenhos, símbolos e textos que compõem a estampa, isolados e centralizados em formato quadrado, com alta definição e canal alfa realmente transparente. Nunca desenhe grade, tabuleiro, quadriculado ou padrão visual para representar transparência. Se o canal alfa nativo não estiver disponível, use somente um fundo técnico verde puro #00FF00, plano e uniforme, sem usar essa cor na arte. Se o pedido contiver uma frase, reproduza o texto exatamente como foi escrito, sem corrigir, trocar ou acrescentar palavras. É terminantemente proibido desenhar ou mostrar camiseta, roupa, caneca, quadro, produto, manequim, pessoa vestindo, embalagem, etiqueta, mockup, ambiente, cenário ou a estampa aplicada em qualquer superfície. Não inclua bordas de fotografia ou sombras externas. Mantenha uma margem vazia nas quatro bordas, sem tocar nos limites. A saída deve ser exclusivamente o arquivo gráfico plano da estampa.`
      });

      if (!result?.url) throw new Error('A geração não retornou uma imagem. Tente novamente.');
      const pngUrl = await prepareGeneratedArtwork(result.url);
      setGeneratedImages([pngUrl]);
      setSelectedImage(pngUrl);
    } catch (error) {
      setGenerationError(error.message || 'Não foi possível gerar e validar a arte. Tente novamente.');
    } finally { setIsGenerating(false); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError(''); setIsUploading(true); setUploadStage('Validando imagem...');
    try {
      await validateArtworkFile(file);
      setUploadStage('Enviando imagem...');
      const result = await base44.integrations.Core.UploadFile({ file });
      if (!result?.file_url) throw new Error('O envio da imagem não foi concluído.');
      setUploadStage('Reconstruindo e preparando sua imagem...');
      setSelectedImage(await prepareUploadedArtwork(file, result.file_url));
    } catch (error) { setUploadError(error.message || 'Não foi possível preparar a imagem.'); }
    finally { setIsUploading(false); e.target.value = ''; }
  };

  const productPrices = {
    camiseta: 49.90,
    baby_look: 49.90,
    quadro: 89.90,
    caneca: 39.90
  };

  const productSizes = {
    camiseta: ['P', 'M', 'G', 'GG'],
    baby_look: ['P', 'M', 'G', 'GG'],
    quadro: ['30x40cm', '50x70cm', '70x100cm'],
    caneca: ['Padrão']
  };

  const colors = [
  { name: 'white', label: 'Branco', hex: '#FFFFFF' },
  { name: 'black', label: 'Preto', hex: '#000000' },
  { name: 'navy', label: 'Azul Marinho', hex: '#1e3a8a' },
  { name: 'gray', label: 'Cinza', hex: '#6b7280' }];


  const selectedCatalogProduct = catalogProducts.find((product) => product.id === selectedCatalogId);
  const availableColors = selectedCatalogProduct?.product_color_variants?.length ? selectedCatalogProduct.product_color_variants : colors;
  const studioProducts = catalogProducts.length ? catalogProducts.map((product) => ({ value: product.id, type: product.type, label: product.name, price: product.base_price, image: product.front_model_url })) : PRODUCTS.map((product) => ({ ...product, type: product.value, price: productPrices[product.value] }));
  const currentPrice = Number(selectedCatalogProduct?.base_price ?? productPrices[selectedProduct]);
  const currentSizes = selectedCatalogProduct?.sizes_available?.length ? selectedCatalogProduct.sizes_available : productSizes[selectedProduct];
  const busy = isGenerating || isUploading || backBusy;
  const views = { ...productViews(selectedCatalogProduct, productColor) };
  if (customBaseImages.front) views.front = customBaseImages.front;
  if (customBaseImages.back) views.back = customBaseImages.back;
  const { submit, saving: isSaving, error: saveError } = useStudioSubmission({ frontImage: selectedImage, backImage: backDesignImage, transforms: designTransforms, views, product: selectedCatalogProduct, color: productColor, size: selectedSize, productType: selectedProduct, price: currentPrice, designData, mode, approved, generatedMockups, mockupStyle, customBaseImages });
  useEffect(() => { setApproved(false); }, [selectedImage, backDesignImage, designTransforms, selectedCatalogId, productColor, selectedSize, customBaseImages]);
  const handleProductChange = (value) => {
    setCustomBaseImages({ front: null, back: null });
    const catalogProduct = catalogProducts.find((product) => product.id === value);
    setSelectedCatalogId(catalogProduct?.id || null);
    setSelectedProduct(catalogProduct?.type || value);
    setProductColor(catalogProduct?.product_color_variants?.[0]?.name || 'white');
    setSelectedSize('');
  };

  const stepLabels = ['Produto', 'Sua Arte', 'Finalizar'];
  const activeTransform = designTransforms[editorSide];
  const activeDesignImage = editorSide === 'back' ? backDesignImage : selectedImage;
  const handleTransformChange = (nextTransform) => setDesignTransforms((current) => ({ ...current, [editorSide]: nextTransform }));
  const handleMockupsGenerated = ({ style, items }) => {
    setMockupStyle(style);
    setGeneratedMockups(items);
  };

  const renderMockup = (designImage, side = 'front') => {
    if (selectedCatalogProduct?.front_model_url) return <CatalogProductMockup product={selectedCatalogProduct} side={side} color={productColor} />;
    return (
      <>
        {(selectedProduct === 'camiseta' || selectedProduct === 'baby_look') && (
          <TshirtMockup designImage={designImage} color={productColor} side={side} />
        )}
        {selectedProduct === 'quadro' && <FrameMockup designImage={designImage} />}
        {selectedProduct === 'caneca' && <MugMockup designImage={designImage} />}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-ceu-cloud py-12">
      <div className={`${step === 2 && selectedImage ? 'max-w-screen-2xl' : 'max-w-7xl'} mx-auto px-4`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ceu-navy/10 text-ceu-navy text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Estúdio de Criação
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Crie sua Estampa
          </h1>
          <p className="text-xl text-gray-500 max-w-xl mx-auto">
            Escolha o produto, anexe sua arte e veja o resultado na hora
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) =>
          <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
            step >= s ?
            'bg-ceu-navy text-ceu-cloud' :
            'bg-gray-100 text-gray-400'}`
            }>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              <span className={`hidden sm:block font-medium ${
            step >= s ? 'text-gray-900' : 'text-gray-400'}`
            }>
                {stepLabels[s - 1]}
              </span>
              {s < 3 && <div className="w-16 h-0.5 bg-gray-200 hidden sm:block" />}
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Select Product */}
          {step === 1 &&
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-card rounded-3xl border border-ceu-navy/10 shadow-xl p-8">

            <div className="text-center mb-8">
              <Label className="text-lg font-semibold mb-1 block text-gray-900">
                Escolha o produto
              </Label>
              <p className="text-gray-500 text-sm">
                Selecione onde sua estampa será aplicada
              </p>
            </div>

            <div className="mb-8">
              <ProductSelector products={studioProducts} value={selectedCatalogId || selectedProduct} onChange={handleProductChange} />
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Outline Preview */}
              <div>
                <Label className="text-base font-semibold mb-3 block text-gray-900">
                  Outline do produto
                </Label>
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#F5F5F7] shadow-sm group">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedProduct + productColor}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                    >
                      {renderMockup(null)}
                    </motion.div>
                  </AnimatePresence>
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur text-xs font-medium text-gray-600">
                    Aguardando sua arte
                  </div>
                </div>
              </div>

              {/* Color + Info */}
              <div className="space-y-6">
                {(selectedCatalogProduct?.product_color_variants?.length || (!selectedCatalogProduct && (selectedProduct === 'camiseta' || selectedProduct === 'baby_look'))) &&
                <ProductColorSelector options={availableColors} value={productColor} onChange={setProductColor} />
                }

                <ProductSizeSelector options={currentSizes} value={selectedSize} onChange={setSelectedSize} />

                <div className="bg-purple-50 rounded-2xl p-5">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {selectedCatalogProduct?.name || PRODUCTS.find((p) => p.value === selectedProduct)?.label}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {selectedCatalogProduct ? [selectedCatalogProduct.material, selectedCatalogProduct.fit, selectedCatalogProduct.description].filter(Boolean).join(' • ') : selectedProduct === 'camiseta' ? 'Camiseta 100% algodão, impressão DTG de alta resolução.' : selectedProduct === 'baby_look' ? 'Baby look feminina 100% algodão, corte ajustado ao corpo.' : selectedProduct === 'quadro' ? 'Quadro decorativo com moldura de madeira.' : 'Caneca cerâmica 325ml, impressão sublimática.'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Preço base</span>
                    <span className="text-2xl font-bold ceu-text-gradient">
                      R$ {currentPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedSize}
                  className="w-full h-14 rounded-xl bg-ceu-navy text-ceu-cloud text-lg hover:bg-ceu-navy/90">
                  Continuar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
          }

          {/* Step 2: Attach Art */}
          {step === 2 &&
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-card rounded-3xl border border-ceu-navy/10 shadow-xl p-8">

            <div className="flex items-center justify-between mb-6">
              <div>
                <Label className="text-lg font-semibold mb-1 block text-gray-900">
                  Anexe sua arte
                </Label>
                <p className="text-gray-500 text-sm">
                  Veja sua estampa aplicada no outline do produto
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Trocar produto
              </Button>
            </div>

            <div className={`grid gap-8 ${selectedImage ? 'xl:grid-cols-[minmax(0,2fr)_minmax(24rem,1fr)]' : 'lg:grid-cols-2'}`}>
              {/* Mockup with applied design */}
              <div>
                <Label className="text-base font-semibold mb-3 block text-gray-900">
                  Pré-visualização
                </Label>
                <div className={`relative rounded-3xl bg-[#F5F5F7] shadow-sm ${selectedImage ? '' : 'aspect-square overflow-hidden'}`}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedProduct + productColor}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full"
                    >
                      <InteractiveMockupViewer
                        productType={selectedProduct}
                        designImage={activeDesignImage}
                        color={productColor}
                        renderMockup={(art) => renderMockup(art, editorSide)}
                        transform={activeTransform}
                        onTransformChange={handleTransformChange}
                        side={editorSide}
                        onSideChange={setEditorSide}
                        productViews={views}
                        customBaseImages={customBaseImages}
                        onBaseImagesChange={setCustomBaseImages}
                      />
                    </motion.div>
                  </AnimatePresence>
                  {!selectedImage && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="text-center text-gray-400 bg-white/70 backdrop-blur px-6 py-4 rounded-2xl">
                        <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm font-medium">Sua arte aparecerá aqui</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI / Upload Tabs */}
              <div>
                <Tabs value={mode} onValueChange={setMode} className="w-full">
                  <TabsList className="w-full grid grid-cols-2 h-12 rounded-2xl bg-gray-100 p-1">
                    <TabsTrigger value="ai" className="rounded-xl h-full data-[state=active]:bg-white data-[state=active]:shadow">
                      <Wand2 className="w-4 h-4 mr-2" />
                      Criar com IA
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="rounded-xl h-full data-[state=active]:bg-white data-[state=active]:shadow">
                      <Upload className="w-4 h-4 mr-2" />
                      Fazer Upload
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="ai" className="mt-6" forceMount>
                    <div className="space-y-5">
                      <div>
                        <Label className="text-base font-semibold mb-3 block">
                          Descreva sua estampa
                        </Label>
                        <Textarea
                        placeholder="Ex: Arte abstrata com cores vibrantes, formas geométricas fluidas, estilo moderno..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)} className="bg-transparent text-zinc-950 px-3 py-2 text-base rounded-xl flex min-h-[60px] w-full border border-input shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-28 resize-none" />

                      </div>

                      <div>
                        <p className="text-sm text-gray-500 mb-2">Sugestões:</p>
                        <div className="flex flex-wrap gap-2">
                          {promptSuggestions.map((suggestion, i) =>
                        <button
                          key={i}
                          onClick={() => setAiPrompt(suggestion)}
                          className="px-3 py-1.5 rounded-full border border-ceu-navy/15 bg-card text-ceu-navy text-xs hover:bg-ceu-navy/5 transition-colors">

                            {suggestion.substring(0, 30)}...
                          </button>
                        )}
                        </div>
                      </div>

                      <Button
                      onClick={handleGenerateAI}
                      disabled={busy || !aiPrompt.trim()}
                      className="w-full h-12 rounded-xl bg-ceu-navy text-ceu-cloud hover:bg-ceu-navy/90">

                        {isGenerating ?
                      <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Gerando sua arte...
                        </> :

                      <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Gerar com IA
                        </>
                    }
                      </Button>

                      {generationError && <p role="alert" className="text-sm text-destructive">{generationError}</p>}
                      {generatedImages.length > 0 &&
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4">

                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-base font-semibold">Resultado</Label>
                          <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerateAI}
                        disabled={busy}>

                            <RefreshCw className="w-4 h-4 mr-2" />
                            Gerar outra
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {generatedImages.map((img, i) =>
                    <div
                      key={i}
                      onClick={() => setSelectedImage(img)}
                      className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${
                    selectedImage === img ?
                    'border-purple-500 shadow-lg' :
                    'border-transparent hover:border-gray-200'}`
                    }>

                              <img
                        src={img}
                        alt="Design gerado"
                        className="w-full h-full object-cover" />

                              {selectedImage === img &&
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                    }
                            </div>
                  )}
                        </div>
                      </motion.div>
                  }
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="mt-6" forceMount>
                    <div className="space-y-5">
                      <div
                      className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
                      isUploading ?
                      'border-ceu-navy bg-ceu-navy/5' :
                      'border-ceu-navy/20 hover:border-ceu-navy/50 hover:bg-ceu-navy/5'}`
                      }>

                        <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={busy} />

                        
                        {isUploading ?
                      <div className="flex flex-col items-center">
                          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-3" />
                          <p className="text-purple-600 font-medium">{uploadStage}</p>
                        </div> :

                      <>
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-ceu-navy/10 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-ceu-navy" />
                          </div>
                          <p className="text-lg font-medium text-gray-900 mb-1">
                            Arraste sua imagem aqui
                          </p>
                          <p className="text-gray-500 mb-3 text-sm">
                            ou clique para selecionar
                          </p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG ou WEBP • a partir de 256 px • máximo 10 MB<br />Imagens menores são reconstruídas e preparadas automaticamente para impressão
                          </p>
                          {uploadError && <p className="mt-3 text-sm font-medium text-destructive">{uploadError}</p>}
                        </>
                    }
                      </div>


                    </div>
                  </TabsContent>
                </Tabs>

                {/* Persisted selected image indicator — shared across both tabs */}
                {selectedImage &&
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 flex items-center gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <img src={selectedImage} alt="Arte selecionada" className="w-14 h-14 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-emerald-700 flex items-center gap-1">
                      <Check className="w-4 h-4" /> Imagem reconstruída e validada
                    </p>
                    <p className="text-xs text-emerald-600 truncate">
                      {mode === 'ai' ? 'Gerada com IA' : 'Enviada por upload'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedImage(null)}
                    className="text-gray-500 hover:text-red-500 h-8">
                    Remover
                  </Button>
                </motion.div>
                }

                {selectedImage && (selectedProduct === 'camiseta' || selectedProduct === 'baby_look') && (
                  <>
                    <ArtworkSidesPanel
                      frontImage={selectedImage}
                      backImage={backDesignImage}
                      onBackChange={setBackDesignImage}
                      onBusyChange={setBackBusy}
                      disabled={busy}
                    />
                    <BackArtworkGenerator
                      frontImage={selectedImage}
                      description={aiPrompt}
                      backImage={backDesignImage}
                      onGenerated={setBackDesignImage}
                      onBusyChange={setBackBusy}
                      disabled={busy}
                    />
                  </>
                )}

                {/* Continue */}
                {selectedImage &&
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-6 border-t">

                  <Button
                onClick={() => setStep(3)}
                disabled={busy || !selectedSize}
                className="w-full h-14 rounded-xl ceu-gradient text-white text-lg">

                    Continuar
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              }
              </div>
            </div>
          </motion.div>
          }

          {/* Step 3: Details & Cart */}
          {step === 3 &&
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}>

            <div className="bg-white rounded-3xl shadow-xl p-8 mb-6">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: Mockup Preview */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-lg font-semibold text-gray-900">Visualize seu Produto</Label>
                    <Button variant="ghost" size="sm" onClick={() => setStep(2)}>
                      <ArrowLeft className="w-4 h-4 mr-1" />
                      Voltar
                    </Button>
                  </div>

                  <div className="mb-6 rounded-2xl border border-ceu-navy/15 bg-card p-4">
                    <p className="text-xs font-bold uppercase tracking-widest text-ceu-navy/45">Produto selecionado</p>
                    <p className="mt-1 font-bold text-ceu-navy">{selectedCatalogProduct?.name || PRODUCTS.find((product) => product.value === selectedProduct)?.label}</p>
                  </div>

                  {/* Color Selector */}
                  {(selectedCatalogProduct?.product_color_variants?.length || (!selectedCatalogProduct && (selectedProduct === 'camiseta' || selectedProduct === 'baby_look'))) &&
                  <div className="mb-6"><ProductColorSelector options={availableColors} value={productColor} onChange={setProductColor} label="Cor" /></div>
                  }

                  {/* Mockup Display */}
                  <div className="relative rounded-3xl bg-muted shadow-sm">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={selectedProduct + productColor}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        className="w-full h-full"
                      >
                        <InteractiveMockupViewer
                          productType={selectedProduct}
                          designImage={activeDesignImage}
                          color={productColor}
                          renderMockup={(art) => renderMockup(art, editorSide)}
                          transform={activeTransform}
                          onTransformChange={handleTransformChange}
                          side={editorSide}
                          onSideChange={setEditorSide}
                        productViews={views}
                        customBaseImages={customBaseImages}
                        onBaseImagesChange={setCustomBaseImages}
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>

                {/* Right: Details Form + Product Options */}
                <div className="space-y-5">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-1">
                      {designData.title || 'Sua Estampa'}
                    </h3>
                    <p className="text-gray-600 text-sm">{designData.description || 'Detalhe sua criação abaixo'}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Nome da Estampa *
                    </Label>
                    <Input
                    placeholder="Ex: Aurora Boreal"
                    value={designData.title}
                    onChange={(e) => setDesignData({ ...designData, title: e.target.value })}
                    className="h-11 rounded-xl" />

                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Descrição
                    </Label>
                    <Textarea
                    placeholder="Conte a história por trás da sua arte..."
                    value={designData.description}
                    onChange={(e) => setDesignData({ ...designData, description: e.target.value })}
                    className="h-20 rounded-xl resize-none" />

                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Categoria *
                    </Label>
                    <Select
                    value={designData.category}
                    onValueChange={(v) => setDesignData({ ...designData, category: v })}>

                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) =>
                    <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                    )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Tags
                    </Label>
                    <Input
                    placeholder="arte, abstrato, cores (separadas por vírgula)"
                    value={designData.tags}
                    onChange={(e) => setDesignData({ ...designData, tags: e.target.value })}
                    className="h-11 rounded-xl" />

                  </div>

                  <MockupStyleGenerator
                    productType={selectedProduct}
                    color={productColor}
                    frontImage={selectedImage}
                    backImage={backDesignImage}
                    onGenerated={handleMockupsGenerated}
                  />

                  <div className="bg-purple-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 text-sm">Preço do produto</span>
                      <span className="text-xl font-bold ceu-text-gradient">
                        R$ {currentPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Sua comissão (30%)</span>
                      <span className="font-semibold text-green-600">
                        R$ {(currentPrice * 0.3).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <PrintApproval front={selectedImage} back={backDesignImage} transforms={designTransforms} approved={approved} onChange={setApproved} disabled={busy || isSaving} />
                  {saveError && <p role="alert" className="text-sm text-destructive">{saveError}</p>}
                  <Button onClick={() => submit('cart')} disabled={busy || isSaving || !approved || !designData.title.trim() || !designData.category || !selectedSize} className="w-full h-14 rounded-xl bg-primary text-primary-foreground">
                    {isSaving ? <><Loader2 className="animate-spin" /> Salvando arquivos...</> : <><ShoppingBag /> Aprovar e ir para o carrinho</>}
                  </Button>
                  <Button
                  onClick={() => submit('publish')}
                  disabled={busy || isSaving || !approved || !designData.title.trim() || !designData.category || !selectedSize}
                  className="w-full h-14 rounded-xl bg-ceu-navy text-ceu-cloud text-lg hover:bg-ceu-navy/90">

                    {isSaving ?
                  <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Salvando...
                    </> :

                  <>
                      Publicar estampa
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                }
                  </Button>
                </div>
              </div>
            </div>

          </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}