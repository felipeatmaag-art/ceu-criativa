import React from 'react';
import { HandCoins, Palette, SlidersHorizontal, Users } from 'lucide-react';

const pillars = [
  { icon: Palette, title: 'Criação', text: 'Ferramentas simples e inteligência artificial para dar forma à sua expressão.' },
  { icon: SlidersHorizontal, title: 'Controle', text: 'Você acompanha suas peças, produtos e resultados em um só lugar.' },
  { icon: HandCoins, title: 'Monetização', text: 'Sua arte encontra público e se transforma em uma fonte de renda.' },
  { icon: Users, title: 'Comunidade', text: 'Artistas, criadores e produtores crescem por meio de colaboração real.' },
];

export default function AboutPillars() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <div className="mb-12 max-w-3xl">
        <p className="text-sm font-bold uppercase tracking-[.24em] text-ceu-aqua">O que é a Céu</p>
        <h2 className="mt-4 text-4xl font-bold tracking-tight text-ceu-cloud sm:text-6xl">Um ecossistema para criar e acontecer.</h2>
        <p className="mt-5 text-lg leading-relaxed text-gray-400">A Céu encurta a distância entre a expectativa de viver da criatividade e a realidade de produzir, vender e construir uma trajetória autoral.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {pillars.map(({ icon: Icon, title, text }, index) => (
          <article key={title} className={`min-h-72 rounded-[2rem] p-7 ${index === 0 ? 'bg-ceu-sky text-ceu-navy' : index === 1 ? 'bg-ceu-sun text-ceu-navy' : index === 2 ? 'bg-ceu-coral text-ceu-navy' : 'bg-ceu-aqua text-ceu-navy'}`}>
            <Icon className="h-8 w-8" />
            <h3 className="mt-20 text-3xl font-bold">{title}</h3>
            <p className="mt-3 leading-relaxed text-ceu-navy/75">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}