import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BadgeCheck, Heart, Palette, ArrowRight } from 'lucide-react';

export default function ArtistSpotlight() {
  const featuredArtist = {
    name: "Maria Silva",
    artistName: "Maria Silva",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
    cover: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200",
    bio: "Artista digital apaixonada por retratos e empoderamento feminino. Cada traço que faço carrega uma história de força e superação.",
    stats: {
      designs: 47,
      sales: 1234,
      followers: 892
    },
    designs: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400"
    ]
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 mb-4">
            ⭐ Artista em Destaque
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">
            Conheça {featuredArtist.name}
          </h2>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto">
            Uma história de transformação através da arte
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white rounded-[3rem] overflow-hidden shadow-2xl"
        >
          {/* Cover Image */}
          <div className="relative h-64 overflow-hidden">
            <img
              src={featuredArtist.cover}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </div>

          <div className="relative px-8 pb-8">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl border-8 border-white shadow-xl overflow-hidden">
                  <img
                    src={featuredArtist.avatar}
                    alt={featuredArtist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center border-4 border-white">
                  <BadgeCheck className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  {featuredArtist.artistName}
                </h3>
                <p className="text-gray-600 leading-relaxed max-w-2xl">
                  {featuredArtist.bio}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8 p-6 bg-purple-50 rounded-3xl">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{featuredArtist.stats.designs}</p>
                <p className="text-sm text-gray-500">Estampas</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <BadgeCheck className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{featuredArtist.stats.sales}</p>
                <p className="text-sm text-gray-500">Vendas</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{featuredArtist.stats.followers}</p>
                <p className="text-sm text-gray-500">Seguidores</p>
              </div>
            </div>

            {/* Designs Preview */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {featuredArtist.designs.map((design, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="aspect-square rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow"
                >
                  <img
                    src={design}
                    alt={`Design ${i + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </motion.div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex justify-center">
              <Link to={createPageUrl('Artists')}>
                <Button size="lg" className="ceu-gradient text-white rounded-2xl px-8 h-14 text-lg">
                  Conhecer Mais Artistas
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}