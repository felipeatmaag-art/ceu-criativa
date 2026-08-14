import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Sparkles, Clock, Shirt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Curitiba', 'Brasília', 'Porto Alegre'];

const steps = [
  { icon: Sparkles, title: 'Escolha seu design', text: 'Navegue pelo catálogo ou crie sua estampa na hora no totem.' },
  { icon: Shirt, title: 'Personalize a peça', text: 'Selecione modelo, cor e tamanho — veja o mockup instantâneo.' },
  { icon: Clock, title: 'Leve na hora', text: 'A estampa é produzida e aplicada enquanto você espera.' },
];

export default function KioskExperience() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden glass-card"
          >
            <img
              src="https://media.base44.com/images/public/69431e0c00397efc6e14e9df/f34d3a16d_Man_watching_t-shirt_printing_202608131923.jpeg"
              alt="Quiosque Céu em shopping"
              className="w-full aspect-[4/3] object-cover"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur text-white text-xs font-medium">
              <MapPin className="w-3.5 h-3.5" />
              Em breve nos principais shoppings
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-block px-4 py-1.5 rounded-full glass-effect text-xs font-medium tracking-wide text-gray-200 mb-4">
              Experiência Céu
            </span>
            <h2 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Sua camiseta, <span className="ceu-text-gradient">feita na hora</span>
            </h2>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Quiosques interativos nos shoppings das maiores cidades. Você escolhe a estampa,
              personaliza a peça e sai vestindo — tudo produzido ali, na sua frente.
            </p>

            <div className="space-y-4 mb-8">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <div key={i} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl ceu-gradient flex items-center justify-center shadow-lg shadow-emerald-500/30">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-0.5">{s.title}</h3>
                      <p className="text-sm text-gray-400">{s.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mb-8">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Próximas paradas</p>
              <div className="flex flex-wrap gap-2">
                {cities.map((c) => (
                  <span key={c} className="px-3 py-1.5 rounded-full glass-effect text-sm text-gray-200">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <Link to={createPageUrl('Create')}>
              <Button size="lg" className="ceu-gradient text-white rounded-2xl px-8 h-12 font-semibold">
                Criar minha estampa
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}