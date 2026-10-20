import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
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
  ArrowLeft 
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import BrandLogo from '@/components/BrandLogo';

export default function Login() {
  const { login, loginAs } = useAuth();
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
      const loggedUser = await login(email, password);
      setSuccess(`Bem-vindo, ${loggedUser.full_name}!`);
      setTimeout(() => {
        if (loggedUser.role === 'admin') {
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

  const handleQuickLogin = (type) => {
    setError('');
    setSuccess('');
    setIsLoading(true);
    try {
      const loggedUser = loginAs(type);
      setSuccess(`Entrando como ${loggedUser.full_name}...`);
      setTimeout(() => {
        if (loggedUser.role === 'admin') {
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
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <Link 
          to={createPageUrl('Home')} 
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para a Loja
        </Link>

        <div className="bg-[#0d0e15] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-xl">
          <div className="text-center space-y-3 mb-6">
            <div className="flex justify-center mb-3">
              <BrandLogo size="lg" />
            </div>
            <h1 className="text-3xl font-black text-white">
              Entrar na Conta
            </h1>
            <p className="text-gray-400 text-sm">
              Gerencie suas estampas ou faça curadoria e aprovações.
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2.5 p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Quick Access */}
          <div className="space-y-2.5 mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" /> Acesso Rápido em 1 Clique
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                disabled={isLoading}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all hover:scale-[1.02] group"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Admin MASTER
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    admin@seuceu.com.br
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('customer')}
                disabled={isLoading}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/30 hover:border-blue-400 text-left transition-all hover:scale-[1.02] group"
              >
                <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-300 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
                    Usuário Teste
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    usuario@seuceu.com.br
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('artist')}
                disabled={isLoading}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl bg-gradient-to-br from-purple-900/30 to-purple-800/10 border border-purple-500/30 hover:border-purple-400 text-left transition-all hover:scale-[1.02] group"
              >
                <div className="w-9 h-9 rounded-xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                  <Palette className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                    Felipe Silvério
                  </div>
                  <div className="text-[10px] text-gray-400 truncate">
                    felipe@seuceu.art.br
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#0d0e15] px-2 text-gray-500 font-medium">
                Ou acesse com login e senha
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-300">E-mail ou Usuário</Label>
              <Input
                type="text"
                placeholder="felipe@seuceu.art.br ou admin@seuceu.art.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-300">Senha</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha de acesso"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-10 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-emerald-500"
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
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 text-base flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Entrar no Sistema</span>
                </>
              )}
            </Button>
          </form>

          {/* Credential summary */}
          <div className="mt-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-xs text-gray-400 space-y-2">
            <p className="font-bold text-gray-200">🔑 Credenciais Oficiais Ativas para Teste:</p>
            
            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
              <div className="flex justify-between items-center text-gray-200">
                <span className="font-bold text-emerald-300">• Conta MASTER / Administrador:</span>
                <span className="font-mono text-emerald-400 font-bold">MasterAdmin@2026</span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">admin@seuceu.com.br</p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
              <div className="flex justify-between items-center text-gray-200">
                <span className="font-bold text-blue-300">• Conta de Teste Usuário:</span>
                <span className="font-mono text-blue-400 font-bold">TesteUser@2026</span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">usuario@seuceu.com.br</p>
            </div>

            <div className="p-2.5 rounded-xl bg-white/[0.04] border border-white/5 space-y-1">
              <div className="flex justify-between items-center text-gray-200">
                <span className="font-bold text-purple-300">• Felipe Silvério (Master/Artista):</span>
                <span className="font-mono text-purple-400 font-bold">felipe2026</span>
              </div>
              <p className="text-[11px] text-gray-400 font-mono">felipeatmaag@gmail.com / felipe@seuceu.art.br</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
