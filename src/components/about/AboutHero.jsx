import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function AboutHero() {
  return (
    <section className="relative overflow-hidden rounded-b-[3rem] text-ceu-navy bg-[#bfd5de]">
      <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-ceu-sun/80 blur-3xl" />
      <div className="mx-auto grid min-h-[38rem] max-w-7xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8">
        <div className="relative z-10">
          <BrandLogo size="lg" className="mb-10 h-20" />
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-ceu-navy px-4 py-2 text-sm font-semibold text-ceu-cloud">
            <Sparkles className="h-4 w-4" /> Você também vai
          </div>
          <h1 className="max-w-3xl text-5xl font-bold leading-[.95] tracking-tight sm:text-7xl">
            Sua ideia vira peça, renda e movimento.
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-relaxed text-ceu-navy/70 sm:text-xl">
            A Céu é uma plataforma criativa que aproxima tecnologia, produção e comunidade para transformar arte autoral em produtos reais.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to="/Create" className="inline-flex items-center justify-center gap-2 rounded-full bg-ceu-navy px-7 py-4 font-semibold text-ceu-cloud transition-transform active:scale-95">
              Criar minha peça <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/Explore" className="inline-flex items-center justify-center rounded-full border border-ceu-navy/20 px-7 py-4 font-semibold text-ceu-navy transition-transform active:scale-95">
              Explorar criações
            </Link>
          </div>
        </div>
        <div className="relative min-h-[30rem] overflow-hidden rounded-[2.5rem] bg-ceu-sky">
          <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1400&q=85" alt="Moda autoral em uma arara de estúdio" className="absolute inset-0 h-full w-full object-cover mix-blend-multiply" />
          <div className="absolute inset-x-5 bottom-5 rounded-[2rem] bg-ceu-navy/85 p-6 text-ceu-cloud backdrop-blur-md">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-ceu-sky">Criar × Materializar</p>
            <p className="mt-2 text-2xl font-semibold">Você com sua peça autoral em poucos cliques.</p>
          </div>
        </div>
      </div>
    </section>);

}