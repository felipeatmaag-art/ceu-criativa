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
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [sortBy, setSortBy] = useState('-created_date');
  const [gridCols, setGridCols] = useState(4);

  const { data: categoryRecords = [] } = useQuery({ queryKey: ['catalog-categories'], queryFn: () => base44.entities.Category.list('position_order', 100) });
  const { data: collections = [] } = useQuery({ queryKey: ['public-collections'], queryFn: () => base44.entities.Collection.filter({ is_public: true, is_active: true }, 'position_order', 100) });
  const categories = [{ value: 'all', slug: 'all', label: 'Todas', emoji: '🎨' }, ...categoryRecords.map((item) => ({ value: item.id, slug: item.slug, label: item.name, emoji: item.icon || '✦' }))];

  const { data: designs = [], isLoading } = useQuery({
    queryKey: ['designs', sortBy],
    queryFn: () => base44.entities.Design.filter({ status: 'aprovado' }, sortBy, 100),
  });

  const filteredDesigns = designs.filter((design) => {
    const term = search.toLowerCase();
    const category = categories.find((item) => item.value === selectedCategory);
    const activeCollection = collections.find((item) => item.id === selectedCollection);
    const matchesText = design.title?.toLowerCase().includes(term) || design.artist_name?.toLowerCase().includes(term) || design.tags?.some((tag) => tag.toLowerCase().includes(term));
    const matchesCategory = selectedCategory === 'all' || design.category_id === selectedCategory || design.category === category?.slug?.replace('-', '_');
    const matchesCollection = selectedCollection === 'all' || design.collection_id === selectedCollection || activeCollection?.design_ids?.includes(design.id);
    return matchesText && matchesCategory && matchesCollection;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-ceu-cloud to-background text-foreground">
      {/* Header */}
      <div className="sticky top-20 z-40 border-b bg-card text-card-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-700" />
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
                  <X className="h-4 w-4 text-slate-700" />
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
              <Select value={selectedCollection} onValueChange={setSelectedCollection}>
                <SelectTrigger className="w-44 h-12 rounded-xl"><SelectValue placeholder="Coleção" /></SelectTrigger>
                <SelectContent><SelectItem value="all">Todas as coleções</SelectItem>{collections.map((item) => <SelectItem key={item.id} value={item.id}>{item.title}</SelectItem>)}</SelectContent>
              </Select>
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
                    <p className="text-sm font-semibold text-slate-800">Categorias</p>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => (
                        <Button
                          key={cat.value}
                          variant={selectedCategory === cat.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCategory(cat.value)}
                          className={`rounded-full ${
                            selectedCategory === cat.value 
                              ? 'bg-ceu-navy text-ceu-cloud hover:bg-ceu-navy/90' 
                              : 'border-slate-300 text-slate-900 hover:bg-slate-100'
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
                    ? 'bg-ceu-navy text-ceu-cloud hover:bg-ceu-navy/90' 
                    : 'text-slate-900 hover:bg-slate-100'
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
          <p className="font-medium text-slate-700">
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
            <AnimatePresence>
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
            <p className="text-slate-700">
              Tente ajustar seus filtros ou buscar por outros termos
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}