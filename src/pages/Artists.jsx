import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  BadgeCheck, 
  Palette, 
  Heart,
  Instagram,
  Twitter,
  Globe,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function Artists() {
  const [search, setSearch] = useState('');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['artists'],
    queryFn: () => base44.entities.User.list('-total_sales', 50),
  });

  // Filter only users who have artist_name (are artists)
  const artists = users.filter(u => u.artist_name);
  
  const filteredArtists = artists.filter(artist => 
    artist.artist_name?.toLowerCase().includes(search.toLowerCase()) ||
    artist.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    artist.bio?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
            <Palette className="w-4 h-4" />
            Comunidade
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Artistas da Céu
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Conheça os talentos por trás das estampas mais incríveis
          </p>
        </motion.div>

        {/* Search */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar artistas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 h-14 rounded-2xl border-gray-200 focus:border-purple-500 focus:ring-purple-500 text-lg"
            />
          </div>
        </div>

        {/* Artists Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-4">
                  <Skeleton className="w-16 h-16 rounded-2xl" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : filteredArtists.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist, index) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link to={createPageUrl(`ArtistProfile?id=${artist.id}`)}>
                  <div className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2">
                    {/* Cover Image */}
                    {artist.cover_url && (
                      <div className="h-24 -mx-6 -mt-6 mb-4 overflow-hidden rounded-t-3xl">
                        <img
                          src={artist.cover_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <div className="w-16 h-16 rounded-2xl ceu-gradient flex items-center justify-center overflow-hidden">
                          {artist.avatar_url ? (
                            <img
                              src={artist.avatar_url}
                              alt={artist.artist_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-white text-2xl font-bold">
                              {artist.artist_name?.charAt(0) || 'A'}
                            </span>
                          )}
                        </div>
                        {artist.is_verified_artist && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-white">
                            <BadgeCheck className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900 truncate">
                            {artist.artist_name || artist.full_name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500">
                          @{artist.artist_name?.toLowerCase().replace(/\s+/g, '') || 'artista'}
                        </p>
                      </div>
                    </div>

                    {/* Bio */}
                    {artist.bio && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {artist.bio}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Palette className="w-4 h-4" />
                        <span>{artist.total_sales || 0} vendas</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Heart className="w-4 h-4" />
                        <span>{artist.followers_count || 0} seguidores</span>
                      </div>
                    </div>

                    {/* Social Links */}
                    {(artist.social_instagram || artist.social_twitter || artist.social_portfolio) && (
                      <div className="flex items-center gap-2 mt-4">
                        {artist.social_instagram && (
                          <a
                            href={artist.social_instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-purple-100 transition-colors"
                          >
                            <Instagram className="w-4 h-4 text-gray-600" />
                          </a>
                        )}
                        {artist.social_twitter && (
                          <a
                            href={artist.social_twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-purple-100 transition-colors"
                          >
                            <Twitter className="w-4 h-4 text-gray-600" />
                          </a>
                        )}
                        {artist.social_portfolio && (
                          <a
                            href={artist.social_portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-purple-100 transition-colors"
                          >
                            <Globe className="w-4 h-4 text-gray-600" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
              <Palette className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {search ? 'Nenhum artista encontrado' : 'Nenhum artista ainda'}
            </h3>
            <p className="text-gray-500 mb-6">
              {search ? 'Tente buscar por outros termos' : 'Seja o primeiro artista da Céu!'}
            </p>
            <Link to={createPageUrl('Create')}>
              <Button className="ceu-gradient text-white rounded-xl">
                Criar minha primeira estampa
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}