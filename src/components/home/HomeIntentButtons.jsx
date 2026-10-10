import React from 'react';
import { Link } from 'react-router-dom';
import { Palette, ShoppingBag, Building2, ArrowRight } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function HomeIntentButtons() {
  return (
    <section className="relative z-30 bg-ceu-navy py-6 sm:py-8 border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-5">
          {/* 1. Sou artista */}
          <Link
            to={createPageUrl('ArtistRegistration')}
            className="group relative flex items-center justify-between px-6 py-5 sm:py-6 rounded-2xl bg-ceu-sun text-ceu-navy font-black text-xl sm:text-2xl tracking-tight shadow-lg shadow-ceu-sun/20 hover:shadow-ceu-sun/35 hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 overflow-hidden"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-ceu-navy/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Palette className="w-6 h-6 text-ceu-navy" />
              </div>
              <span>Sou artista</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-ceu-navy/10 flex items-center justify-center group-hover:translate-x-1 group-hover:bg-ceu-navy group-hover:text-ceu-sun transition-all shrink-0">
              <ArrowRight className="w-5 h-5 font-bold" />
            </div>
          </Link>

          {/* 2. Quero comprar */}
          <Link
            to={createPageUrl('Explore')}
            className="group relative flex items-center justify-between px-6 py-5 sm:py-6 rounded-2xl bg-ceu-aqua text-ceu-navy font-black text-xl sm:text-2xl tracking-tight shadow-lg shadow-ceu-aqua/20 hover:shadow-ceu-aqua/35 hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 overflow-hidden"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-ceu-navy/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-6 h-6 text-ceu-navy" />
              </div>
              <span>Quero comprar</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-ceu-navy/10 flex items-center justify-center group-hover:translate-x-1 group-hover:bg-ceu-navy group-hover:text-ceu-aqua transition-all shrink-0">
              <ArrowRight className="w-5 h-5 font-bold" />
            </div>
          </Link>

          {/* 3. Sou empresa (Abre a página dedicada B2B para PJ) */}
          <Link
            to="/Empresas"
            className="group relative flex items-center justify-between px-6 py-5 sm:py-6 rounded-2xl bg-ceu-sky text-ceu-navy font-black text-xl sm:text-2xl tracking-tight shadow-lg shadow-ceu-sky/20 hover:shadow-ceu-sky/35 hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 overflow-hidden"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-ceu-navy/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-ceu-navy" />
              </div>
              <span>Sou empresa</span>
            </div>
            <div className="w-10 h-10 rounded-full bg-ceu-navy/10 flex items-center justify-center group-hover:translate-x-1 group-hover:bg-ceu-navy group-hover:text-ceu-sky transition-all shrink-0">
              <ArrowRight className="w-5 h-5 font-bold" />
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
