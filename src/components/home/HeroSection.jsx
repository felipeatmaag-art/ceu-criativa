import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50" />
      
      {/* Animated Shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
            scale: { duration: 10, repeat: Infinity }
          }}
          className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-purple-200/40 to-pink-200/40 blur-3xl"
        />
        <motion.div
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotate: { duration: 50, repeat: Infinity, ease: "linear" },
            scale: { duration: 8, repeat: Infinity }
          }}
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-200/40 to-purple-200/40 blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4" />
              Crie com Inteligência Artificial
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Sua arte no{' '}
              <span className="ceu-text-gradient">Céu</span>
              <br />
              <span className="text-gray-400">e no mundo</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-lg leading-relaxed">
              Crie estampas únicas, venda seus designs e ganhe comissões. 
              Use nossa IA para dar vida às suas ideias ou envie suas próprias criações.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to={createPageUrl('Create')}>
                <Button 
                  size="lg" 
                  className="ceu-gradient text-white rounded-2xl px-8 h-14 text-lg hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/25"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Criar com IA
                </Button>
              </Link>
              <Link to={createPageUrl('Explore')}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="rounded-2xl px-8 h-14 text-lg border-2 hover:bg-gray-50"
                >
                  Explorar Estampas
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-12 mt-12 pt-8 border-t border-gray-200">
              <div>
                <p className="text-3xl font-bold ceu-text-gradient">10K+</p>
                <p className="text-gray-500 text-sm">Artistas</p>
              </div>
              <div>
                <p className="text-3xl font-bold ceu-text-gradient">50K+</p>
                <p className="text-gray-500 text-sm">Estampas</p>
              </div>
              <div>
                <p className="text-3xl font-bold ceu-text-gradient">100K+</p>
                <p className="text-gray-500 text-sm">Vendas</p>
              </div>
            </div>
          </motion.div>

          {/* Right Content - Floating Cards */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative h-[600px]">
              {/* Main Card */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72"
              >
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500"
                    alt="Design destaque"
                    className="w-full aspect-square object-cover"
                  />
                  <div className="p-4">
                    <p className="font-semibold">Aurora Boreal</p>
                    <p className="text-sm text-gray-500">por @artista</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Card 1 */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute left-0 top-10 w-48"
              >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1634017839464-5c339bbe3f35?w=300"
                    alt="Design"
                    className="w-full aspect-square object-cover"
                  />
                </div>
              </motion.div>

              {/* Floating Card 2 */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute right-0 bottom-20 w-40"
              >
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1549490349-8643362247b5?w=300"
                    alt="Design"
                    className="w-full aspect-square object-cover"
                  />
                </div>
              </motion.div>

              {/* Product Preview Badge */}
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute right-10 top-20 bg-white rounded-2xl shadow-xl p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-xl">👕</span>
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Camiseta</p>
                    <p className="text-xs text-gray-500">R$ 79,90</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}