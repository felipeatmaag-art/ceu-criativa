import React from 'react';
import { Box, MousePointerClick, Printer, Store } from 'lucide-react';

const steps = [
  { icon: MousePointerClick, title: 'Você cria', text: 'Desenvolva ou envie sua arte e visualize a aplicação em produtos.' },
  { icon: Printer, title: 'A rede produz', text: 'A impressão por demanda reduz barreiras, estoque e desperdício.' },
  { icon: Box, title: 'A peça ganha o mundo', text: 'A criação se materializa com acabamento e identidade autoral.' },
  { icon: Store, title: 'Você vende', text: 'Sua vitrine aproxima público, história e produto em um só lugar.' },
];

export default function AboutJourney() {
  return (
    <section className="bg-ceu-cloud py-24 text-ceu-navy">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[.24em] text-ceu-navy/55">Da tela para a vida</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">Poucos cliques. Muitas possibilidades.</h2>
            <p className="mt-6 text-lg leading-relaxed text-ceu-navy/70">A tecnologia organiza o caminho. A criatividade continua sendo sua.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {steps.map(({ icon: Icon, title, text }, index) => (
              <article key={title} className="rounded-[2rem] border border-ceu-navy/10 bg-background p-6">
                <div className="flex items-center justify-between">
                  <Icon className="h-7 w-7 text-ceu-aqua" />
                  <span className="text-4xl font-bold text-ceu-navy/10">0{index + 1}</span>
                </div>
                <h3 className="mt-8 text-2xl font-bold">{title}</h3>
                <p className="mt-3 leading-relaxed text-ceu-navy/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}