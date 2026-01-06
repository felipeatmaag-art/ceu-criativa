import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Heart, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

export default function DesignCard({ design, onLike, index = 0 }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    if (onLike) onLike(design.id);
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={createPageUrl(`DesignDetail?id=${design.id}`)}>
        <div className="relative glass-card rounded-3xl overflow-hidden hover-glow transition-all duration-500 transform hover:-translate-y-2">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden">
            <img
              src={design.image_url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500'}
              alt={design.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isHovered ? 1 : 0 }}
              className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"
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

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
              className="absolute bottom-4 left-4 right-4 flex gap-2"
            >
              <Button
                size="sm"
                className="flex-1 ceu-gradient text-white rounded-xl hover-glow"
              >
                <ShoppingBag className="w-4 h-4 mr-2" />
                Comprar
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="glass-card text-emerald-400 hover-glow rounded-xl"
              >
                <Eye className="w-4 h-4" />
              </Button>
            </motion.div>

            {/* Like Button */}
            <button
              onClick={handleLike}
              className="absolute top-4 right-4 w-10 h-10 rounded-full glass-card hover-glow flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <Heart
                className={`w-5 h-5 transition-colors ${
                  isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            </button>
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="font-semibold text-white text-lg leading-tight line-clamp-1">
                  {design.title}
                </h3>
                <p className="text-sm text-gray-400 mt-1">
                  por <span className="text-emerald-400 font-medium">{design.artist_name || 'Artista'}</span>
                </p>
              </div>
              <Badge variant="outline" className="shrink-0 rounded-lg">
                {categoryLabels[design.category] || design.category}
              </Badge>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-white/10">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  {design.likes_count || 0}
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingBag className="w-4 h-4" />
                  {design.sales_count || 0}
                </span>
              </div>
              <p className="text-lg font-bold ceu-text-gradient">
                R$ {(design.price_base || 49.90).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}