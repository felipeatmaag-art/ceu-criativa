import React from 'react';
import { Scale } from 'lucide-react';
import TermsContent from '@/components/legal/TermsContent';

export default function Terms() {
  return <div className="min-h-screen bg-ceu-cloud px-4 py-12 text-foreground"><div className="mx-auto max-w-5xl"><header className="mb-10 max-w-3xl"><div className="mb-3 flex items-center gap-2 text-ceu-aqua"><Scale className="h-5 w-5"/><span className="text-sm font-semibold">Transparência primeiro</span></div><h1 className="text-4xl font-bold text-ceu-navy sm:text-5xl">Termos de Uso</h1><p className="mt-4 text-lg leading-8 text-muted-foreground">Regras de venda, direitos autorais e convivência para manter nosso céu criativo, justo e seguro.</p><p className="mt-2 text-sm text-muted-foreground">Última atualização: 10 de setembro de 2026</p></header><TermsContent/></div></div>;
}