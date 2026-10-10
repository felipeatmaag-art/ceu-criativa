import React from 'react';
import ArtistRegistrationForm from '@/components/artists/ArtistRegistrationForm';
import { Store, Palette, Coins, ShieldCheck } from 'lucide-react';

export default function ArtistRegistration() {
  return (
    <div className="min-h-screen bg-ceu-cloud py-12 sm:py-16">
      <main className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Header Inspiracional */}
        <header className="mb-10 text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ceu-sun/20 text-ceu-navy border border-ceu-sun/40 text-xs font-black uppercase tracking-wider">
            <Store className="w-4 h-4 text-amber-600" />
            Crie sua Vitrine Oficial
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-ceu-navy tracking-tight leading-tight">
            Crie sua Loja na Céu Criativa
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
            Abra seu espaço autoral, publique suas estampas em camisetas, moletons e canecas de alta definição e receba comissões automáticas — sem estoque, sem frete e sem dor de cabeça.
          </p>

          {/* Vantagens em Destaque */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-ceu-sun/20 text-amber-700 flex items-center justify-center shrink-0">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Comissões no PIX</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Lucro automático em cada peça vendida.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-ceu-aqua/20 text-teal-700 flex items-center justify-center shrink-0">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Produção DTF HD</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Fidelidade fotográfica de estampa e malha 100%.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-ceu-sky/20 text-blue-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Zero Risco</h4>
                <p className="text-[11px] text-slate-500 mt-0.5">Sem mensalidade ou custo prévio de estoque.</p>
              </div>
            </div>
          </div>
        </header>

        {/* Formulário de Criação de Loja */}
        <ArtistRegistrationForm />
      </main>
    </div>
  );
}
