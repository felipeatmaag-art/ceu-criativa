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
  AlertCircle,
  UserPlus,
  ShoppingBag
} from 'lucide-react';
import BrandLogo from '@/components/BrandLogo';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, login, loginAs, register, redirectPathAfterLogin } = useAuth();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('artist'); // 'artist' | 'customer'
  const [storeName, setStoreName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const resetForm = () => {
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setFullName('');
    setStoreName('');
  };

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
          navigate('/ProductAdmin');
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const newUser = await register({
        fullName,
        email,
        password,
        role,
        storeName: role === 'artist' ? storeName : ''
      });
      setSuccess(`Conta criada com sucesso! Bem-vindo, ${newUser.full_name}!`);
      setTimeout(() => {
        closeLoginModal();
        if (redirectPathAfterLogin) {
          navigate(redirectPathAfterLogin);
        } else if (role === 'artist') {
          navigate('/ArtistRegistration');
        } else {
          navigate('/Explore');
        }
      }, 700);
    } catch (err) {
      setError(err.message || 'Falha ao realizar cadastro.');
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
          navigate('/ProductAdmin');
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
        <DialogHeader className="text-left space-y-2 mb-2">
          <div className="flex items-center justify-between">
            <BrandLogo size="md" />
            <span className="text-[11px] uppercase tracking-widest text-emerald-400 font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              Acesso Céu Criativa
            </span>
          </div>
          <DialogTitle className="text-2xl font-black text-white pt-1">
            {authMode === 'login' ? 'Acessar Minha Conta' : 'Criar Nova Conta'}
          </DialogTitle>
          <DialogDescription className="text-gray-400 text-xs">
            {authMode === 'login'
              ? 'Entre com suas credenciais para gerenciar suas estampas, loja ou compras.'
              : 'Cadastre-se com seu nome e e-mail para abrir sua vitrine ou comprar peças exclusivas.'}
          </DialogDescription>
        </DialogHeader>

        {/* SELETOR DE MODO: ENTRAR VS CADASTRAR */}
        <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 mb-3">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              authMode === 'login'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setError(''); }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              authMode === 'register'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Criar Conta (Novo Usuário)
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* ---------------- MODO: CRIAR CONTA (CADASTRO NOVO) ---------------- */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <Label className="text-xs text-gray-300">Seu Nome Completo</Label>
              <Input
                type="text"
                placeholder="ex: Carlos Mendes"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-300">Seu E-mail Pessoal</Label>
              <Input
                type="email"
                placeholder="seuemail@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-xs"
                required
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-300">Tipo de Perfil</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('artist')}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    role === 'artist'
                      ? 'bg-purple-600/30 border-purple-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <Palette className="w-3.5 h-3.5 text-purple-400" />
                  Sou Artista (Vender)
                </button>
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    role === 'customer'
                      ? 'bg-emerald-600/30 border-emerald-400 text-white'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  Sou Cliente (Comprar)
                </button>
              </div>
            </div>

            {role === 'artist' && (
              <div className="space-y-1">
                <Label className="text-xs text-gray-300">Nome da sua Loja / Marca (Opcional)</Label>
                <Input
                  type="text"
                  placeholder="ex: Estúdio Criativo Carlos"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="h-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-xs"
                />
              </div>
            )}

            <div className="space-y-1">
              <Label className="text-xs text-gray-300">Crie uma Senha</Label>
              <Input
                type="password"
                placeholder="Mínimo 4 dígitos"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-xs"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/25 text-xs mt-2"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Criar Minha Conta e Entrar
            </Button>
          </form>
        )}

        {/* ---------------- MODO: LOGIN EXISTENTE ---------------- */}
        {authMode === 'login' && (
          <div className="space-y-4">
            {/* Credentials Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <Label className="text-xs text-gray-300">E-mail ou Usuário</Label>
                <Input
                  type="text"
                  placeholder="ex: felipe@seuceu.art.br ou seu e-mail cadastrado"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-gray-300">Senha</Label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 pr-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-xs"
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
                className="w-full h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/25 text-xs"
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

            {/* Acesso em 1 Clique para Administrador e Artista Master */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <KeyRound className="w-3 h-3 text-emerald-400" /> Acesso Rápido Master
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('artist')}
                  disabled={isLoading}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-purple-900/20 border border-purple-500/30 hover:border-purple-400 text-left transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-300 shrink-0">
                    <Palette className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-white truncate">Felipe Silvério</div>
                    <div className="text-[10px] text-gray-400 truncate">Artista</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isLoading}
                  className="flex items-center gap-2.5 p-2 rounded-xl bg-emerald-900/20 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-600/30 flex items-center justify-center text-emerald-300 shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-white truncate">Administrador</div>
                    <div className="text-[10px] text-gray-400 truncate">Painel Master</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Lembrete de credenciais do Administrador */}
            <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/5 text-[11px] text-gray-400 space-y-1">
              <p className="font-semibold text-gray-300">🔑 Credenciais do Painel Master:</p>
              <div className="flex justify-between items-center text-gray-400">
                <span>E-mail: <strong className="text-white">admin@seuceu.art.br</strong></span>
                <span className="font-mono text-emerald-400">admin2026</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
