import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { mockupSourceKey } from '@/components/create/studioMockups';
import { base44 } from '@/api/base44Client';
import { EnhancePrompt } from '@/api/integrations';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription } from
"@/components/ui/dialog";
import {
  Sparkles,
  Upload,
  Wand2,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  SunMedium,
  Minus,
  Plus,
  RotateCcw,
  Sliders,
  Shirt,
  CreditCard,
  ArrowUp,
  ArrowDown,
  MoveVertical,
  Store,
  ShoppingBag } from
'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProductSelector from '@/components/create/ProductSelector';
import TshirtMockup from '@/components/create/TshirtMockup';
import MugMockup from '@/components/create/MugMockup';
import FrameMockup from '@/components/create/FrameMockup';
import InteractiveMockupViewer from '@/components/create/InteractiveMockupViewer';
import CatalogProductMockup from '@/components/create/CatalogProductMockup';
import ProductColorSelector from '@/components/create/ProductColorSelector';
import ProductSizeSelector from '@/components/create/ProductSizeSelector';
import ArtistRegistrationModal from '@/components/artists/ArtistRegistrationModal';
import { prepareGeneratedArtwork, prepareUploadedArtwork } from '@/components/create/preparePrintArtwork';
import { validateArtworkFile, rememberArtwork } from '@/components/create/artworkMetadata';
import AIReconstructionCard from '@/components/create/AIReconstructionCard';
import productViews from '@/components/create/productViews';
import useStudioSubmission from '@/components/create/useStudioSubmission';
import PrintApproval from '@/components/create/PrintApproval';
import PhysicalStockNotice from '@/components/create/PhysicalStockNotice';
import EcobagMockup from '@/components/create/EcobagMockup';
import ArtisticPrintGenerator from '@/components/create/ArtisticPrintGenerator';
import ArtworkAudioNarrator from '@/components/audio/ArtworkAudioNarrator';
import { getPrintPrompt, getPrintStandard, getColorContrastPrompt, isDarkProductColor } from '@/components/production/printStandards';
import { adaptArtworkForDarkBackground } from '@/components/create/artworkContrastAdapter';
import { FALLBACK_PRODUCTS } from '@/data/catalogFallback';
import { calculateTotalDtfCost } from '@/components/create/dtfPricing';

const PRODUCTS = [
  { value: 'camiseta', label: 'Camiseta' },
  { value: 'baby_look', label: 'Baby Look' },
  { value: 'caneca', label: 'Caneca 11oz' },
  { value: 'ecobag', label: 'Ecobag' },
  { value: 'vestido', label: 'Vestido' },
  { value: 'quadro', label: 'Quadro' }
];

const DEFAULT_PRODUCT_PRICES = {
  camiseta: 47.90,
  baby_look: 59.90,
  quadro: 89.90,
  caneca: 39.90,
  ecobag: 34.90,
  vestido: 115.00
};

const DEFAULT_PRODUCT_SIZES = {
  camiseta: ['P', 'M', 'G', 'GG'],
  baby_look: ['P', 'M', 'G', 'GG'],
  quadro: ['A4 (21x30cm)', 'A3 (30x42cm)', 'A1 (60x84cm)'],
  caneca: ['Padrão Sublimada (23,2x17,9cm)'],
  ecobag: ['Padrão 28x35cm']
};

