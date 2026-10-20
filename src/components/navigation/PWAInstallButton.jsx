import React, { useState } from 'react';
import { Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { Button } from '@/components/ui/button';

export default function PWAInstallButton({ variant = 'header' }) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Se já estiver instalado no dispositivo do usuário, não exibe
  if (isInstalled) {
    return null;
  }

  // Fluxo Android / Chrome / Edge
  if (isInstallable) {
    if (variant === 'menu') {
      return (
        <button
          type="button"
          onClick={install}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 hover:bg-white/10 transition-colors"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Instalar Aplicativo no Celular</span>
        </button>
      );
    }

    return (
      <Button
        type="button"
        size="sm"
        onClick={install}
        className="rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold h-9 px-3 gap-1.5 shadow-sm"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Baixar App</span>
      </Button>
    );
  }

  // Fluxo iOS Safari (Guia de Adicionar à Tela de Início)
  if (isIOS) {
    return (
      <>
        {variant === 'menu' ? (
          <button
            type="button"
            onClick={() => setShowIOSModal(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 hover:bg-white/10 transition-colors"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Instalar App no iPhone</span>
          </button>
        ) : (
          <Button
            type="button"
            size="sm"
            onClick={() => setShowIOSModal(true)}
            className="rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-bold h-9 px-3 gap-1.5 shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">App iPhone</span>
          </Button>
        )}

        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 text-slate-900">
            <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Instalar no iPhone / iPad
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowIOSModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="text-xs text-slate-600 space-y-2.5">
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
                  <p>Toque no botão de <strong>Compartilhar</strong> (ícone do quadrado com seta para cima) na barra do Safari.</p>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
                  <p>Role para baixo e selecione <strong>"Adicionar à Tela de Início"</strong>.</p>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
                  <p>Toque em <strong>Adicionar</strong>. O app abrirá como aplicativo nativo em tela cheia!</p>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full rounded-2xl bg-slate-900 text-white font-bold text-xs h-11"
              >
                Entendi
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
}
