import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Heart, 
  Share2, 
  ShoppingBag, 
  Sparkles,
  BadgeCheck,
  ArrowLeft,
  Minus,
  Plus,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function DesignDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const designId = urlParams.get('id');

  const [selectedProduct, setSelectedProduct] = useState('camiseta');
  const [selectedColor, setSelectedColor] = useState('branco');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [isLiked, setIsLiked] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: design, isLoading } = useQuery({
    queryKey: ['design', designId],
    queryFn: async () => {
      const designs = await base44.entities.Design.filter({ id: designId });
      return designs[0];
    },
    enabled: !!designId,
  });

  const products = [
    { type: 'camiseta', label: 'Camiseta', price: 79.90, emoji: '👕' },
    { type: 'bone', label: 'Boné', price: 59.90, emoji: '🧢' },
    { type: 'caneca', label: 'Caneca', price: 49.90, emoji: '☕' },
    { type: 'quadro', label: 'Quadro', price: 129.90, emoji: '🖼️' },
    { type: 'ecobag', label: 'Ecobag', price: 39.90, emoji: '👜' },
    { type: 'almofada', label: 'Almofada', price: 69.90, emoji: '🛋️' },
  ];

  const colors = [
    { value: 'branco', label: 'Branco', hex: '#FFFFFF' },
    { value: 'preto', label: 'Preto', hex: '#1A1A1A' },
    { value: 'azul', label: 'Azul Marinho', hex: '#1E3A5F' },
    { value: 'cinza', label: 'Cinza', hex: '#6B7280' },
    { value: 'vermelho', label: 'Vermelho', hex: '#DC2626' },
  ];

  const sizes = ['PP', 'P', 'M', 'G', 'GG', 'XG'];

  const selectedProductData = products.find(p => p.type === selectedProduct);
  const totalPrice = (selectedProductData?.price || 0) * quantity;

  const handleAddToCart = () => {
    const cartItem = {
      id: Date.now(),
      design_image: design.image_url,
      design_title: design.title,
      product_type: selectedProduct,
      price: selectedProductData.price,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity
    };

    const existingCart = localStorage.getItem('cart');
    const cart = existingCart ? JSON.parse(existingCart) : [];
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const categoryLabels = {
    abstrato: 'Abstrato',
    natureza: 'Natureza',
    urbano: 'Urbano',
    minimalista: 'Minimalista',
    ilustracao: 'Ilustração',
    tipografia: 'Tipografia',
    geometrico: 'Geométrico',
    vintage: 'Vintage',
    pop_art: 'Pop Art',
    surreal: 'Surreal'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-3xl" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Design não encontrado</h2>
          <Link to={createPageUrl('Explore')}>
            <Button>Voltar para Explorar</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link to={createPageUrl('Explore')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Link>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="sticky top-28">
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-xl">
                <img
                  src={design.image_url}
                  alt={design.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                  {design.is_featured && (
                    <Badge className="bg-yellow-400 text-yellow-900 border-0">
                      ⭐ Destaque
                    </Badge>
                  )}
                  {design.is_ai_generated && (
                    <Badge className="bg-purple-600 text-white border-0">
                      <Sparkles className="w-3 h-3 mr-1" />
                      IA
                    </Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsLiked(!isLiked)}
                    className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-6 h-6 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                    />
                  </button>
                  <button className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
                    <Share2 className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div>
              <Badge variant="outline" className="mb-4 rounded-lg">
                {categoryLabels[design.category] || design.category}
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {design.title}
              </h1>
              <Link 
                to={createPageUrl(`ArtistProfile?id=${design.artist_id}`)}
                className="inline-flex items-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-xl ceu-gradient flex items-center justify-center">
                  <span className="text-white font-bold">
                    {design.artist_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 group-hover:text-purple-600 transition-colors">
                    {design.artist_name || 'Artista'}
                  </p>
                  <p className="text-sm text-gray-500">Ver perfil</p>
                </div>
              </Link>
            </div>

            {/* Description */}
            {design.description && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Sobre</h3>
                <p className="text-gray-600 leading-relaxed">{design.description}</p>
              </div>
            )}

            {/* Tags */}
            {design.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {design.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="rounded-full">
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Product Selection */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border space-y-6">
              {/* Product Type */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Produto</h3>
                <div className="grid grid-cols-3 gap-2">
                  {products.map((product) => (
                    <button
                      key={product.type}
                      onClick={() => setSelectedProduct(product.type)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        selectedProduct === product.type
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{product.emoji}</span>
                      <span className="text-sm font-medium">{product.label}</span>
                      <span className="text-xs text-gray-500 block">R$ {product.price.toFixed(2)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Cor</h3>
                <div className="flex gap-3">
                  {colors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setSelectedColor(color.value)}
                      className={`relative w-10 h-10 rounded-full transition-all ${
                        selectedColor === color.value
                          ? 'ring-2 ring-offset-2 ring-purple-500'
                          : ''
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    >
                      {selectedColor === color.value && (
                        <Check className={`w-5 h-5 absolute inset-0 m-auto ${
                          color.value === 'branco' ? 'text-gray-800' : 'text-white'
                        }`} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size */}
              {(selectedProduct === 'camiseta') && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Tamanho</h3>
                  <div className="flex gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-12 h-12 rounded-xl font-medium transition-all ${
                          selectedSize === size
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Quantidade</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Price & Buy */}
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500">Total</span>
                  <span className="text-3xl font-bold ceu-text-gradient">
                    R$ {totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="space-y-3">
                  <Button 
                    onClick={handleAddToCart}
                    className="w-full h-14 rounded-xl ceu-gradient text-white text-lg"
                    disabled={addedToCart}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Adicionado!
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-5 h-5 mr-2" />
                        Adicionar ao Carrinho
                      </>
                    )}
                  </Button>
                  {addedToCart && (
                    <Button 
                      onClick={() => navigate(createPageUrl('Cart'))}
                      variant="outline"
                      className="w-full h-12 rounded-xl"
                    >
                      Ver Carrinho
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 py-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{design.likes_count || 0}</p>
                <p className="text-sm text-gray-500">Curtidas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{design.sales_count || 0}</p>
                <p className="text-sm text-gray-500">Vendas</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}