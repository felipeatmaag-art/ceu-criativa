import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DesignCard from '../design/DesignCard';
import { motion } from 'framer-motion';

export default function FeaturedDesigns({ designs, title = "Estampas em Destaque", subtitle = "Descubra os designs mais amados pela comunidade" }) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
        >
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              {title}
            </h2>
            <p className="text-lg text-muted-foreground">{subtitle}</p>
          </div>
          <Link to={createPageUrl('Explore')}>
            <Button variant="ghost" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-xl">
              Ver Todas
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {designs?.map((design, index) => (
            <DesignCard key={design.id} design={design} index={index} />
          ))}
        </div>

        {/* Empty State */}
        {(!designs || designs.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-4xl">🎨</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma estampa ainda
            </h3>
            <p className="mb-6 text-muted-foreground">
              Seja o primeiro a criar uma estampa incrível!
            </p>
            <Link to={createPageUrl('Create')}>
              <Button className="ceu-gradient text-white rounded-xl">
                Criar Estampa
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  );
}