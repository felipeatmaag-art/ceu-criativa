import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BadgeCheck, Heart, Palette, ArrowRight, Sparkles } from 'lucide-react';

export default function ArtistSpotlight() {
  const featuredArtist = {
    name: "Felipe Silvério",
    artistName: "Felipe Silvério",
    role: "Artista Visual & Diretor Criativo",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80",
    cover: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=80",
    bio: "Designer e artista visual autoral do Céu Criativa. Criações exclusivas que conectam o surrealismo gráfico contemporâneo, tipografia ousada e cultura urbana vibrante.",
    stats: {
      designs: 20,
      sales: "1.4k+",
      followers: 980
    },
    designs: [
      {
        title: "Tubarão Bomba",
        url: "https://media.base44.com/images/public/69431e0c00397efc6e14e9df/4dbb82288_Model_wearing_t-shirt_background_202608142141.jpeg"
      },
      {
        title: "Coração Anatômico",
        url: "https://media.base44.com/images/public/69431e0c00397efc6e14e9df/62d600816_Person_wearing_t-shirt_balcony_202608142142.jpeg"
      },
      {
        title: "Girassol All-Seeing Eye",
        url: "https://media.base44.com/images/public/69431e0c00397efc6e14e9df/d1d961289_Young_person_wearing_t-shirt_202608142142.jpeg"
      }
    ]
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-950 via-[#0d0e15] to-[#0a0a0f] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge className="bg-gradient-to-r from-emerald-500 to-blue-500 text-white border-0 mb-4 px-4 py-1.5 text-sm font-semibold shadow-lg shadow-emerald-500/20">
            <Sparkles className="w-4 h-4 mr-1.5 inline" /> Artista Residente Céu Criativa
          </Badge>
          <h2 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">
            Conheça <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">{featuredArtist.name}</span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Explorando as fronteiras entre arte autoral, vestuário conceitual e design independente.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl"
        >
          {/* Cover Image */}
          <div className="relative h-64 sm:h-72 overflow-hidden">
            <img
              src={featuredArtist.cover}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
          </div>

          <div className="relative px-6 sm:px-10 pb-10">
            {/* Avatar & Bio */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-20 mb-8">
              <div className="relative">
                <div className="w-32 h-32 rounded-3xl border-4 border-gray-900 shadow-2xl overflow-hidden bg-gray-800 ring-2 ring-emerald-500/50">
                  <img
                    src={featuredArtist.avatar}
                    alt={featuredArtist.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-gray-900 shadow-md">
                  <BadgeCheck className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-3xl font-black text-white">
                    {featuredArtist.artistName}
                  </h3>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Artista Verificado
                  </span>
                </div>
                <p className="text-gray-300 leading-relaxed max-w-2xl text-base">
                  {featuredArtist.bio}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 sm:gap-6 mb-8 p-6 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1.5 text-emerald-400">
                  <Palette className="w-5 h-5" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white">{featuredArtist.stats.designs}</p>
                <p className="text-xs sm:text-sm text-gray-400 font-medium">Estampas Autorais</p>
              </div>
              <div className="text-center border-x border-white/10">
                <div className="flex items-center justify-center gap-1.5 mb-1.5 text-blue-400">
                  <BadgeCheck className="w-5 h-5" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white">{featuredArtist.stats.sales}</p>
                <p className="text-xs sm:text-sm text-gray-400 font-medium">Peças Produzidas</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1.5 text-pink-400">
                  <Heart className="w-5 h-5" />
                </div>
                <p className="text-2xl sm:text-3xl font-black text-white">{featuredArtist.stats.followers}</p>
                <p className="text-xs sm:text-sm text-gray-400 font-medium">Seguidores</p>
              </div>
            </div>

            {/* Designs Preview */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Estampas em Destaque de Felipe Silvério
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {featuredArtist.designs.map((design, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-lg"
                  >
                    <img
                      src={design.url}
                      alt={design.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-sm font-bold text-white">{design.title}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/loja/felipe-silverio">
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl px-8 h-12 shadow-lg shadow-emerald-500/25">
                  Ver Loja de Felipe Silvério
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to={createPageUrl('Explore')}>
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/10 rounded-xl px-8 h-12">
                  Explorar Todas as Estampas
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}