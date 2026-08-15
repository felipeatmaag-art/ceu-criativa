import React, { useState } from 'react';
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
import ProductOptionButton from '@/components/create/ProductOptionButton';
import TshirtMockup from '@/components/create/TshirtMockup';
import MugMockup from '@/components/create/MugMockup';
import FrameMockup from '@/components/create/FrameMockup';

const PRODUCTS = [
  { value: 'camiseta', label: 'Camiseta', icon: '👕' },
  { value: 'moletom', label: 'Moletom', icon: '🧥' },
  { value: 'quadro', label: 'Quadro', icon: '🖼️' },
  { value: 'caneca', label: 'Caneca', icon: '☕' },
  { value: 'caneca_termica', label: 'Térmica', icon: '🥤' },
  { value: 'mousepad', label: 'Mousepad', icon: '🖱️' }
];

export default function Create() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('ai'); // 'ai' or 'upload'
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const [selectedProduct, setSelectedProduct] = useState('camiseta');
  const [productColor, setProductColor] = useState('white');
  const [cart, setCart] = useState([]);

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
  "Retrato artístico de mulher forte e empoderada",
  "Pessoa sorrindo com cores vibrantes e alegres",
  "Família abraçada em ilustração calorosa",
  "Retrato de criança com olhar sonhador",
  "Diversidade humana celebrada em cores",
  "Mãos entrelaçadas representando união",
  "Rosto feminino com flores e natureza",
  "Pessoa meditando em paz e harmonia"];


  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setGeneratedImages([]);

    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Design de estampa para camiseta, arte digital de alta qualidade: ${aiPrompt}. Estilo moderno, cores vibrantes, fundo transparente ou sólido.`
      });

      if (result?.url) {
        setGeneratedImages([result.url]);
        setSelectedImage(result.url);
      }
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
    }

    setIsGenerating(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result?.file_url) {
        setSelectedImage(result.file_url);
      }
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
    }

    setIsUploading(false);
  };

  const handleSaveDesign = async () => {
    if (!selectedImage || !designData.title || !designData.category) return;

    setIsSaving(true);

    try {
      const user = await base44.auth.me();

      await base44.entities.Design.create({
        ...designData,
        image_url: selectedImage,
        artist_id: user.id,
        artist_name: user.artist_name || user.full_name,
        tags: designData.tags.split(',').map((t) => t.trim()).filter((t) => t),
        is_ai_generated: mode === 'ai',
        status: 'pendente',
        commission_rate: 30
      });

      setStep(3);
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }

    setIsSaving(false);
  };

  const handleAddToCart = (productType, size = null, quantity = 1) => {
    const product = {
      id: Date.now(),
      design_image: selectedImage,
      design_title: designData.title,
      product_type: productType,
      price: productPrices[productType],
      color: productColor,
      size: size,
      quantity: quantity
    };
    setCart([...cart, product]);
  };

  const handlePublishOnly = async () => {
    setIsSaving(true);
    try {
      navigate(createPageUrl('MyDesigns'));
    } catch (error) {
      console.error('Erro:', error);
    }
    setIsSaving(false);
  };

  const handleGoToCart = () => {
    localStorage.setItem('cart', JSON.stringify(cart));
    navigate(createPageUrl('Cart'));
  };

  const productPrices = {
    camiseta: 49.90,
    moletom: 89.90,
    quadro: 89.90,
    caneca: 39.90,
    caneca_termica: 69.90,
    mousepad: 29.90
  };

  const productSizes = {
    camiseta: ['P', 'M', 'G', 'GG'],
    moletom: ['P', 'M', 'G', 'GG'],
    quadro: ['30x40cm', '50x70cm', '70x100cm'],
    caneca: ['Padrão'],
    caneca_termica: ['500ml'],
    mousepad: ['Médio', 'Grande', 'XL']
  };

  const colors = [
  { name: 'white', label: 'Branco', hex: '#FFFFFF' },
  { name: 'black', label: 'Preto', hex: '#000000' },
  { name: 'navy', label: 'Azul Marinho', hex: '#1e3a8a' },
  { name: 'gray', label: 'Cinza', hex: '#6b7280' }];


  const stepLabels = ['Produto', 'Sua Arte', 'Finalizar'];

  const renderMockup = (designImage) => {
    return (
      <>
        {selectedProduct === 'camiseta' && <TshirtMockup designImage={designImage} color={productColor} />}
        {selectedProduct === 'moletom' && <TshirtMockup designImage={designImage} color={productColor} />}
        {selectedProduct === 'quadro' && <FrameMockup designImage={designImage} />}
        {selectedProduct === 'caneca' && <MugMockup designImage={designImage} />}
        {(selectedProduct === 'caneca_termica' || selectedProduct === 'mousepad') && (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <span className="text-6xl block mb-2">
                {selectedProduct === 'caneca_termica' ? '🥤' : '🖱️'}
              </span>
              <p className="text-sm font-medium">Preview em breve</p>
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
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
            'ceu-gradient text-white' :
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
            className="bg-white rounded-3xl shadow-xl p-8">

            <div className="text-center mb-8">
              <Label className="text-lg font-semibold mb-1 block text-gray-900">
                Escolha o produto
              </Label>
              <p className="text-gray-500 text-sm">
                Selecione onde sua estampa será aplicada
              </p>
            </div>

            {/* Product Type Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {PRODUCTS.map((prod) =>
              <button
                key={prod.value}
                onClick={() => setSelectedProduct(prod.value)}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl font-medium transition-all ${
                selectedProduct === prod.value ?
                'ceu-gradient text-white shadow-lg scale-105' :
                'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                }>

                  <span className="text-3xl">{prod.icon}</span>
                  <span className="text-sm">{prod.label}</span>
                  <span className={`text-xs ${selectedProduct === prod.value ? 'text-white/80' : 'text-gray-400'}`}>
                    R$ {productPrices[prod.value].toFixed(2)}
                  </span>
                </button>
              )}
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
                {(selectedProduct === 'camiseta' || selectedProduct === 'moletom') &&
                <div>
                  <Label className="text-sm font-semibold mb-3 block text-gray-900 tracking-tight">Cor do produto</Label>
                  <div className="flex gap-3">
                    {colors.map((color) =>
                    <button
                      key={color.name}
                      onClick={() => setProductColor(color.name)}
                      className={`relative w-12 h-12 rounded-full transition-all duration-300 hover:scale-110 ${
                      productColor === color.name ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : 'ring-1 ring-gray-200 hover:ring-gray-300'}`
                      }
                      style={{ backgroundColor: color.hex }}
                      title={color.label}>
                      {productColor === color.name && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className={`w-2 h-2 rounded-full ${color.name === 'white' ? 'bg-gray-900' : 'bg-white'}`} />
                        </span>
                      )}
                    </button>

                    )}
                  </div>
                </div>
                }

                <div className="bg-purple-50 rounded-2xl p-5">
                  <h3 className="font-bold text-gray-900 mb-1">
                    {PRODUCTS.find((p) => p.value === selectedProduct)?.label}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3">
                    {selectedProduct === 'camiseta' && 'Camiseta 100% algodão, impressão DTG de alta resolução.'}
                    {selectedProduct === 'moletom' && 'Moletom premium com capuz, estampa durável.'}
                    {selectedProduct === 'quadro' && 'Quadro decorativo com moldura de madeira.'}
                    {selectedProduct === 'caneca' && 'Caneca cerâmica 325ml, impressão sublimática.'}
                    {selectedProduct === 'caneca_termica' && 'Caneca térmica inox 500ml, mantém temperatura.'}
                    {selectedProduct === 'mousepad' && 'Mousepad com base emborrachada, tecido premium.'}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 font-medium">Preço base</span>
                    <span className="text-2xl font-bold ceu-text-gradient">
                      R$ {productPrices[selectedProduct].toFixed(2)}
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full h-14 rounded-xl ceu-gradient text-white text-lg">
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
            className="bg-white rounded-3xl shadow-xl p-8">

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

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Mockup with applied design */}
              <div>
                <Label className="text-base font-semibold mb-3 block text-gray-900">
                  Pré-visualização
                </Label>
                <div className="relative aspect-square rounded-3xl overflow-hidden bg-[#F5F5F7] shadow-sm">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={selectedProduct + productColor + (selectedImage || 'empty')}
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="w-full h-full"
                    >
                      {renderMockup(selectedImage)}
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

                  <TabsContent value="ai" className="mt-6">
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
                          className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-xs hover:bg-purple-100 transition-colors">

                            {suggestion.substring(0, 30)}...
                          </button>
                        )}
                        </div>
                      </div>

                      <Button
                      onClick={handleGenerateAI}
                      disabled={isGenerating || !aiPrompt.trim()}
                      className="w-full h-12 rounded-xl ceu-gradient text-white">

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
                        disabled={isGenerating}>

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

                  <TabsContent value="upload" className="mt-6">
                    <div className="space-y-5">
                      <div
                      className={`relative border-2 border-dashed rounded-3xl p-10 text-center transition-all ${
                      isUploading ?
                      'border-purple-500 bg-purple-50' :
                      'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'}`
                      }>

                        <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={isUploading} />

                        
                        {isUploading ?
                      <div className="flex flex-col items-center">
                          <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-3" />
                          <p className="text-purple-600 font-medium">Enviando...</p>
                        </div> :

                      <>
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-100 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-purple-500" />
                          </div>
                          <p className="text-lg font-medium text-gray-900 mb-1">
                            Arraste sua imagem aqui
                          </p>
                          <p className="text-gray-500 mb-3 text-sm">
                            ou clique para selecionar
                          </p>
                          <p className="text-xs text-gray-400">
                            PNG, JPG ou WEBP • Máx 10MB
                          </p>
                        </>
                    }
                      </div>

                      {selectedImage && mode === 'upload' &&
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center">

                        <p className="text-sm text-green-600 font-medium mb-2 flex items-center justify-center gap-1">
                          <Check className="w-4 h-4" /> Arte anexada com sucesso
                        </p>
                        <Button variant="ghost" size="sm" onClick={() => setSelectedImage(null)}>
                          Trocar imagem
                        </Button>
                      </motion.div>
                  }
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Continue */}
                {selectedImage &&
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 pt-6 border-t">

                  <Button
                onClick={() => setStep(3)}
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

                  {/* Product Type Selector */}
                  <div className="grid grid-cols-3 gap-2 mb-6">
                    {PRODUCTS.map((prod) =>
                    <button
                      key={prod.value}
                      onClick={() => setSelectedProduct(prod.value)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl font-medium transition-all ${
                    selectedProduct === prod.value ?
                    'ceu-gradient text-white shadow-lg scale-105' :
                    'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                    }>

                        <span className="text-2xl">{prod.icon}</span>
                        <span className="text-xs">{prod.label}</span>
                      </button>
                  )}
                  </div>

                  {/* Color Selector */}
                  {(selectedProduct === 'camiseta' || selectedProduct === 'moletom') &&
                <div className="mb-6">
                      <Label className="text-sm font-semibold mb-3 block text-gray-900 tracking-tight">Cor</Label>
                      <div className="flex gap-3">
                        {colors.map((color) =>
                    <button
                      key={color.name}
                      onClick={() => setProductColor(color.name)}
                      className={`relative w-11 h-11 rounded-full transition-all duration-300 hover:scale-110 ${
                    productColor === color.name ? 'ring-2 ring-offset-2 ring-gray-900 scale-110' : 'ring-1 ring-gray-200 hover:ring-gray-300'}`
                    }
                      style={{ backgroundColor: color.hex }}
                      title={color.label}>
                      {productColor === color.name && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className={`w-2 h-2 rounded-full ${color.name === 'white' ? 'bg-gray-900' : 'bg-white'}`} />
                        </span>
                      )}
                    </button>

                    )}
                      </div>
                    </div>
                }

                  {/* Mockup Display */}
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
                        {renderMockup(selectedImage)}
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

                  <div className="bg-purple-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600 text-sm">Preço do produto</span>
                      <span className="text-xl font-bold ceu-text-gradient">
                        R$ {productPrices[selectedProduct].toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Sua comissão (30%)</span>
                      <span className="font-semibold text-green-600">
                        R$ {(productPrices[selectedProduct] * 0.3).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button
                  onClick={handleSaveDesign}
                  disabled={isSaving || !designData.title || !designData.category}
                  className="w-full h-14 rounded-xl ceu-gradient text-white text-lg">

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

            {/* Cart Summary */}
            {cart.length > 0 &&
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-xl p-6 mb-6">

              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  Itens no Carrinho ({cart.length})
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setCart([])}>
                  Limpar
                </Button>
              </div>
              
              <div className="space-y-3 mb-4">
                {cart.map((item, idx) =>
            <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <img src={item.design_image} alt="" className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.product_type} - {item.size}</p>
                      <p className="text-xs text-gray-500">R$ {item.price.toFixed(2)}</p>
                    </div>
                    <button
                onClick={() => setCart(cart.filter((_, i) => i !== idx))}
                className="text-red-500 hover:text-red-700">

                      ×
                    </button>
                  </div>
            )}
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl mb-4">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold ceu-text-gradient">
                  R$ {cart.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
              variant="outline"
              onClick={handlePublishOnly}
              className="h-12 rounded-xl">

                  Apenas Publicar
                </Button>
                <Button
              onClick={handleGoToCart}
              className="h-12 rounded-xl ceu-gradient text-white">

                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Ir para Carrinho
                </Button>
              </div>
            </motion.div>
          }
          </motion.div>
          }
        </AnimatePresence>
      </div>
    </div>);

}