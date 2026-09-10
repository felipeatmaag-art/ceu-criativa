import React from 'react';
import { LifeBuoy } from 'lucide-react';
import SupportContent from '@/components/support/SupportContent';

export default function Support() {
  return <div className="min-h-screen bg-ceu-cloud px-4 py-12 text-foreground"><div className="mx-auto max-w-7xl"><header className="mb-10 max-w-3xl"><div className="mb-3 flex items-center gap-2 text-ceu-aqua"><LifeBuoy className="h-5 w-5"/><span className="text-sm font-semibold">Tamo junto</span></div><h1 className="text-4xl font-bold text-ceu-navy sm:text-5xl">Centro de Ajuda</h1><p className="mt-4 text-lg leading-8 text-muted-foreground">Respostas rápidas para criar, publicar, vender e acompanhar a produção da sua arte.</p></header><SupportContent/></div></div>;
}