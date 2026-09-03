import React from 'react';
import { motion } from 'framer-motion';
import { Palette, ScanSearch, PackageCheck } from 'lucide-react';

const STEPS = [
  { icon: Palette, number: '01', title: 'Crie', text: 'Dê forma à ideia com IA e direção artística.' },
  { icon: ScanSearch, number: '02', title: 'Visualize', text: 'Teste a arte em produtos antes de produzir.' },
  { icon: PackageCheck, number: '03', title: 'Materialize', text: 'Transforme o conceito em uma peça pronta.' },
];

export default function StudioVisual() {
  return (
    <div className="grid lg:grid-cols-[minmax(0,1.7fr)_minmax(18rem,0.7fr)] gap-6 mb-16 items-stretch">
      <motion.figure
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative aspect-video overflow-hidden rounded-[2rem] border border-cyan-300/20 bg-slate-950 shadow-2xl shadow-cyan-950/40"
      >
        <img
          src="https://media.base44.com/images/public/69431e0c00397efc6e14e9df/3622ebebb_AI_creation_studio_mockups_2K_20260814131222.jpeg"
          alt="Artista criando e aplicando uma estampa em diferentes produtos no estúdio digital Céu"
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
        <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Estúdio Céu em ação</p>
          <h3 className="max-w-xl text-xl font-semibold text-white sm:text-2xl">Uma criação, vários produtos, visualização em tempo real.</h3>
        </figcaption>
      </motion.figure>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3">
        {STEPS.map(({ icon: Icon, number, title, text }, index) => (
          <motion.article key={title} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="flex items-start gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300"><Icon className="h-5 w-5" /></div>
            <div><span className="text-xs font-bold tracking-widest text-cyan-400">{number}</span><h4 className="text-lg font-semibold text-white">{title}</h4><p className="mt-1 text-sm leading-relaxed text-gray-400">{text}</p></div>
          </motion.article>
        ))}
      </div>
    </div>
  );
}