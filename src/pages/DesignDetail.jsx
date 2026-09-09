import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Check,
  UserPlus,
  UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import MockupViewer from '@/components/design/MockupViewer';
import CommentSection from '@/components/design/CommentSection';
import PhysicalVariantPicker from '@/components/design/PhysicalVariantPicker';
import { cartStore } from '@/services/cartStore';

export default function DesignDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const designId = urlParams.get('id');

  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('camiseta');
  const [selectedColor, setSelectedColor] = useState('white');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [physical, setPhysical] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  const { data: design, isLoading } = useQuery({
    queryKey: ['design', designId],
    queryFn: async () => {
      const designs = await base44.entities.Design.filter({ id: designId });
      return designs[0];
    },
    enabled: !!designId,
  });

  const { data: isLiked = false } = useQuery({
    queryKey: ['like', designId, user?.email],
    queryFn: async () => {
      if (!user) return false;
      const likes = await base44.entities.Like.filter({ 
        design_id: designId, 
        user_email: user.email 
      });
      return likes.length > 0;
    },
    enabled: !!designId && !!user,
  });

  const { data: isFollowing = false } = useQuery({
    queryKey: ['follow', design?.artist_id, user?.email],
    queryFn: async () => {
      if (!user || !design) return false;
      const follows = await base44.entities.Follow.filter({ 
        follower_email: user.email,
        following_artist_id: design.artist_id
      });
      return follows.length > 0;
    },
    enabled: !!design?.artist_id && !!user,
  });

  const likeMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      if (isLiked) {
        const likes = await base44.entities.Like.filter({ 
          design_id: designId, 
          user_email: user.email 
        });
        if (likes[0]) {
          await base44.entities.Like.delete(likes[0].id);
        }
      } else {
        await base44.entities.Like.create({
          design_id: designId,
          user_email: user.email
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['like', designId, user?.email] });
      queryClient.invalidateQueries({ queryKey: ['design', designId] });
    },
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user || !design) return;
      if (isFollowing) {
        const follows = await base44.entities.Follow.filter({ 
          follower_email: user.email,
          following_artist_id: design.artist_id
        });
        if (follows[0]) {
          await base44.entities.Follow.delete(follows[0].id);
        }
      } else {
        await base44.entities.Follow.create({
          follower_email: user.email,
          following_artist_id: design.artist_id
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow', design?.artist_id, user?.email] });
    },
  });

  const totalPrice = Number(physical?.product.base_price || 0) * quantity;
  const handlePhysicalChange = choice => {
    setPhysical(choice); setQuantity(1); setAddedToCart(false);
    if (choice) {
      setSelectedProduct(choice.product.type);
      setSelectedColor(choice.product.product_color_variants?.find(c => c.name === choice.variant.color)?.hex || 'white');
      setSelectedSize(choice.variant.size);
    }
  };
  const handleAddToCart = () => {
    if (!physical || quantity > physical.variant.stock_quantity) return;
    cartStore.add({ id: crypto.randomUUID(), design_id: design.id, artist_id: design.artist_id, design_image: design.image_url, design_title: design.title, base_product_id: physical.product.id, catalog_product_id: physical.product.id, variant_id: physical.variant.id, product_type: physical.product.type, price: Number(physical.product.base_price), color: physical.variant.color, size: physical.variant.size, quantity });
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
          {/* Mockup Viewer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="sticky top-28 space-y-4">
              <MockupViewer 
                production={design.production}
                designImage={design.image_url}
                selectedProduct={selectedProduct}
                selectedColor={selectedColor}
              />
              
              {/* Badges */}
              <div className="flex gap-2">
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

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => user ? likeMutation.mutate() : base44.auth.redirectToLogin()}
                  variant="outline"
                  className={`flex-1 h-12 rounded-xl ${
                    isLiked ? 'bg-red-50 border-red-300 text-red-600' : ''
                  }`}
                  disabled={likeMutation.isPending}
                >
                  <Heart className={`w-5 h-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Curtido' : 'Curtir'}
                </Button>
                <Button
                  variant="outline"
                  className="h-12 rounded-xl"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
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
              <div className="flex items-center justify-between mb-6">
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
                {user && user.id !== design.artist_id && (
                  <Button
                    onClick={() => followMutation.mutate()}
                    variant={isFollowing ? 'outline' : 'default'}
                    className={`rounded-xl ${
                      isFollowing ? '' : 'ceu-gradient text-white'
                    }`}
                    disabled={followMutation.isPending}
                  >
                    {isFollowing ? (
                      <>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Seguindo
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Seguir
                      </>
                    )}
                  </Button>
                )}
              </div>
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
              <PhysicalVariantPicker onChange={handlePhysicalChange} />

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
                    onClick={() => setQuantity(Math.min(10, physical?.variant.stock_quantity || 1, quantity + 1))}
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
                    disabled={addedToCart || !physical || quantity > physical.variant.stock_quantity}
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
            <div className="flex items-center gap-8 py-4 border-t">
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

        {/* Comments Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <CommentSection designId={designId} />
        </div>
      </div>
    </div>
  );
}