const DEFAULT_COLORS = [
  { name: 'white', label: 'Branco', hex: '#FFFFFF' },
  { name: 'black', label: 'Preto', hex: '#000000' },
  { name: 'navy', label: 'Azul Marinho', hex: '#1e3a8a' },
  { name: 'gray', label: 'Cinza', hex: '#6b7280' }
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
  const [uploadWarning, setUploadWarning] = useState('');
  const [generationError, setGenerationError] = useState('');
  const [backBusy, setBackBusy] = useState(false);
  const [approved, setApproved] = useState(false);
  const [customBaseImages, setCustomBaseImages] = useState({ front: null, back: null });
  const [reconstructTarget, setReconstructTarget] = useState(null);

  const [aiPrompt, setAiPrompt] = useState('');
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false);
  const [commissionRate, setCommissionRate] = useState(25);
  const [aiReferenceImage, setAiReferenceImage] = useState(null);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const [designData, setDesignData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    narration: '',
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
  const captureRef = useRef(null);
  const [mockupsBusy, setMockupsBusy] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showArtistModal, setShowArtistModal] = useState(false);
  const [showFirstPurchaseRuleModal, setShowFirstPurchaseRuleModal] = useState(false);

  useEffect(() => {
    const initializeCatalog = async () => {
      let items;
      try {
        items = await base44.entities.Product.filter({ catalog_product: true, is_active: true }, '-created_date', 100);
        if (!items.length) items = FALLBACK_PRODUCTS;
      } catch {
        items = FALLBACK_PRODUCTS;
      }
      setCatalogProducts(items);
      const chosen = items.find((item) => item.type === requestedProduct) || items.find((item) => item.type === 'camiseta') || items[0];
      if (chosen) {
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
          setGeneratedMockups([]); setStep(3);
        }
      }
    };
    initializeCatalog();
  }, [requestedProduct]);

  useEffect(() => {
    base44.auth.me()
      .then((user) => {
        setCurrentUser(user);
        return base44.entities.ArtistCommission.filter({ artist_id: user.id }, '-updated_date', 1);
      })
      .then((rates) => setCommissionRate(rates?.[0]?.rate ?? 25))
      .catch(() => {
        setCurrentUser(null);
        setCommissionRate(25);
      });
  }, []);

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

  const productPrices = DEFAULT_PRODUCT_PRICES;
  const productSizes = DEFAULT_PRODUCT_SIZES;
  const colors = DEFAULT_COLORS;

  const selectedCatalogProduct = catalogProducts.find((product) => product.id === selectedCatalogId);
  const printStandard = getPrintStandard(selectedProduct);
  const availableColors = selectedCatalogProduct?.product_color_variants?.length ? selectedCatalogProduct.product_color_variants : colors;
  const activeColorObj = availableColors.find((c) => {
    const cName = (c.name || c || '').toString().toLowerCase();
    const pColor = (productColor || '').toString().toLowerCase();
    if (cName === pColor) return true;
    if ((cName.includes('navy') || cName.includes('azul')) && (pColor.includes('navy') || pColor.includes('azul'))) return true;
    if ((cName.includes('gray') || cName.includes('cinza')) && (pColor.includes('gray') || pColor.includes('cinza'))) return true;
    if ((cName.includes('branc') || cName.includes('white')) && (pColor.includes('branc') || pColor.includes('white'))) return true;
    if ((cName.includes('pret') || cName.includes('black')) && (pColor.includes('pret') || pColor.includes('black'))) return true;
    return false;
  }) || {
    name: productColor,
    label: (productColor || '').toLowerCase().includes('azul') || (productColor || '').toLowerCase().includes('navy') ? 'Azul Marinho'
      : (productColor || '').toLowerCase().includes('cinza') || (productColor || '').toLowerCase().includes('gray') ? 'Cinza Mescla'
      : (productColor || '').toLowerCase().includes('branc') || (productColor || '').toLowerCase().includes('white') ? 'Branco' : 'Preto',
    hex: (productColor || '').toLowerCase().includes('azul') || (productColor || '').toLowerCase().includes('navy') ? '#1e3a8a'
      : (productColor || '').toLowerCase().includes('cinza') || (productColor || '').toLowerCase().includes('gray') ? '#6b7280'
      : (productColor || '').toLowerCase().includes('branc') || (productColor || '').toLowerCase().includes('white') ? '#FFFFFF' : '#000000'
  };
  const isDarkFabric = isDarkProductColor(activeColorObj.name, activeColorObj.hex);

  const [isAdaptingContrast, setIsAdaptingContrast] = useState(false);
  const [contrastNotice, setContrastNotice] = useState('');

  const handleEnhancePrompt = async () => {
    if (!aiPrompt.trim() || isEnhancingPrompt) return;
    setIsEnhancingPrompt(true);
    setGenerationError('');
    try {
      const better = await EnhancePrompt(
        aiPrompt,
        selectedProduct,
        'autoral e criativo',
        activeColorObj.name,
        activeColorObj.label
      );
      if (better && typeof better === 'string') {
        setAiPrompt(better);
      }
    } catch (err) {
      console.error('Falha ao aprimorar prompt com Gemini:', err);
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setGenerationError('');
    setContrastNotice('');
    setGeneratedImages([]);

    const contrastPrompt = getColorContrastPrompt(
      selectedProduct,
      activeColorObj.name,
      activeColorObj.label,
      activeColorObj.hex
    );

    const cleanPrompt = aiPrompt.trim()
      .replace(/\b(camiseta|camisa|blusa|baby\s*look|moletom|t-?shirt|regata|polo|jaqueta|vestu[aá]rio)\s+preta\s+(de|com|do|da)?\b/gi, 'arte gráfica vetorial em alto contraste com ')
      .replace(/\b(camiseta|camisa|blusa|baby\s*look|moletom|t-?shirt|regata|polo|jaqueta|vestu[aá]rio)\s+branca\s+(de|com|do|da)?\b/gi, 'arte gráfica vetorial com ')
      .replace(/\b(camiseta|camisa|blusa|baby\s*look|moletom|t-?shirt|regata|polo|jaqueta|vestu[aá]rio)\s+(de|com|do|da)?\b/gi, 'ilustração vetorial de ')
      .replace(/\b(estampa|desenho|arte)\s+(para|de|em|pra)\s+(camiseta|camisa|blusa|roupa|moletom|t-?shirt)\b/gi, 'ilustração gráfica vetorial isolada')
      .replace(/\b(em\s+uma|numa|na|no)\s+(camiseta|camisa|blusa|roupa|moletom|t-?shirt)\b/gi, 'em formato decalque adesivo')
      .replace(/\b(camiseta|camisetas|camisa|camisas|t-?shirts?|roupas|roupa|moletom)\b/gi, 'arte gráfica');

    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Pure 2D vector graphic design decal sticker, isolated screenprint graphic illustration: "${cleanPrompt}". ${aiReferenceImage ? 'Use the reference image for visual motifs, palette and style without copying.' : ''} ${getPrintPrompt(selectedProduct)}

${contrastPrompt}

DIRETRIZES TÉCNICAS OBRIGATÓRIAS:
1. ARTE ISOLADA E CENTRALIZADA: Crie exclusivamente o adesivo/decalque gráfico vetorial plano 2D, isolado e centralizado, com linhas limpas e alta definição gráfica. Deixe pelo menos 10% de margem de fundo ao redor de toda a composição.
2. FUNDO VERDE TÉCNICO (#00FF00): Gere sobre um único fundo técnico verde puro #00FF00, completamente plano, uniforme, sem degradê, sem textura e sem sombras até as quatro bordas.
3. REGRA CRÍTICA DE VAZADOS E VÃOS INTERNOS: Todos os vãos internos da estampa, aberturas de letras e espaços negativos DEVEM SER VAZADOS com exatamente o mesmo verde plano #00FF00 contínuo.
4. REGRA CRÍTICA DE BORDAS E CONTORNOS: As bordas e contornos de toda a arte gráfica devem ser ultra nítidas, recortadas e limpas (crisp vector edges). A transição entre a arte e o fundo verde deve ser imediata e sem vazamento de cor.
5. PALETA E CORES: O verde puro #00FF00 é reservado estritamente para o fundo técnico e para os vãos vazados.
6. FORMATO: A saída deve ser exclusivamente o arquivo gráfico plano decalque 2D isolado.`,
        productColor: activeColorObj.name,
        colorName: activeColorObj.label,
        colorHex: activeColorObj.hex,
        productType: selectedProduct,
        ...(aiReferenceImage ? { existing_image_urls: [aiReferenceImage] } : {})
      });

      if (!result?.url) throw new Error('A geração não retornou uma imagem. Tente novamente.');
      const pngUrl = await prepareGeneratedArtwork(result.url);
      setGeneratedImages([pngUrl]);
      if (editorSide === 'back') {
        setBackDesignImage(pngUrl);
      } else {
        setSelectedImage(pngUrl);
      }
    } catch (error) {
      const invalidBackground = /Fundo ambíguo|arte isolada com transparência/.test(error.message || '');
      setGenerationError(invalidBackground
        ? 'A IA gerou um fundo que não pôde ser removido com segurança. Seu texto foi mantido; clique em Gerar com IA para tentar novamente.'
        : error.message || 'Não foi possível gerar e validar a arte. Tente novamente.');
    } finally { setIsGenerating(false); }
  };

  const handleAdaptForDarkBackground = async () => {
    const targetImageToAdapt = editorSide === 'back' ? backDesignImage : selectedImage;
    if (!targetImageToAdapt || isAdaptingContrast) return;
    setIsAdaptingContrast(true);
    setContrastNotice('');
    try {
      const adaptedUrl = await adaptArtworkForDarkBackground(targetImageToAdapt);
      if (editorSide === 'back') {
        setBackDesignImage(adaptedUrl);
      } else {
        setSelectedImage(adaptedUrl);
      }
      setGeneratedImages((prev) => [adaptedUrl, ...prev.filter((img) => img !== adaptedUrl)]);
      setContrastNotice('Estampa adaptada com sucesso! Letras e traços escuros foram clareados para contrastar perfeitamente sobre o fundo escuro.');
    } catch (err) {
      console.error('Erro ao adaptar contraste:', err);
      setContrastNotice('Não foi possível adaptar a arte: ' + (err.message || ''));
    } finally {
      setIsAdaptingContrast(false);
    }
  };

  const handleFileUpload = async (eOrFile) => {
    const file = eOrFile?.target ? eOrFile.target.files?.[0] : eOrFile;
    if (!file) return;
    setUploadError('');
    setUploadWarning('');
    setIsUploading(true);
    setUploadStage('Analisando arquivo de imagem...');
    try {
      const quality = await validateArtworkFile(file);
      setUploadStage('Enviando imagem...');
      const result = await base44.integrations.Core.UploadFile({ file });
      if (!result?.file_url) throw new Error('O envio da imagem não foi concluído.');
      
      setUploadStage('Otimizando imagem para estampa...');
      const prepared = await prepareUploadedArtwork(file, result.file_url);
      if (editorSide === 'back') {
        setBackDesignImage(prepared);
      } else {
        setSelectedImage(prepared);
      }

      // Deixa o card interativo de reconstrução IA disponível com a arte carregada
      setReconstructTarget({
        sourceUrl: result.file_url,
        preparedUrl: prepared,
        metadata: quality,
        side: editorSide,
      });
    } catch (error) {
      setUploadError(error.message || 'Não foi possível preparar a imagem.');
    } finally {
      setIsUploading(false);
      if (eOrFile?.target) eOrFile.target.value = '';
    }
  };

  const handleReconstructSuccess = (newUrl, info) => {
    if (reconstructTarget?.side === 'back') {
      setBackDesignImage(newUrl);
    } else {
      setSelectedImage(newUrl);
    }
    setReconstructTarget(null);
    setUploadWarning('');
  };

  const handleCopyFrontToBack = () => {
    if (selectedImage) {
      setBackDesignImage(selectedImage);
      setDesignTransforms((prev) => ({ ...prev, back: { ...prev.front } }));
      setEditorSide('back');
    }
  };

  const handleCopyBackToFront = () => {
    if (backDesignImage) {
      setSelectedImage(backDesignImage);
      setDesignTransforms((prev) => ({ ...prev, front: { ...prev.back } }));
      setEditorSide('front');
    }
  };

  const handleMoveFrontToBack = () => {
    if (selectedImage) {
      setBackDesignImage(selectedImage);
      setDesignTransforms((prev) => ({ ...prev, back: { ...prev.front } }));
      setSelectedImage(null);
      setEditorSide('back');
    }
  };

  const handleMoveBackToFront = () => {
    if (backDesignImage) {
      setSelectedImage(backDesignImage);
      setDesignTransforms((prev) => ({ ...prev, front: { ...prev.back } }));
      setBackDesignImage(null);
      setEditorSide('front');
    }
  };

  const handleRemoveArtwork = (sideToRemove) => {
    if (sideToRemove === 'back') {
      setBackDesignImage(null);
    } else {
      setSelectedImage(null);
    }
  };

  const catalogStudioProducts = catalogProducts.map((product) => ({ value: product.id, type: product.type, label: product.name, price: product.base_price ?? product.base_cost, image: product.front_model_url, category_id: product.category_id, collection_id: product.collection_id, tags: product.tags || [] }));
  const missingProducts = PRODUCTS.filter((option) => !catalogProducts.some((product) => product.type === option.value)).map((option) => ({ ...option, type: option.value, price: productPrices[option.value] }));
  const studioProducts = [...catalogStudioProducts, ...missingProducts];
  const baseProductPrice = Number(selectedCatalogProduct?.base_price ?? productPrices[selectedProduct]);
  const currentSizes = selectedCatalogProduct?.sizes_available?.length ? selectedCatalogProduct.sizes_available : (productSizes[selectedProduct] || []);
  const busy = isGenerating || isUploading || backBusy || mockupsBusy || isAdaptingContrast;
  const isApparel = selectedProduct === 'camiseta' || selectedProduct === 'baby_look' || selectedProduct === 'vestido';
  const hasAnyArtwork = Boolean(selectedImage || backDesignImage);

  // Cálculo de custo DTF proporcional em tempo real baseado no metro linear (58x100cm = R$ 80)
  // Canecas são sublimadas / DTF UV, portanto não têm acréscimo de custo de estampa (estampa inclusa)
  const dtfSummary = isApparel && hasAnyArtwork && selectedProduct !== 'caneca'
    ? calculateTotalDtfCost({ frontImage: selectedImage, backImage: backDesignImage, transforms: designTransforms, productType: selectedProduct })
    : { totalCost: 0, totalAreaCm2: 0, breakdown: {}, isSublimation: selectedProduct === 'caneca' };

  const currentPrice = baseProductPrice + dtfSummary.totalCost;

  const views = { ...productViews(selectedCatalogProduct, productColor) };
  if (customBaseImages.front) views.front = customBaseImages.front;
  if (customBaseImages.back) views.back = customBaseImages.back;
  const mockupOptions = { frontImage: selectedImage, backImage: backDesignImage, transforms: designTransforms, views, color: productColor, productType: selectedProduct, captureRef };
  const sourceKey = mockupSourceKey(mockupOptions);
  const { submit, saving: isSaving, error: saveError } = useStudioSubmission({ ...mockupOptions, product: selectedCatalogProduct, size: selectedSize, price: currentPrice, designData, mode, approved, generatedMockups, mockupStyle, customBaseImages });
  useEffect(() => { setApproved(false); setGeneratedMockups([]); }, [sourceKey, selectedCatalogId, selectedSize]);
  const handleProductChange = (value) => {
    setCustomBaseImages({ front: null, back: null });
    const catalogProduct = catalogProducts.find((product) => product.id === value);
    setSelectedCatalogId(catalogProduct?.id || null);
    setSelectedProduct(catalogProduct?.type || value);
    setProductColor(catalogProduct?.product_color_variants?.[0]?.name || 'white');
    setSelectedSize('');
  };

  const stepLabels = ['1. Escolher Produto', '2. Desenhar Estampa', '3. Finalizar'];
  const [showCelebration, setShowCelebration] = useState(false);

  const activeTransform = designTransforms[editorSide];
  const activeDesignImage = editorSide === 'back' ? backDesignImage : selectedImage;
  const handleTransformChange = (nextTransform) => setDesignTransforms((current) => ({ ...current, [editorSide]: nextTransform }));
  const handleMockupsGenerated = ({ style, items }) => {
    setMockupStyle(style);
    setGeneratedMockups(items);
  };

  const isArtistProfileComplete = Boolean(
    currentUser?.store_name &&
    currentUser?.cpf &&
    currentUser?.pix_key &&
    (currentUser?.artist_name || currentUser?.full_name)
  );
  const hasPurchasedFirstPrint = Boolean(currentUser?.has_purchased_first_print);

  const handleProceedToDesign = () => {
    if (!selectedSize) return;
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProceedToFinish = () => {
    if (!hasAnyArtwork) return;
    setShowCelebration(true);
    try {
      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
    setTimeout(() => {
      setShowCelebration(false);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  };

  const handleScaleDelta = (delta) => {
    const currentScale = activeTransform?.scale ?? 1;
    const nextScale = Math.min(2.0, Math.max(0.35, parseFloat((currentScale + delta).toFixed(2))));
    handleTransformChange({ ...activeTransform, scale: nextScale });
  };

  const handleSetScale = (val) => {
    handleTransformChange({ ...activeTransform, scale: val });
  };

  const handleMoveY = (deltaY) => {
    const currentY = activeTransform?.y ?? 0;
    const nextY = Math.min(140, Math.max(-140, Math.round(currentY + deltaY)));
    handleTransformChange({ ...activeTransform, y: nextY });
  };

  const handleSetY = (val) => {
    handleTransformChange({ ...activeTransform, y: val });
  };

  const handleMoveX = (deltaX) => {
    const currentX = activeTransform?.x ?? 0;
    const nextX = Math.min(120, Math.max(-120, Math.round(currentX + deltaX)));
    handleTransformChange({ ...activeTransform, x: nextX });
  };

  const handleApplyPreset = (preset) => {
    if (preset === 'chest') {
      handleTransformChange({ ...activeTransform, x: -65, y: -90, scale: 0.65, rotation: 0 });
    } else if (preset === 'chest_center') {
      handleTransformChange({ ...activeTransform, x: 0, y: -80, scale: 0.9, rotation: 0 });
    } else if (preset === 'center') {
      handleTransformChange({ ...activeTransform, x: 0, y: 0, scale: 1, rotation: 0 });
    } else if (preset === 'lower') {
      handleTransformChange({ ...activeTransform, x: 0, y: 70, scale: 1, rotation: 0 });
    } else if (preset === 'large') {
      handleTransformChange({ ...activeTransform, x: 0, y: -10, scale: 1.35, rotation: 0 });
    } else if (preset === 'reset') {
      handleTransformChange({ ...activeTransform, x: 0, y: 0, scale: 1, rotation: 0 });
    }
  };

  const handleDirectBuy = () => {
    if (!designData.title.trim()) {
      setDesignData((prev) => ({
        ...prev,
        title: aiPrompt.slice(0, 32) || 'Estampa Autoral',
        category: prev.category || 'streetwear'
      }));
    }
    submit('cart');
  };

  const handlePublishClick = async () => {
    if (!approved || !selectedSize || !hasAnyArtwork) return;

    if (!designData.title.trim()) {
      setDesignData((prev) => ({
        ...prev,
        title: aiPrompt.slice(0, 32) || 'Estampa Autoral',
        category: prev.category || 'streetwear'
      }));
    }

    // 1. Antes de publicar a estampa, tem que finalizar o cadastro de artista
    if (!isArtistProfileComplete) {
      setShowArtistModal(true);
      return;
    }

    // 2. Para os artistas participarem da SEL, têm que comprar a primeira estampa.
    // A partir do momento que ele comprou, sua lojinha é gerada e todas as próximas
    // estampas que ele gerar não precisam ser compradas por ele!
    if (!hasPurchasedFirstPrint) {
      setShowFirstPurchaseRuleModal(true);
      return;
    }

    // 3. Artista verificado com 1ª compra já feita: publica direto sem custo!
    submit('publish');
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
        {selectedProduct === 'ecobag' && <EcobagMockup designImage={designImage} />}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-ceu-cloud py-8 sm:py-12">
      {/* Overlay de Celebração Animada ao Concluir a Estampa */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: -20 }}
              className="bg-card rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border border-white/20"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                <Sparkles className="w-9 h-9 animate-spin" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">
                Estampa no Lugar Perfeito! ✨
              </h3>
              <p className="text-sm text-slate-600 mb-6">
                Sua peça está pronta com todos os ajustes. Indo para a finalização...
              </p>
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-purple-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Carregando resumo do pedido...
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`${step === 2 && hasAnyArtwork ? 'max-w-screen-2xl' : 'max-w-7xl'} mx-auto px-4`}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8">

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 tracking-tight mb-2">
            Crie sua Coleção
          </h1>
          <p className="text-base text-slate-600 max-w-xl mx-auto">
            Escolha o produto, crie sua estampa autoral com IA ou envie sua arte, e personalize com liberdade total.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8 sm:mb-12">
          {[1, 2, 3].map((s) =>
            <button
              key={s}
              type="button"
              onClick={() => {
                if (s === 1) setStep(1);
                else if (s === 2 && selectedSize) setStep(2);
                else if (s === 3 && hasAnyArtwork && selectedSize) setStep(3);
              }}
              className={`flex items-center gap-2 text-left transition-opacity ${
                (s === 1 || (s === 2 && selectedSize) || (s === 3 && hasAnyArtwork && selectedSize)) ? 'cursor-pointer hover:opacity-85' : 'cursor-not-allowed opacity-60'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                step >= s ?
                'bg-ceu-navy text-ceu-cloud shadow-md' :
                'bg-gray-100 text-gray-400'}`
              }>
                {step > s ? <Check className="w-5 h-5" /> : s}
              </div>
              <span className={`hidden sm:block font-bold text-sm ${
                step >= s ? 'text-gray-900' : 'text-gray-400'}`
              }>
                {stepLabels[s - 1]}
              </span>
              {s < 3 && <div className="w-12 sm:w-16 h-0.5 bg-gray-200 hidden sm:block" />}
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: ESCOLHER O PRODUTO (SEQUÊNCIA INVERTIDA) */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-card rounded-3xl border border-ceu-navy/10 shadow-xl p-4 sm:p-6 lg:p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Shirt className="w-6 h-6 text-purple-600" />
                    1. Escolha o Produto Base
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Selecione a peça onde sua arte será estampada, defina a cor e o tamanho (P, M, G, GG).
                  </p>
                </div>

                <Button
                  onClick={handleProceedToDesign}
                  disabled={!selectedSize}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl h-11 px-6 shadow-lg shadow-purple-600/25 shrink-0 transition-transform active:scale-95 disabled:opacity-50"
                >
                  Avançar para Desenhar a Estampa <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              {/* Seletor de Peças */}
              <div className="mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
                  Selecione o Produto:
                </span>
                <ProductSelector
                  products={studioProducts}
                  value={selectedCatalogId || selectedProduct}
                  onChange={handleProductChange}
                />
              </div>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                {/* Coluna Esquerda: Preview da Peça Base Limpa */}
                <div className="min-w-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Peça Base Selecionada
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-900 text-white">
                      R$ {baseProductPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="relative rounded-3xl bg-[#F5F5F7] shadow-inner overflow-hidden p-6 sm:p-10 flex items-center justify-center min-h-[380px] sm:min-h-[460px]">
                    {selectedCatalogProduct?.front_model_url ? (
                      <CatalogProductMockup product={selectedCatalogProduct} side="front" color={productColor} />
                    ) : (
                      <>
                        {(selectedProduct === 'camiseta' || selectedProduct === 'baby_look') && (
                          <TshirtMockup designImage={null} color={productColor} side="front" />
                        )}
                        {selectedProduct === 'quadro' && <FrameMockup designImage={null} />}
                        {selectedProduct === 'caneca' && <MugMockup designImage={null} />}
                        {selectedProduct === 'ecobag' && <EcobagMockup designImage={null} />}
                      </>
                    )}
                  </div>

                  {/* Badges de Qualidade */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-semibold text-slate-800">100% Algodão Premium</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                      <span className="font-semibold text-slate-800">Estamparia DTF Alta Resolução</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-center gap-2 col-span-2 sm:col-span-1">
                      <Check className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-800">Costura Reforçada</span>
                    </div>
                  </div>
                </div>

                {/* Coluna Direita: Cor, Tamanho, Estoque e CTA */}
                <div className="min-w-0 space-y-5">
                  {/* Cor da Peça */}
                  {(selectedCatalogProduct?.product_color_variants?.length || (!selectedCatalogProduct && (selectedProduct === 'camiseta' || selectedProduct === 'baby_look'))) && (
                    <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Cor da Peça:
                        </Label>
                        <span className="text-xs font-semibold text-slate-900 capitalize">
                          {activeColorObj.label || productColor}
                        </span>
                      </div>
                      <ProductColorSelector
                        options={availableColors}
                        value={productColor}
                        onChange={setProductColor}
                      />
                    </div>
                  )}

                  {/* Tamanho da Peça (P, M, G, GG) */}
                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Tamanho:
                      </Label>
                      <span className="text-xs font-semibold text-purple-700">
                        {selectedSize ? `Tamanho ${selectedSize} selecionado` : 'Selecione abaixo'}
                      </span>
                    </div>
                    <ProductSizeSelector
                      options={currentSizes}
                      value={selectedSize}
                      onChange={setSelectedSize}
                    />
                    <PhysicalStockNotice
                      productId={selectedCatalogId}
                      color={productColor}
                      size={selectedSize}
                    />
                  </div>

                  {/* Card Informativo com Resumo do Produto */}
                  <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-xs">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>Peça Base:</span>
                      <span>{selectedCatalogProduct?.name || selectedProduct}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Cor Selecionada:</span>
                      <span className="capitalize">{activeColorObj.label || productColor}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Tamanho Selecionado:</span>
                      <span>{selectedSize || 'Não selecionado'}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-900">Valor Base da Peça:</span>
                      <span className="text-xl font-black text-slate-950">R$ {baseProductPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Botão de Avançar */}
                  <div className="space-y-2 pt-2">
                    <Button
                      onClick={handleProceedToDesign}
                      disabled={!selectedSize}
                      className="w-full h-14 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white text-base font-bold shadow-xl shadow-purple-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    >
                      Avançar para Desenhar a Estampa
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    {!selectedSize && (
                      <p className="text-xs text-center text-amber-700 font-medium">
                        * Escolha um tamanho acima para começar a desenhar sua estampa
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DESENHAR A ESTAMPA E AJUSTAR NA PEÇA */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-3xl border border-ceu-navy/10 shadow-xl p-4 sm:p-6 lg:p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <Wand2 className="w-6 h-6 text-purple-600" />
                    2. Desenhe sua Estampa e Posicione na Peça
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Gere com IA ou envie sua arte, diminua ou aumente e movimente a estampa para cima e para baixo.
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="rounded-2xl border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs h-10 px-4 shrink-0"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                    Trocar Peça
                  </Button>

                  {hasAnyArtwork && (
                    <Button
                      onClick={handleProceedToFinish}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl h-10 px-5 shadow-md shadow-purple-600/25 shrink-0 text-xs transition-transform active:scale-95"
                    >
                      Continuar para Finalizar <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.3fr)]">
                {/* Coluna Esquerda: Abas de Criação (IA e Upload) */}
                <div className="min-w-0">
                  <Tabs value={mode} onValueChange={setMode} className="w-full">
                    <TabsList className="w-full grid grid-cols-2 h-11 sm:h-12 rounded-2xl bg-gray-100 p-1 mb-4">
                      <TabsTrigger value="ai" className="rounded-xl h-full data-[state=active]:bg-white data-[state=active]:shadow font-bold text-xs sm:text-sm">
                        <Wand2 className="w-4 h-4 mr-1.5 text-purple-600" />
                        Criar com IA
                      </TabsTrigger>
                      <TabsTrigger value="upload" className="rounded-xl h-full data-[state=active]:bg-white data-[state=active]:shadow font-bold text-xs sm:text-sm">
                        <Upload className="w-4 h-4 mr-1.5 text-purple-600" />
                        Enviar Arte do Artista
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ai" className={mode !== 'ai' ? 'hidden' : ''} forceMount>
                      <ArtisticPrintGenerator
                        onArtworkSelected={(url, styleInfo) => {
                          if (editorSide === 'back') {
                            setBackDesignImage(url);
                          } else {
                            setSelectedImage(url);
                          }
                          setGeneratedImages(prev => [url, ...prev.filter(i => i !== url)]);
                          if (styleInfo?.prompt) {
                            setAiPrompt(styleInfo.prompt);
                            setDesignData(prev => ({
                              ...prev,
                              title: prev.title || styleInfo.prompt.slice(0, 32)
                            }));
                          }
                        }}
                        onSwitchToUpload={() => setMode('upload')}
                        productType={selectedProduct}
                        productColor={productColor}
                        activeArtworkUrl={activeDesignImage}
                        disabled={busy}
                      />
                    </TabsContent>

                    <TabsContent value="upload" className={mode !== 'upload' ? 'hidden' : ''} forceMount>
                      <div className="space-y-4">
                        <div
                          className={`relative border-2 border-dashed rounded-3xl p-7 sm:p-8 text-center transition-all ${
                            isUploading
                              ? 'border-purple-500 bg-purple-50/60'
                              : 'border-purple-300 hover:border-purple-600 bg-purple-50/20 hover:bg-purple-50/40'
                          }`}
                        >
                          <input
                            type="file"
                            accept="image/*,image/png,image/jpeg,image/jpg,image/webp"
                            onChange={handleFileUpload}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            disabled={busy}
                          />

                          {isUploading ? (
                            <div className="flex flex-col items-center py-4">
                              <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-3" />
                              <p className="text-purple-700 font-bold text-sm">{uploadStage}</p>
                              <p className="text-xs text-slate-500 mt-1">Nossa IA está preparando sua arte para impressão em alta definição...</p>
                            </div>
                          ) : (
                            <>
                              <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-purple-500/20">
                                <Upload className="w-6 h-6" />
                              </div>
                              <h3 className="text-base font-bold text-slate-900 mb-1">
                                Envie sua Arte
                              </h3>
                              <p className="text-slate-600 mb-3 text-xs">
                                PNG, JPG ou WEBP (até 25MB)
                              </p>

                              <Button
                                type="button"
                                className="mb-3 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-bold text-xs h-10 px-6 shadow-md shadow-purple-600/20 pointer-events-none"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Selecionar Imagem do Artista
                              </Button>

                              <div className="block">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-semibold mb-2">
                                  <Sparkles className="w-3.5 h-3.5" /> Reconstrução e Super-Resolução 300 DPI
                                </div>
                              </div>
                              <p className="text-xs text-slate-500 max-w-md mx-auto">
                                A IA otimiza e reconstrói a estampa para impressão profissional sem serrilhado.
                              </p>
                              {uploadWarning && (
                                <p role="status" className="mt-3 rounded-2xl bg-amber-50 border border-amber-200 p-3 text-xs font-medium text-amber-800">
                                  {uploadWarning}
                                </p>
                              )}
                              {uploadError && (
                                <p role="alert" className="mt-3 text-xs font-medium text-destructive">
                                  {uploadError}
                                </p>
                              )}
                            </>
                          )}
                        </div>

                        {reconstructTarget && (
                          <AIReconstructionCard
                            sourceUrl={reconstructTarget.sourceUrl}
                            metadata={reconstructTarget.metadata}
                            editorSide={reconstructTarget.side}
                            productColor={productColor}
                            colorName={productColor}
                            onReconstructSuccess={handleReconstructSuccess}
                            onDismiss={() => setReconstructTarget(null)}
                            onUploadArtwork={handleFileUpload}
                            isUploading={isUploading}
                          />
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Coluna Direita: Mockup da Peça Escolhida + Controles de Subir/Descer/Escala */}
                <div className="min-w-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                        Mockup: {selectedCatalogProduct?.name || selectedProduct} ({productColor}, Tam {selectedSize})
                      </span>
                    </div>

                    {isApparel && (
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setEditorSide('front')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            editorSide === 'front'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Frente {selectedImage && '✓'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorSide('back')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                            editorSide === 'back'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Costas {backDesignImage && '✓'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Viewer da Peça */}
                  <div className="relative rounded-3xl bg-[#F5F5F7] shadow-sm overflow-hidden p-2 sm:p-4">
                    <InteractiveMockupViewer
                      captureRef={captureRef}
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
                      frontImage={selectedImage}
                      backImage={backDesignImage}
                      onCopyFrontToBack={handleCopyFrontToBack}
                      onCopyBackToFront={handleCopyBackToFront}
                      onMoveFrontToBack={handleMoveFrontToBack}
                      onMoveBackToFront={handleMoveBackToFront}
                      onGenerateBackAI={() => { setEditorSide('back'); setMode('ai'); }}
                      onRemoveArtwork={handleRemoveArtwork}
                      selectedSize={selectedSize}
                      onSizeChange={setSelectedSize}
                    />
                  </div>

                  {/* Barra Intuitiva de Posicionar e Ajustar a Estampa */}
                  <div className="p-4 sm:p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
                    {/* Controle Vertical: Mover para Cima e para Baixo */}
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 uppercase tracking-wider">
                          <MoveVertical className="w-4 h-4 text-purple-600" />
                          Movimentar Estampa (Cima / Baixo)
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200/60">
                          {(activeTransform?.y ?? 0) < -25
                            ? '▲ Mais Alta (Peito / Gola)'
                            : (activeTransform?.y ?? 0) > 25
                            ? '▼ Mais Baixa'
                            : '↕ Centralizada'}
                        </span>
                      </div>

                      <div className="flex items-center gap-2.5">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleMoveY(-20)}
                          className="rounded-2xl h-11 px-4 text-xs font-bold bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border-slate-300 shadow-xs flex items-center gap-2 shrink-0 transition-transform active:scale-95"
                          title="Subir estampa para cima"
                        >
                          <ArrowUp className="w-4 h-4 text-purple-600" />
                          <span>Subir (Cima)</span>
                        </Button>

                        <div className="flex-1 px-1">
                          <input
                            type="range"
                            min="-140"
                            max="140"
                            step="5"
                            value={activeTransform?.y ?? 0}
                            onChange={(e) => handleSetY(parseInt(e.target.value, 10))}
                            className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                            aria-label="Posição vertical da estampa"
                          />
                          <div className="flex justify-between text-[11px] text-slate-500 font-semibold mt-1 px-0.5">
                            <span>▲ Subir (Peito)</span>
                            <span>Centro</span>
                            <span>Descer (Baixo) ▼</span>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleMoveY(20)}
                          className="rounded-2xl h-11 px-4 text-xs font-bold bg-slate-50 hover:bg-purple-50 hover:text-purple-700 border-slate-300 shadow-xs flex items-center gap-2 shrink-0 transition-transform active:scale-95"
                          title="Descer estampa para baixo"
                        >
                          <ArrowDown className="w-4 h-4 text-purple-600" />
                          <span>Descer (Baixo)</span>
                        </Button>
                      </div>
                    </div>

                    {/* Controle de Tamanho (Diminuir / Aumentar) */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span className="flex items-center gap-1.5 text-slate-700 uppercase tracking-wider">
                          <Sliders className="w-4 h-4 text-purple-600" />
                          Tamanho da Estampa
                        </span>
                        <span className="text-purple-600 font-bold tabular-nums">
                          {Math.round((activeTransform?.scale ?? 1) * 100)}%
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleScaleDelta(-0.15)}
                          className="rounded-xl h-10 px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-100 border-slate-300 shrink-0"
                          title="Diminuir estampa"
                        >
                          <Minus className="w-3.5 h-3.5 mr-1 text-slate-600" /> Diminuir
                        </Button>

                        <input
                          type="range"
                          min="0.35"
                          max="1.8"
                          step="0.05"
                          value={activeTransform?.scale ?? 1}
                          onChange={(e) => handleSetScale(parseFloat(e.target.value))}
                          className="flex-1 h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                          aria-label="Tamanho da estampa"
                        />

                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleScaleDelta(0.15)}
                          className="rounded-xl h-10 px-3.5 text-xs font-bold text-slate-700 hover:bg-slate-100 border-slate-300 shrink-0"
                          title="Aumentar estampa"
                        >
                          <Plus className="w-3.5 h-3.5 mr-1 text-slate-600" /> Aumentar
                        </Button>
                      </div>
                    </div>

                    {/* Presets Rápidos de Posição */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-slate-500 font-medium">Posições Rápidas:</span>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApplyPreset('chest_center')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 font-bold text-xs transition-colors"
                        >
                          ▲ Peito Alto
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset('chest')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 font-bold text-xs transition-colors"
                        >
                          Peito Esquerdo
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset('center')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 font-bold text-xs transition-colors"
                        >
                          Centro
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset('lower')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700 font-bold text-xs transition-colors"
                        >
                          ▼ Mais Baixo
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset('reset')}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs transition-colors flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Reset
                        </button>
                      </div>
                    </div>

                    {/* Ajuste de Contraste para Peças Escuras */}
                    {isDarkFabric && hasAnyArtwork && (
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs bg-amber-50/60 p-3 rounded-2xl border border-amber-200/60">
                        <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                          <SunMedium className="w-4 h-4 text-amber-600" />
                          Contraste para Tecido Escuro
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleAdaptForDarkBackground}
                          disabled={busy || isAdaptingContrast}
                          className="h-8 rounded-xl bg-white border-amber-300 text-amber-950 text-xs font-bold"
                        >
                          {isAdaptingContrast ? 'Ajustando...' : 'Clarear Estampa'}
                        </Button>
                      </div>
                    )}

                    {/* Botão de Avanço para a Finalização */}
                    <div className="pt-3 border-t border-slate-100">
                      <Button
                        onClick={handleProceedToFinish}
                        disabled={!hasAnyArtwork}
                        className="w-full h-13 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-sm shadow-xl shadow-purple-600/25 transition-transform active:scale-95 disabled:opacity-50"
                      >
                        Continuar para Finalizar Pedido
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                      {!hasAnyArtwork && (
                        <p className="text-[11px] text-center text-slate-400 mt-2">
                          * Crie uma arte com a IA ou envie um arquivo para continuar
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: FINALIZAÇÃO & CADASTRO DO ARTISTA / PAGAMENTO */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-card rounded-3xl border border-ceu-navy/10 shadow-xl p-4 sm:p-6 lg:p-8"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-border/60">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                    3. Finalização &amp; Lojinha de Artista
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    Revise sua criação, finalize seu cadastro e compre seu produto ou ative sua lojinha na SEL.
                  </p>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="rounded-2xl border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs h-10 px-4 shrink-0"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Ajustar Estampa
                </Button>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Lado Esquerdo: Mockup e Resumo Visual */}
                <div className="space-y-4">
                  <div className="rounded-3xl bg-[#F5F5F7] p-4 shadow-sm overflow-hidden">
                    <InteractiveMockupViewer
                      captureRef={captureRef}
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
                  </div>

                  <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                        Produto Selecionado:
                      </span>
                      <p className="font-bold text-slate-900 text-sm">
                        {selectedCatalogProduct?.name || selectedProduct} · {productColor} · Tam. {selectedSize}
                      </p>
                    </div>
                    <span className="text-lg font-black text-slate-950">
                      R$ {currentPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Lado Direito: Formulário, Card de Artista SEL e Botões */}
                <div className="space-y-5">
                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-slate-700">
                      Nome da sua Estampa
                    </Label>
                    <Input
                      placeholder="Ex: Minha Criação Autoral"
                      value={designData.title}
                      onChange={(e) => setDesignData({ ...designData, title: e.target.value })}
                      className="h-11 rounded-xl bg-white border-slate-300 text-slate-900 shadow-sm font-semibold"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-bold uppercase tracking-wider mb-1.5 block text-slate-700">
                      Categoria
                    </Label>
                    <Select
                      value={designData.category || 'streetwear'}
                      onValueChange={(v) => setDesignData({ ...designData, category: v })}
                    >
                      <SelectTrigger className="h-11 rounded-xl bg-white border-slate-300 text-slate-900 shadow-sm">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-slate-200 text-slate-900 shadow-xl">
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Narração Autoral da Estampa por Voz ou IA */}
                  <ArtworkAudioNarrator
                    narration={designData.narration}
                    onNarrationChange={(text) => setDesignData((prev) => ({ ...prev, narration: text }))}
                    isEditable={true}
                    title={designData.title}
                    description={designData.description}
                    prompt={aiPrompt}
                    category={designData.category}
                    artistName={currentUser?.artist_name || currentUser?.full_name || 'Artista Céu Criativa'}
                  />

                  {/* Resumo Financeiro */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4.5 space-y-2.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Peça Base ({selectedCatalogProduct?.name || selectedProduct})</span>
                      <span className="font-semibold text-slate-900">R$ {baseProductPrice.toFixed(2)}</span>
                    </div>

                    {dtfSummary.totalCost > 0 && (
                      <div className="flex items-center justify-between text-xs text-emerald-800 bg-emerald-50/80 -mx-1 px-2 py-1.5 rounded-lg border border-emerald-200/60">
                        <span>Impressão DTF ({dtfSummary.totalAreaCm2} cm²)</span>
                        <span className="font-bold">+ R$ {dtfSummary.totalCost.toFixed(2)}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-slate-900 font-bold text-base">Total do Pedido</span>
                      <span className="text-2xl font-black text-slate-950">
                        R$ {currentPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <PrintApproval
                    front={selectedImage}
                    back={backDesignImage}
                    transforms={designTransforms}
                    approved={approved}
                    onChange={setApproved}
                    disabled={busy || isSaving}
                  />

                  {saveError && (
                    <p role="alert" className="text-sm font-semibold text-destructive">
                      {saveError}
                    </p>
                  )}

                  {/* SEÇÃO ESPECIAL: REGRAS DE CADASTRO E LOJINHA DE ARTISTA SEL */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-amber-500/10 border border-purple-200/80 space-y-3">
                    <div className="flex items-center gap-2">
                      <Store className="w-5 h-5 text-purple-600" />
                      <h4 className="text-sm font-bold text-slate-900">
                        Programa de Artistas &amp; Lojinha SEL
                      </h4>
                    </div>

                    {!isArtistProfileComplete ? (
                      <div className="space-y-2 text-xs">
                        <p className="text-slate-700 leading-relaxed">
                          Quer expor sua arte na Galeria pública da SEL e lucrar <strong>25% de comissão</strong> a cada venda? Finalize seu cadastro de Artista com nome da sua loja, CPF e chave Pix.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowArtistModal(true)}
                          className="w-full h-10 rounded-xl bg-white border-purple-300 text-purple-800 hover:bg-purple-50 font-bold text-xs shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-600" />
                          Finalizar Cadastro de Artista SEL
                        </Button>
                      </div>
                    ) : !hasPurchasedFirstPrint ? (
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Cadastro preenchido: Loja "{currentUser?.store_name || 'Sua Loja'}"
                        </div>
                        <p className="text-slate-700 leading-relaxed">
                          <strong>Regra SEL:</strong> Para sua estampa entrar na Galeria e sua lojinha ser ativada, você deve comprar a sua primeira estampa física. <strong>A partir dessa primeira compra, você poderá publicar todas as próximas estampas sem precisar comprar nenhuma delas!</strong>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
                          <CheckCircle2 className="w-4 h-4" />
                          Artista Verificado · Lojinha Ativa!
                        </div>
                        <p className="text-slate-600">
                          Você já realizou sua primeira compra! Esta nova estampa pode ser publicada diretamente na sua galeria e lojinha pública sem você precisar comprá-la.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Botões de Ação Final */}
                  <div className="space-y-3 pt-2">
                    {/* Botão de Compra Direta (ou Compra de Ativação do Artista) */}
                    <Button
                      onClick={handleDirectBuy}
                      disabled={busy || isSaving || !approved || !selectedSize}
                      className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-xl shadow-emerald-600/25 transition-transform active:scale-95 disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processando Pedido...
                        </>
                      ) : (!hasPurchasedFirstPrint && isArtistProfileComplete) ? (
                        <>
                          <ShoppingBag className="w-5 h-5 mr-2" />
                          Comprar 1ª Estampa (R$ {currentPrice.toFixed(2)}) &amp; Ativar Loja
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Pagar com Pix ou Cartão Cielo (R$ {currentPrice.toFixed(2)})
                        </>
                      )}
                    </Button>

                    {/* Botão de Publicação do Artista */}
                    <Button
                      onClick={handlePublishClick}
                      disabled={busy || isSaving || !approved || !selectedSize}
                      variant="outline"
                      className="w-full h-12 rounded-2xl border-purple-300 text-purple-900 bg-purple-50/50 hover:bg-purple-100 font-bold text-xs"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Salvando...
                        </>
                      ) : hasPurchasedFirstPrint ? (
                        <>
                          <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
                          Publicar Direto na Minha Lojinha (Sem custo)
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      ) : (
                        <>
                          <Store className="w-4 h-4 mr-2 text-purple-600" />
                          Publicar Estampa &amp; Gerar Minha Lojinha
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de Finalizar Cadastro de Artista */}
      <ArtistRegistrationModal
        isOpen={showArtistModal}
        onClose={() => setShowArtistModal(false)}
        currentUser={currentUser}
        onSuccess={(updatedUser) => {
          setCurrentUser(prev => ({ ...prev, ...updatedUser }));
        }}
        onProceedToPurchase={() => {
          handleDirectBuy();
        }}
        productPrice={currentPrice}
      />

      {/* Modal Educativo da Regra da SEL (Primeira Compra do Artista) */}
      <Dialog open={showFirstPurchaseRuleModal} onOpenChange={setShowFirstPurchaseRuleModal}>
        <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-8 bg-card border border-border shadow-2xl">
          <DialogHeader className="text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold w-fit">
              <Store className="w-3.5 h-3.5" />
              Regra Oficial de Lojinhas SEL
            </div>
            <DialogTitle className="text-2xl font-black text-slate-950">
              Ative sua Loja com a 1ª Compra
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600 leading-relaxed">
              Para os artistas participarem da SEL e gerarem sua lojinha oficial, é necessário comprar a sua primeira estampa física.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs text-slate-700">
            <p>
              ✅ <strong>Garantia de Qualidade:</strong> Você confere em mãos o padrão do tecido, corte e acabamento da impressão DTF.
            </p>
            <p className="text-emerald-800 font-semibold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200/60">
              🚀 <strong>Liberdade Total:</strong> A partir do momento que você comprou a 1ª estampa, você pode gerar sua lojinha. <strong>Todas as próximas estampas que gerar lá dentro não precisam ser compradas por você!</strong> Você apenas gera, publica e as pessoas compram.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Button
              onClick={() => {
                setShowFirstPurchaseRuleModal(false);
                handleDirectBuy();
              }}
              className="w-full h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xl shadow-emerald-600/20"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Comprar 1ª Estampa (R$ {currentPrice.toFixed(2)}) &amp; Ativar Loja
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowFirstPurchaseRuleModal(false)}
              className="w-full h-10 rounded-xl border-slate-300 text-xs font-semibold"
            >
              Voltar e Continuar Editando
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}