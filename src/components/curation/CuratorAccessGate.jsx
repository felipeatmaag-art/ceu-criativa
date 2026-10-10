import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ShieldCheck, ShieldAlert, LogIn, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CuratorAccessGate({ children }) {
  const { user, loginAs, openLoginModal } = useAuth();

  if (!user) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6 shadow-xl shadow-emerald-500/10">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-black text-white">Painel de Curadoria & Aprovação</h1>
        <p className="mt-3 text-gray-400 text-sm leading-relaxed max-w-md">
          Esta área é reservada para a administração da Céu Criativa aprovar, revisar ou devolver estampas dos criadores.
        </p>

        <div className="mt-8 w-full max-w-sm space-y-3">
          <Button
            onClick={() => loginAs('admin')}
            className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 text-sm flex items-center justify-center gap-2"
          >
            <KeyRound className="w-4 h-4" /> Entrar como Administrador (1 Clique)
          </Button>

          <Button
            variant="outline"
            onClick={() => openLoginModal('/curadoria')}
            className="w-full h-12 border-white/10 hover:bg-white/5 text-gray-300 rounded-2xl text-sm flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" /> Digitar Login e Senha
          </Button>
        </div>

        <p className="mt-6 text-xs text-gray-500">
          Credencial: <strong className="text-gray-400">admin@seuceu.art.br</strong> | Senha: <span className="font-mono text-emerald-400">admin2026</span>
        </p>
      </div>
    );
  }

  if (!['admin', 'curator', 'master'].includes(user.role)) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-6">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-bold text-white">Acesso de Administrador Necessário</h1>
        <p className="mt-2 text-sm text-gray-400">
          Você está conectado como <strong className="text-white">{user.full_name}</strong> ({user.role}). Para aprovar estampas, acesse como Administrador.
        </p>
        <div className="mt-6">
          <Button
            onClick={() => loginAs('admin')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl px-6 h-11"
          >
            Alternar para Administrador
          </Button>
        </div>
      </div>
    );
  }

  return children;
}