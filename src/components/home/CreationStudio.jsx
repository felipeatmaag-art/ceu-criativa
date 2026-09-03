import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { Sparkles, Cpu, Layers, Boxes, Zap, ArrowRight } from 'lucide-react';

const STUDIO_IMAGES = [
  {
    url: 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/3622ebebb_AI_creation_studio_mockups_2K_20260814131222.jpeg',
    label: 'Plataforma Genesis Studios',
    caption: 'IA & 3D Mockups em tempo real',
  },
  {
    url: 'https://media.base44.com/images/public/69431e0c00397efc6e14e9df/a49f28b1d_AI_creation_studio_mockups_2K_202608141308.jpeg',
    label: 'Asset Engine v10.0',
    caption: 'Renderização 4K de têxtil e produto',
  },
];

const CAPABILITIES = [
  { icon: Cpu, title: 'Geração por IA', description: 'Crie padrões únicos em segundos, do conceito ao arquivo final.' },
  { icon: Layers, title: 'Aplicação Têxtil', description: 'Veja sua estampa aplicada em camisetas, moletons e tecidos.' },
  { icon: Boxes, title: 'Mockups 3D', description: 'Pré-visualização realista em canecas, quadros e ecobags.' },
  { icon: Zap, title: 'Render 4K', description: 'Qualidade de impressão ultra-resolvida, pronta para produção.' },
];

export default function CreationStudio() {
  return (
    <section className="relative py-28 overflow-hidden bg-[#0a0a0f]">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[40rem] h-[40rem] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-effect text-cyan-300 text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Estúdio de Criação
          </span>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-5 leading-tight">
            Do pensamento à estampa,{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-emerald-400 to-blue-500 bg-clip-text text-transparent">
              em tempo real
            </span>
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Um estúdio digital onde a inteligência artificial encontra o olhar do artista.
            Cada pixel é uma decisão criativa compartilhada entre humano e máquina.
          </p>
        </motion.div>

        {/* Studio Images */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {STUDIO_IMAGES.map((img, i) => (
            <motion.div
              key={img.url}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="group relative rounded-3xl overflow-hidden glass-effect hover-glow"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={img.url}
                  alt={img.label}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-cyan-400 mb-1">{img.caption}</p>
                  <h3 className="text-xl font-semibold text-white">{img.label}</h3>
                </div>
                <span className="w-10 h-10 rounded-full glass-effect flex items-center justify-center text-cyan-300 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Capabilities */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 hover-glow"
              >
                <div className="w-12 h-12 rounded-xl ceu-gradient flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h4 className="text-white font-semibold mb-1.5">{cap.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{cap.description}</p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-gray-400 mb-6 max-w-xl mx-auto">
            Não é mágica — é tecnologia a serviço da sua criatividade. Entre no estúdio e
            materialize sua próxima estampa.
          </p>
          <Link to={createPageUrl('Create')}>
            <Button
              size="lg"
              className="ceu-gradient text-white rounded-2xl px-10 h-14 text-base font-semibold hover:opacity-90"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Entrar no estúdio
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}