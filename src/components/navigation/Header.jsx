import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Search, 
  ShoppingBag, 
  Sparkles, 
  Palette, 
  Trophy, 
  Building2, 
  Cloud, 
  User, 
  LogOut, 
  BarChart3, 
  ShieldCheck, 
  WalletCards,
  ChevronDown,
  UploadCloud,
  Boxes,
  Shirt,
  Sliders,
  DollarSign,
  Users,
  Store
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from '@/components/ui/badge';
import BrandLogo from '@/components/BrandLogo';
import PWAInstallButton from '@/components/navigation/PWAInstallButton';
import useCartStore from '@/services/cartStore';
import { useAuth } from '@/lib/AuthContext';

/**
 * Header - Componente de Cabeçalho Responsivo Oficial da Céu Criativa
 * 
 * Segue rigorosamente o Design System com tokens de contraste WCAG,
 * marca oficial 'Céu Criativa' e navegação adaptativa para Desktop e Mobile.
 */
export default function Header({ currentPageName }) {
  const { user, openLoginModal, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartItems] = useCartStore();
  const location = useLocation();

  const currentPath = location.pathname;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fecha o menu mobile ao navegar
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Explorar', path: '/Explore', page: 'Explore', icon: Search },
    { name: 'Criar Estampa', path: '/Create', page: 'Create', icon: Sparkles, highlight: true },
    { name: 'Artistas', path: '/Artists', page: 'Artists', icon: Palette },
    { name: 'Concursos', path: '/Competitions', page: 'Competitions', icon: Trophy },
    { name: 'Empresas', path: '/Empresas', page: 'Empresas', icon: Building2 },
    { name: 'A Céu', path: '/Brindes', page: 'Brindes', icon: Cloud },
  ];

  const totalCartCount = (cartItems || []).reduce((sum, item) => sum + (item.quantity || 1), 0);

  const isLinkActive = (item) => {
    if (currentPageName && currentPageName === item.page) return true;
    if (currentPath === item.path) return true;
    if (item.path !== '/' && currentPath.startsWith(item.path)) return true;
    return false;
  };

  return (
    <header 
      role="banner"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-slate-950/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20' 
          : 'bg-slate-950/75 backdrop-blur-md border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. LOGOTIPO */}
          <div className="flex items-center gap-6">
            <Link 
              to="/" 
              className="flex items-center group focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-xl"
              aria-label="Página Inicial"
            >
              <BrandLogo size="md" className="transition-transform group-hover:scale-105" />
            </Link>
          </div>

          {/* 2. NAVEGAÇÃO DESKTOP (ALTO CONTRASTE E ESTADOS ATIVOS) */}
          <nav className="hidden lg:flex items-center gap-1.5" aria-label="Navegação Principal">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item);

              if (item.highlight) {
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`ml-1 mr-1 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-md ${
                      active
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-500/30 ring-2 ring-purple-400'
                        : 'bg-gradient-to-r from-purple-600/90 to-indigo-600/90 hover:from-purple-600 hover:to-indigo-600 text-white shadow-purple-600/20 hover:scale-105 active:scale-95'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 text-amber-300" />
                    <span>{item.name}</span>
                    <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-mono">IA</span>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
                    active
                      ? 'bg-white/15 text-white font-bold border border-white/20 shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* 3. AÇÕES DA DIREITA: CARRINHO, PERFIL / LOGIN E BOTÃO MOBILE */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* BOTÃO DE INSTALAR APP (PWA MOBILE) */}
            <PWAInstallButton />

            {/* BOTÃO DO CARRINHO COM BADGE DE QUANTIDADE */}
            <Link to="/Cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-2xl w-11 h-11 text-slate-200 hover:text-white hover:bg-white/10 transition-all border border-white/10"
                aria-label={`Carrinho com ${totalCartCount} itens`}
              >
                <ShoppingBag className="w-5 h-5" />
                {totalCartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-[11px] rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 animate-in zoom-in-75">
                    {totalCartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* ÁREA DO USUÁRIO OU BOTÃO DE LOGIN */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="p-1 pl-2 pr-2.5 rounded-2xl hover:bg-white/10 border border-white/10 flex items-center gap-2 text-left"
                    aria-label="Abrir menu do usuário"
                  >
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 overflow-hidden">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.artist_name || user.full_name || 'Usuário'} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{(user.artist_name || user.full_name || user.name || 'C')[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div className="hidden md:flex flex-col">
                      <span className="text-xs font-bold text-white max-w-[110px] truncate leading-tight">
                        {user.artist_name || user.full_name || user.name || 'Criador'}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
                        {user.role === 'admin' ? 'Admin' : 'Artista'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent 
                  align="end" 
                  className="w-64 bg-[#0d0e15] border border-white/15 text-white rounded-2xl p-2 shadow-2xl backdrop-blur-2xl"
                >
                  <div className="px-3 py-2.5 mb-1.5 rounded-xl bg-white/[0.06] border border-white/10">
                    <p className="font-bold text-sm text-white truncate">
                      {user.artist_name || user.full_name || user.name}
                    </p>
                    <p className="text-[11px] text-slate-400 font-mono truncate mt-0.5">
                      {user.email}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5">
                      <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px] font-bold">
                        {user.role === 'admin' ? '🛡️ Admin Master' : '👑 Artista Oficial'}
                      </Badge>
                    </div>
                  </div>

                  <DropdownMenuSeparator className="bg-white/10" />

                  {user.role === 'admin' ? (
                    <>
                      {/* MENU EXCLUSIVO DO ADMINISTRADOR MASTER */}
                      <DropdownMenuItem asChild>
                        <Link to="/ProductAdmin?tab=designs&status=pendente" className="cursor-pointer rounded-xl py-2.5 text-xs font-bold text-amber-300 hover:text-white flex items-center bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 mb-1">
                          <ShieldCheck className="w-4 h-4 mr-2.5 text-amber-400" />
                          ✅ Aprovar Estampas Pendentes
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/ProductAdmin" className="cursor-pointer rounded-xl hover:bg-white/10 py-2 text-xs font-semibold text-slate-200 hover:text-white flex items-center">
                          <Sliders className="w-4 h-4 mr-2.5 text-purple-400" />
                          🛡️ Painel de Controle Master
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/ProductAdmin?tab=inventory" className="cursor-pointer rounded-xl hover:bg-white/10 py-2 text-xs font-semibold text-slate-200 hover:text-white flex items-center">
                          <Boxes className="w-4 h-4 mr-2.5 text-emerald-400" />
                          Estoque Físico &amp; Grade
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/ProductAdmin?tab=catalog" className="cursor-pointer rounded-xl hover:bg-white/10 py-2 text-xs font-semibold text-slate-200 hover:text-white flex items-center">
                          <Shirt className="w-4 h-4 mr-2.5 text-blue-400" />
                          Modelos Base de Roupas
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/ProductAdmin?tab=users" className="cursor-pointer rounded-xl hover:bg-white/10 py-2 text-xs font-semibold text-slate-200 hover:text-white flex items-center">
                          <Users className="w-4 h-4 mr-2.5 text-pink-400" />
                          Gerenciar Usuários &amp; Lojas
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/ProductAdmin?tab=orders" className="cursor-pointer rounded-xl hover:bg-white/10 py-2 text-xs font-semibold text-slate-200 hover:text-white flex items-center">
                          <ShoppingBag className="w-4 h-4 mr-2.5 text-sky-400" />
                          Todos os Pedidos da Plataforma
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/ProductAdmin?tab=pix" className="cursor-pointer rounded-xl hover:bg-white/10 py-2 text-xs font-semibold text-slate-200 hover:text-white flex items-center">
                          <DollarSign className="w-4 h-4 mr-2.5 text-emerald-400" />
                          Configuração Global PIX
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/sales-reports" className="cursor-pointer rounded-xl hover:bg-white/10 py-2 text-xs font-semibold text-slate-200 hover:text-white flex items-center">
                          <BarChart3 className="w-4 h-4 mr-2.5 text-teal-400" />
                          Relatórios de Faturamento
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      {/* MENU DE ARTISTA / CLIENTE REGULAR */}
                      <DropdownMenuItem asChild>
                        <Link to="/Create" className="cursor-pointer rounded-xl hover:bg-white/10 py-2 text-xs font-semibold text-slate-200 hover:text-white flex items-center">
                          <Sparkles className="w-4 h-4 mr-2.5 text-purple-400" />
                          Criar Nova Estampa
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/MyDesigns" className="cursor-pointer rounded-xl hover:bg-white/10 py-2 text-xs font-semibold text-slate-200 hover:text-white flex items-center">
                          <Palette className="w-4 h-4 mr-2.5 text-teal-400" />
                          Minhas Estampas
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/Profile?tab=upload" className="cursor-pointer rounded-xl hover:bg-white/10 py-2 text-xs font-semibold text-slate-200 hover:text-white flex items-center">
                          <UploadCloud className="w-4 h-4 mr-2.5 text-blue-400" />
                          Subir Estampas (Lote)
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/Profile?tab=financial" className="cursor-pointer rounded-xl hover:bg-white/10 py-2 text-xs font-semibold text-slate-200 hover:text-white flex items-center">
                          <WalletCards className="w-4 h-4 mr-2.5 text-emerald-400" />
                          Financeiro &amp; Repasses Pix
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/MyOrders" className="cursor-pointer rounded-xl hover:bg-white/10 py-2 text-xs font-semibold text-slate-200 hover:text-white flex items-center">
                          <ShoppingBag className="w-4 h-4 mr-2.5 text-sky-400" />
                          Meus Pedidos
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <Link to="/Profile" className="cursor-pointer rounded-xl hover:bg-white/10 py-2 text-xs font-semibold text-slate-200 hover:text-white flex items-center">
                          <User className="w-4 h-4 mr-2.5 text-amber-400" />
                          Meu Perfil de Artista &amp; Loja
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-white/10" />

                  <DropdownMenuItem 
                    onClick={logout}
                    className="cursor-pointer rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 py-2 text-xs font-semibold flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2.5" />
                    Sair da Conta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  to="/ArtistRegistration"
                  className="hidden sm:inline-flex h-9 px-3 rounded-xl border border-white/20 hover:border-emerald-400/60 text-white hover:text-emerald-300 font-bold text-xs items-center gap-1.5 transition-colors"
                >
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                  <span>Criar Loja</span>
                </Link>
                <Button
                  type="button"
                  onClick={openLoginModal}
                  className="h-9 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Entrar</span>
                </Button>
              </div>
            )}

            {/* BOTÃO DO MENU MOBILE (HAMBÚRGUER) */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden rounded-2xl w-11 h-11 text-slate-200 hover:text-white hover:bg-white/10 border border-white/10"
              aria-label={isMobileMenuOpen ? 'Fechar menu móvel' : 'Abrir menu móvel'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-400" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* 4. MENU MOBILE EXPANSÍVEL (RESPONSIVO COM ALTO CONTRASTE) */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden bg-slate-950/95 backdrop-blur-2xl border-b border-white/15 px-4 pt-3 pb-6 animate-in slide-in-from-top-4 duration-200 shadow-2xl"
        >
          <div className="space-y-1.5 mb-4">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const active = isLinkActive(item);

              if (item.highlight) {
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-between shadow-lg shadow-purple-600/30"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-amber-300" />
                      <span>{item.name}</span>
                    </div>
                    <Badge className="bg-white/20 text-white border-0 text-[10px]">
                      Estúdio IA
                    </Badge>
                  </Link>
                );
              }

              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`w-full p-3 rounded-2xl text-sm font-semibold flex items-center gap-3 transition-colors ${
                    active
                      ? 'bg-white/15 text-white font-bold border border-white/20'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Atalhos Rápidos da Conta no Mobile */}
          {user && (
            <div className="mb-4 pt-3 border-t border-white/10 space-y-1.5">
              <div className="px-2 py-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center justify-between">
                <span>{user.role === 'admin' ? '🛡️ Gestão Master' : '👑 Área do Criador'}</span>
                <span className="text-emerald-400 font-mono text-[10px] truncate max-w-[140px]">{user.email}</span>
              </div>

              {user.role === 'admin' ? (
                <>
                  <Link
                    to="/ProductAdmin?tab=designs&status=pendente"
                    className="w-full p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-2.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Aprovar Estampas Pendentes</span>
                  </Link>
                  <Link
                    to="/ProductAdmin"
                    className="w-full p-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs flex items-center gap-2.5"
                  >
                    <Sliders className="w-4 h-4 text-purple-400" />
                    <span>Painel de Controle Master</span>
                  </Link>
                  <Link
                    to="/ProductAdmin?tab=inventory"
                    className="w-full p-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs flex items-center gap-2.5"
                  >
                    <Boxes className="w-4 h-4 text-emerald-400" />
                    <span>Estoque Físico &amp; Grade</span>
                  </Link>
                  <Link
                    to="/ProductAdmin?tab=users"
                    className="w-full p-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs flex items-center gap-2.5"
                  >
                    <Users className="w-4 h-4 text-pink-400" />
                    <span>Gerenciar Usuários &amp; Lojas</span>
                  </Link>
                  <Link
                    to="/ProductAdmin?tab=pix"
                    className="w-full p-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs flex items-center gap-2.5"
                  >
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <span>Configuração Global PIX</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/MyDesigns"
                    className="w-full p-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs flex items-center gap-2.5"
                  >
                    <Palette className="w-4 h-4 text-teal-400" />
                    <span>Minhas Estampas</span>
                  </Link>
                  <Link
                    to="/Profile?tab=upload"
                    className="w-full p-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs flex items-center gap-2.5"
                  >
                    <UploadCloud className="w-4 h-4 text-blue-400" />
                    <span>Subir Estampas em Lote</span>
                  </Link>
                  <Link
                    to="/Profile"
                    className="w-full p-2.5 rounded-xl bg-white/10 text-white font-semibold text-xs flex items-center gap-2.5"
                  >
                    <User className="w-4 h-4 text-amber-400" />
                    <span>Meu Perfil &amp; Loja</span>
                  </Link>
                </>
              )}

              <button
                type="button"
                onClick={logout}
                className="w-full p-2.5 rounded-xl text-rose-400 hover:bg-rose-500/10 font-semibold text-xs flex items-center gap-2.5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
              </button>
            </div>
          )}

          {/* Destaque Institucional no Mobile */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 px-2">
            <span>Plataforma 100% Oficial Céu Criativa</span>
            <span className="text-emerald-400 font-bold">Repasses via Pix</span>
          </div>
        </div>
      )}
    </header>
  );
}
