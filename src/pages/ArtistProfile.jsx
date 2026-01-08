import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, Instagram, Twitter, Globe } from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import DesignCard from '@/components/design/DesignCard';

export default function ArtistProfile() {
  const urlParams = new URLSearchParams(window.location.search);
  const artistId = urlParams.get('id');

  const { data: artist, isLoading: artistLoading } = useQuery({
    queryKey: ['artist', artistId],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ id: artistId });
      return users[0];
    },
    enabled: !!artistId,
  });

  const { data: designs = [], isLoading: designsLoading } = useQuery({
    queryKey: ['artist-designs', artistId],
    queryFn: () => base44.entities.Design.filter({ artist_id: artistId, status: 'aprovado' }, '-created_date', 50),
    enabled: !!artistId,
  });

  if (artistLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Skeleton className="h-64 rounded-3xl mb-8" />
          <div className="grid md:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Artista não encontrado</h2>
          <Link to={createPageUrl('Artists')}>
            <Button>Voltar para Artistas</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <Link to={createPageUrl('Artists')} className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </Link>
      </div>

      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
      >
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
          {/* Cover */}
          <div 
            className="h-48 ceu-gradient"
            style={{
              backgroundImage: artist.cover_image ? `url(${artist.cover_image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />

          <div className="px-8 pb-8">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 mb-6">
              <div className="w-32 h-32 rounded-2xl bg-white shadow-xl border-4 border-white overflow-hidden">
                {artist.avatar_url ? (
                  <img src={artist.avatar_url} alt={artist.full_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full ceu-gradient flex items-center justify-center text-4xl font-bold text-white">
                    {artist.artist_name?.charAt(0) || artist.full_name?.charAt(0) || 'A'}
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900">
                  {artist.artist_name || artist.full_name}
                </h1>
                {artist.bio && (
                  <p className="text-gray-600 mt-2 max-w-2xl">{artist.bio}</p>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">{designs.length}</p>
                <p className="text-sm text-gray-500">Designs</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">
                  {designs.reduce((sum, d) => sum + (d.sales_count || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">Vendas</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <p className="text-2xl font-bold text-gray-900">
                  {designs.reduce((sum, d) => sum + (d.likes_count || 0), 0)}
                </p>
                <p className="text-sm text-gray-500">Curtidas</p>
              </div>
            </div>

            {/* Social Links */}
            {(artist.instagram || artist.twitter || artist.website) && (
              <div className="flex flex-wrap gap-3">
                {artist.instagram && (
                  <a 
                    href={`https://instagram.com/${artist.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <Instagram className="w-4 h-4" />
                    <span className="text-sm">@{artist.instagram}</span>
                  </a>
                )}
                {artist.twitter && (
                  <a 
                    href={`https://twitter.com/${artist.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                    <span className="text-sm">@{artist.twitter}</span>
                  </a>
                )}
                {artist.website && (
                  <a 
                    href={artist.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="text-sm">Website</span>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Designs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Designs do Artista</h2>
        
        {designsLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : designs.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {designs.map((design, index) => (
              <DesignCard key={design.id} design={design} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">Nenhum design publicado ainda</p>
          </div>
        )}
      </div>
    </div>
  );
}