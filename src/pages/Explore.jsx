import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import DesignCard from '@/components/design/DesignCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  SlidersHorizontal, 
  Sparkles,
  Grid3X3,
  LayoutGrid,
  X
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function Explore() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');
  const [gridCols, setGridCols] = useState(4);

  const categories = [
    { value: 'all', label: 'Todas', emoji: '🎨' },
    { value: 'abstrato', label: 'Abstrato', emoji: '🌀' },
    { value: 'natureza', label: 'Natureza', emoji: '🌿' },
    { value: 'urbano', label: 'Urbano', emoji: '🏙️' },
    { value: 'minimalista', label: 'Minimalista', emoji: '◽' },
    { value: 'ilustracao', label: 'Ilustração', emoji: '✏️' },
    { value: 'tipografia', label: 'Tipografia', emoji: '🔤' },
    { value: 'geometrico', label: 'Geométrico', emoji: '📐' },
    { value: 'vintage', label: 'Vintage', emoji: '📻' },
    { value: 'pop_art', label: 'Pop Art', emoji: '🎭' },
    { value: 'surreal', label: 'Surreal', emoji: '👁️' },
  ];

  const { data: designs = [], isLoading } = useQuery({
    queryKey: ['designs', selectedCategory, sortBy],
    queryFn: async () => {
      const query = { status: 'aprovado' };
      if (selectedCategory !== 'all') {
        query.category = selectedCategory;
      }
      return base44.entities.Design.filter(query, sortBy, 50);
    },
  });

  const filteredDesigns = designs.filter(design => 
    design.title?.toLowerCase().includes(search.toLowerCase()) ||
    design.artist_name?.toLowerCase().includes(search.toLowerCase()) ||
    design.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white">
      {/* Header */}
      <div className="bg-white border-b sticky top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar estampas, artistas, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12 h-12 rounded-xl border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-12 rounded-xl">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="-created_date">Mais Recentes</SelectItem>
                  <SelectItem value="-likes_count">Mais Curtidos</SelectItem>
                  <SelectItem value="-sales_count">Mais Vendidos</SelectItem>
                  <SelectItem value="price_base">Menor Preço</SelectItem>
                  <SelectItem value="-price_base">Maior Preço</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden sm:flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-lg ${gridCols === 3 ? 'bg-white shadow' : ''}`}
                  onClick={() => setGridCols(3)}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-lg ${gridCols === 4 ? 'bg-white shadow' : ''}`}
                  onClick={() => setGridCols(4)}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="h-12 rounded-xl lg:hidden">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <SheetHeader>
                    <SheetTitle>Filtros</SheetTitle>
                  </SheetHeader>
                  <div className="py-6 space-y-4">
                    <p className="text-sm font-medium text-gray-500">Categorias</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Button
                          key={cat.value}
                          variant={selectedCategory === cat.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCategory(cat.value)}
                          className={`rounded-full ${
                            selectedCategory === cat.value 
                              ? 'ceu-gradient text-white' 
                              : ''
                          }`}
                        >
                          <span className="mr-1">{cat.emoji}</span>
                          {cat.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Categories - Desktop */}
          <div className="hidden lg:flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={selectedCategory === cat.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setSelectedCategory(cat.value)}
                className={`rounded-full shrink-0 ${
                  selectedCategory === cat.value 
                    ? 'ceu-gradient text-white' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{cat.emoji}</span>
                {cat.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-500">
            {filteredDesigns.length} estampas encontradas
          </p>
          {selectedCategory !== 'all' && (
            <Badge 
              variant="secondary" 
              className="cursor-pointer hover:bg-gray-200"
              onClick={() => setSelectedCategory('all')}
            >
              {categories.find(c => c.value === selectedCategory)?.label}
              <X className="w-3 h-3 ml-1" />
            </Badge>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className={`grid gap-6 ${
            gridCols === 3 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}>
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm">
                <Skeleton className="aspect-square" />
                <div className="p-5">
                  <Skeleton className="h-5 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredDesigns.length > 0 ? (
          <div className={`grid gap-6 ${
            gridCols === 3 
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          }`}>
            <AnimatePresence mode="popLayout">
              {filteredDesigns.map((design, index) => (
                <DesignCard key={design.id} design={design} index={index} />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
              <Sparkles className="w-12 h-12 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma estampa encontrada
            </h3>
            <p className="text-gray-500">
              Tente ajustar seus filtros ou buscar por outros termos
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}