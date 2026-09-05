import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HeartHandshake, Leaf, Trophy } from 'lucide-react';

const values = [
  { icon: HeartHandshake, title: 'Cooperativismo', text: 'Porque ninguém precisa construir tudo sozinho.' },
  { icon: Leaf, title: 'Sustentabilidade', text: 'Produção responsável, sob demanda e com menos desperdício.' },
  { icon: Trophy, title: 'Participação', text: 'Concursos, indicações e comunidade para movimentar talentos.' },
];

export default function AboutImpact() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <div className="overflow-hidden rounded-[2.5rem] bg-ceu-sun text-ceu-navy">
        <div className="grid lg:grid-cols-[1.1fr_.9fr]">
          <div className="p-8 sm:p-14">
            <p className="text-sm font-bold uppercase tracking-[.24em]">A gente faz acontecer</p>
            <h2 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">O que é perto de você pode chegar muito mais longe.</h2>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ceu-navy/70">A Céu conecta talento, produção e mercado para ampliar a autonomia de quem cria e valorizar relações mais justas.</p>
            <Link to="/Artists" className="mt-9 inline-flex items-center gap-2 rounded-full bg-ceu-navy px-7 py-4 font-semibold text-ceu-cloud transition-transform active:scale-95">
              Conhecer a comunidade <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-px bg-ceu-navy/10 sm:grid-cols-3 lg:grid-cols-1">
            {values.map(({ icon: Icon, title, text }) => (
              <article key={title} className="bg-ceu-sun p-7">
                <Icon className="h-7 w-7" />
                <h3 className="mt-5 text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ceu-navy/65">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}