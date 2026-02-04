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
  Check,
  RefreshCw,
  ShoppingBag,
  CreditCard } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductOptionButton from '@/components/create/ProductOptionButton';
import TshirtMockup from '@/components/create/TshirtMockup';
import MugMockup from '@/components/create/MugMockup';
import FrameMockup from '@/components/create/FrameMockup';

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
    // Salvar carrinho no localStorage
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
            Use inteligência artificial ou faça upload da sua arte
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
                {s === 1 ? 'Criar Design' : s === 2 ? 'Detalhes' : 'Visualizar'}
              </span>
              {s < 3 && <div className="w-16 h-0.5 bg-gray-200 hidden sm:block" />}
            </div>
          )}
        </div>

        {/* Step 1: Create/Upload */}
        <AnimatePresence mode="wait">
          {step === 1 &&
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-xl p-8">

              <Tabs value={mode} onValueChange={setMode} className="w-full">
                <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 h-14 rounded-2xl bg-gray-100 p-1">
                  <TabsTrigger value="ai" className="rounded-xl h-full data-[state=active]:bg-white data-[state=active]:shadow">
                    <Wand2 className="w-4 h-4 mr-2" />
                    Criar com IA
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="rounded-xl h-full data-[state=active]:bg-white data-[state=active]:shadow">
                    <Upload className="w-4 h-4 mr-2" />
                    Fazer Upload
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="ai" className="mt-8">
                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold mb-3 block">
                        Descreva sua estampa
                      </Label>
                      <Textarea
                      placeholder="Ex: Arte abstrata com cores vibrantes, formas geométricas fluidas, estilo moderno..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)} className="bg-transparent text-zinc-950 px-3 py-2 text-lg rounded-xl flex min-h-[60px] w-full border border-input shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-32 resize-none" />


                    </div>

                    {/* Suggestions */}
                    <div>
                      <p className="text-sm text-gray-500 mb-3">Sugestões:</p>
                      <div className="flex flex-wrap gap-2">
                        {promptSuggestions.map((suggestion, i) =>
                      <button
                        key={i}
                        onClick={() => setAiPrompt(suggestion)}
                        className="px-3 py-1.5 rounded-full bg-purple-50 text-purple-700 text-sm hover:bg-purple-100 transition-colors">

                            {suggestion.substring(0, 30)}...
                          </button>
                      )}
                      </div>
                    </div>

                    <Button
                    onClick={handleGenerateAI}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="w-full h-14 rounded-xl ceu-gradient text-white text-lg">

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

                    {/* Generated Images */}
                    {generatedImages.length > 0 &&
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8">

                        <div className="flex items-center justify-between mb-4">
                          <Label className="text-lg font-semibold">Resultado</Label>
                          <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleGenerateAI}
                        disabled={isGenerating}>

                            <RefreshCw className="w-4 h-4 mr-2" />
                            Gerar outra
                          </Button>
                        </div>
                        <div className="grid gap-4">
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
                        <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                                  <Check className="w-5 h-5 text-white" />
                                </div>
                        }
                            </div>
                      )}
                        </div>
                      </motion.div>
                  }
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="mt-8">
                  <div className="space-y-6">
                    <div
                    className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
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
                          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
                          <p className="text-purple-600 font-medium">Enviando...</p>
                        </div> :

                    <>
                          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-purple-100 flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-purple-500" />
                          </div>
                          <p className="text-xl font-medium text-gray-900 mb-2">
                            Arraste sua imagem aqui
                          </p>
                          <p className="text-gray-500 mb-4">
                            ou clique para selecionar
                          </p>
                          <p className="text-sm text-gray-400">
                            PNG, JPG ou WEBP • Máx 10MB
                          </p>
                        </>
                    }
                    </div>

                    {selectedImage && mode === 'upload' &&
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden">

                        <img
                      src={selectedImage}
                      alt="Upload preview"
                      className="w-full h-full object-cover" />

                      </motion.div>
                  }
                  </div>
                </TabsContent>
              </Tabs>

              {/* Continue Button */}
              {selectedImage &&
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 pt-8 border-t">

                  <Button
                onClick={() => setStep(2)}
                className="w-full h-14 rounded-xl ceu-gradient text-white text-lg">

                    Continuar
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
            }
            </motion.div>
          }

          {/* Step 3: Product Mockup & Add to Cart */}
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
                        ← Voltar
                      </Button>
                    </div>
                    
                    {/* Product Type Selector */}
                    <div className="grid grid-cols-3 gap-2 mb-6">
                      {[
                    { value: 'camiseta', label: 'Camiseta', icon: '👕' },
                    { value: 'moletom', label: 'Moletom', icon: '🧥' },
                    { value: 'quadro', label: 'Quadro', icon: '🖼️' },
                    { value: 'caneca', label: 'Caneca', icon: '☕' },
                    { value: 'caneca_termica', label: 'Térmica', icon: '🥤' },
                    { value: 'mousepad', label: 'Mousepad', icon: '🖱️' }].
                    map((prod) =>
                    <button
                      key={prod.value}
                      onClick={() => setSelectedProduct(prod.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl font-medium transition-all ${
                      selectedProduct === prod.value ?
                      'ceu-gradient text-white shadow-lg scale-105' :
                      'bg-gray-100 text-gray-600 hover:bg-gray-200'}`
                      }>

                          <span className="text-3xl">{prod.icon}</span>
                          <span className="text-sm">{prod.label}</span>
                        </button>
                    )}
                    </div>

                    {/* Color Selector */}
                    {(selectedProduct === 'camiseta' || selectedProduct === 'moletom') &&
                  <div className="mb-4">
                        <Label className="text-sm font-medium mb-2 block text-gray-700">Cor</Label>
                        <div className="flex gap-2 flex-wrap">
                          {colors.map((color) =>
                      <button
                        key={color.name}
                        onClick={() => setProductColor(color.name)}
                        className={`w-10 h-10 rounded-full border-2 transition-all hover:scale-110 ${
                        productColor === color.name ? 'border-purple-600 scale-110' : 'border-gray-200'}`
                        }
                        style={{ backgroundColor: color.hex }}
                        title={color.label} />

                      )}
                        </div>
                      </div>
                  }

                    {/* Mockup Display */}
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-stone-100">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={selectedProduct}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.3 }}
                          className="w-full h-full"
                        >
                          {selectedProduct === 'camiseta' && <TshirtMockup designImage={selectedImage} color={productColor} />}
                          {selectedProduct === 'moletom' && <TshirtMockup designImage={selectedImage} color={productColor} />}
                          {selectedProduct === 'quadro' && <FrameMockup designImage={selectedImage} />}
                          {selectedProduct === 'caneca' && <MugMockup designImage={selectedImage} />}
                          {(selectedProduct === 'caneca_termica' || selectedProduct === 'mousepad') && (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <div className="text-center">
                                <span className="text-6xl block mb-2">
                                  {selectedProduct === 'caneca_termica' ? '🥤' : '🖱️'}
                                </span>
                                <p className="text-sm">Preview em breve</p>
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Right: Product Options */}
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {designData.title || 'Sua Estampa'}
                      </h3>
                      <p className="text-gray-600">{designData.description || 'Escolha o produto e personalize sua compra'}</p>
                    </div>

                    <div className="bg-purple-50 rounded-2xl p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 font-medium">Preço</span>
                        <span className="text-2xl font-bold ceu-text-gradient">
                          R$ {productPrices[selectedProduct].toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Size/Options Selector */}
                    <div>
                      <Label className="text-base font-medium mb-3 block text-gray-900">
                        {selectedProduct === 'camiseta' ? 'Tamanho' : selectedProduct === 'quadro' ? 'Dimensão' : 'Capacidade'}
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {productSizes[selectedProduct].map((opt, idx) =>
                      <ProductOptionButton
                        key={opt}
                        option={opt}
                        productType={selectedProduct}
                        onAdd={() => handleAddToCart(selectedProduct, opt, 1)} />

                      )}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <p className="text-sm text-gray-500 mb-3">
                        Adicione quantos produtos quiser ao carrinho e finalize tudo de uma vez!
                      </p>
                    </div>
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

              {/* Actions when cart is empty */}
              {cart.length === 0 &&
            <div className="bg-white rounded-3xl shadow-xl p-6 text-center">
                  <p className="text-gray-500 mb-4">
                    Escolha os tamanhos/modelos que deseja comprar ou publique a estampa sem comprar agora
                  </p>
                  <Button
                variant="outline"
                onClick={handlePublishOnly}
                className="rounded-xl">

                    Apenas Publicar Estampa
                  </Button>
                </div>
            }
            </motion.div>
          }

          {/* Step 2: Details */}
          {step === 2 &&
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-3xl shadow-xl p-8">

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Preview */}
                <div>
                  <Label className="text-lg font-semibold mb-4 block">Preview</Label>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-gray-100">
                    <img
                    src={selectedImage}
                    alt="Preview"
                    className="w-full h-full object-cover" />

                  </div>
                  <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="mt-4">

                    ← Voltar e alterar
                  </Button>
                </div>

                {/* Form */}
                <div className="space-y-6">
                  <div>
                    <Label className="text-base font-medium mb-2 block">
                      Nome da Estampa *
                    </Label>
                    <Input
                    placeholder="Ex: Aurora Boreal"
                    value={designData.title}
                    onChange={(e) => setDesignData({ ...designData, title: e.target.value })}
                    className="h-12 rounded-xl" />

                  </div>

                  <div>
                    <Label className="text-base font-medium mb-2 block">
                      Descrição
                    </Label>
                    <Textarea
                    placeholder="Conte a história por trás da sua arte..."
                    value={designData.description}
                    onChange={(e) => setDesignData({ ...designData, description: e.target.value })}
                    className="h-24 rounded-xl resize-none" />

                  </div>

                  <div>
                    <Label className="text-base font-medium mb-2 block">
                      Categoria *
                    </Label>
                    <Select
                    value={designData.category}
                    onValueChange={(v) => setDesignData({ ...designData, category: v })}>

                      <SelectTrigger className="h-12 rounded-xl">
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
                    <Label className="text-base font-medium mb-2 block">
                      Tags
                    </Label>
                    <Input
                    placeholder="arte, abstrato, cores (separadas por vírgula)"
                    value={designData.tags}
                    onChange={(e) => setDesignData({ ...designData, tags: e.target.value })}
                    className="h-12 rounded-xl" />

                  </div>

                  <div className="pt-6 border-t">
                    <div className="bg-purple-50 rounded-2xl p-6 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600">Sua comissão por venda</span>
                        <span className="text-2xl font-bold ceu-text-gradient">30%</span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Você receberá R$ 14,97 por cada camiseta vendida
                      </p>
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
                          Continuar
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