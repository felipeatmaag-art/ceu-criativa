import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import DesignCard from '@/components/design/DesignCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function Favorites() {
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const favoriteIds = user?.favorite_designs || [];

  const { data: designs = [], isLoading } = useQuery({
    queryKey: ['favorite-designs', favoriteIds],
    queryFn: async () => {
      if (favoriteIds.length === 0) return [];
      const allDesigns = await base44.entities.Design.list('-created_date', 100);
      return allDesigns.filter(d => favoriteIds.includes(d.id));
    },
    enabled: favoriteIds.length > 0,
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Meus Favoritos</h1>
          <p className="text-gray-500 mt-1">{designs.length} estampas salvas</p>
        </motion.div>

        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm">
                <Skeleton className="aspect-square" />
                <div className="p-5">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : designs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {designs.map((design, index) => (
              <DesignCard key={design.id} design={design} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-pink-100 flex items-center justify-center">
              <Heart className="w-12 h-12 text-pink-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum favorito ainda
            </h3>
            <p className="text-gray-500 mb-6">
              Explore estampas e salve suas favoritas!
            </p>
            <Link to={createPageUrl('Explore')}>
              <Button className="ceu-gradient text-white rounded-xl">
                Explorar Estampas
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}