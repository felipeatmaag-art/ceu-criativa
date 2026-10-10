import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Palette, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  LogIn, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, loginAs, redirectPathAfterLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const user = await login(email, password);
      setSuccess(`Bem-vindo, ${user.full_name}!`);
      setTimeout(() => {
        closeLoginModal();
        if (redirectPathAfterLogin) {
          navigate(redirectPathAfterLogin);
        } else if (user.role === 'admin') {
          navigate('/curadoria');
        } else {
          navigate('/MyDesigns');
        }
      }, 700);
    } catch (err) {
      setError(err.message || 'Falha ao autenticar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (type) => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const user = loginAs(type);
      setSuccess(`Entrando como ${user.full_name}...`);
      setTimeout(() => {
        closeLoginModal();
        if (redirectPathAfterLogin) {
          navigate(redirectPathAfterLogin);
        } else if (user.role === 'admin') {
          navigate('/curadoria');
        } else {
          navigate('/MyDesigns');
        }
      }, 600);
    } catch (err) {
      setError(err.message || 'Erro ao efetuar login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isLoginModalOpen} onOpenChange={(open) => !open && closeLoginModal()}>
      <DialogContent className="sm:max-w-md bg-[#0d0e15] text-white border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl">
        <DialogHeader className="text-left space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <BrandLogo size="md" />
            <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Acesso Seguro
            </span>
          </div>
          <DialogTitle className="text-2xl font-black text-white pt-1">
            Acessar Plataforma
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-sm">
            Entre para gerenciar estampas ou realizar curadoria e administração da loja.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* 1-Click Quick Access for Felipe and Admin */}
        <div className="space-y-2.5 mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Acesso Rápido em 1 Clique
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('artist')}
              disabled={isLoading}
              className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 hover:border-purple-400 text-left transition-all hover:scale-[1.02] group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Palette className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                  Felipe Silvério
                </div>
                <div className="text-[11px] text-gray-400">
                  Artista & Criador
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              disabled={isLoading}
              className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all hover:scale-[1.02] group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Administrador
                </div>
                <div className="text-[11px] text-gray-400">
                  Aprovação & Gestão
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-[#0d0e15] px-2 text-gray-500 font-medium">
              Ou digite suas credenciais
            </span>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-xs text-gray-300">E-mail ou Usuário</Label>
            <Input
              type="text"
              placeholder="ex: felipe@seuceu.art.br ou admin@seuceu.art.br"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-gray-300">Senha</Label>
              <span className="text-[11px] text-gray-500">
                Padrão: felipe2026 / admin2026
              </span>
            </div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pr-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500 text-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 text-sm"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Validando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Entrar na Conta
              </span>
            )}
          </Button>
        </form>

        {/* Credentials reminder */}
        <div className="mt-4 p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] text-gray-400 space-y-1">
          <p className="font-semibold text-gray-300">🔑 Credenciais de Acesso:</p>
          <div className="flex justify-between items-center text-gray-400">
            <span>• Artista Felipe: <strong className="text-white">felipe@seuceu.art.br</strong></span>
            <span className="font-mono text-emerald-400">felipe2026</span>
          </div>
          <div className="flex justify-between items-center text-gray-400">
            <span>• Administrador: <strong className="text-white">admin@seuceu.art.br</strong></span>
            <span className="font-mono text-emerald-400">admin2026</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
