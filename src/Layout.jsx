import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { 
  Menu, 
  X, 
  Search, 
  ShoppingBag, 
  User, 
  Sparkles,
  Heart,
  LogOut,
  Settings,
  Palette,
  Trophy,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      }
    };
    loadUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Explorar', page: 'Explore', icon: Home },
    { name: 'Criar', page: 'Create', icon: Sparkles },
    { name: 'Competições', page: 'Competitions', icon: Trophy },
    { name: 'Artistas', page: 'Artists', icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <style>{`
        :root {
          --ceu-primary: #1A1A2E;
          --ceu-secondary: #16213E;
          --ceu-accent: #E94560;
          --ceu-gold: #D4AF37;
          --ceu-light: #FAFAFA;
          --ceu-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .ceu-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        
        .ceu-text-gradient {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glass-effect {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'glass-effect shadow-lg' : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl ceu-gradient flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                <span className="ceu-text-gradient">Céu</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPageName === item.page;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                      isActive 
                        ? 'ceu-gradient text-white shadow-lg shadow-purple-500/25' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon"
                className="rounded-xl hover:bg-gray-100"
              >
                <Search className="w-5 h-5 text-gray-600" />
              </Button>
              
              <Link to={createPageUrl('Cart')}>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="rounded-xl hover:bg-gray-100 relative"
                >
                  <ShoppingBag className="w-5 h-5 text-gray-600" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                    0
                  </span>
                </Button>
              </Link>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-xl p-1 hover:bg-gray-100">
                      <div className="w-9 h-9 rounded-xl ceu-gradient flex items-center justify-center">
                        {user.avatar_url ? (
                          <img 
                            src={user.avatar_url} 
                            alt={user.full_name}
                            className="w-full h-full rounded-xl object-cover"
                          />
                        ) : (
                          <span className="text-white font-medium">
                            {user.full_name?.charAt(0) || 'U'}
                          </span>
                        )}
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
                    <div className="px-3 py-2 mb-2">
                      <p className="font-medium">{user.artist_name || user.full_name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Profile')} className="cursor-pointer rounded-lg">
                        <User className="w-4 h-4 mr-2" />
                        Meu Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('MyDesigns')} className="cursor-pointer rounded-lg">
                        <Palette className="w-4 h-4 mr-2" />
                        Minhas Estampas
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Favorites')} className="cursor-pointer rounded-lg">
                        <Heart className="w-4 h-4 mr-2" />
                        Favoritos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('MyOrders')} className="cursor-pointer rounded-lg">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Meus Pedidos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Settings')} className="cursor-pointer rounded-lg">
                        <Settings className="w-4 h-4 mr-2" />
                        Configurações
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => base44.auth.logout()}
                      className="cursor-pointer rounded-lg text-red-600 focus:text-red-600"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  onClick={() => base44.auth.redirectToLogin()}
                  className="ceu-gradient text-white rounded-xl px-6 hover:opacity-90 transition-opacity"
                >
                  Entrar
                </Button>
              )}

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-xl"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden glass-effect border-t"
            >
              <div className="px-4 py-6 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.page}
                      to={createPageUrl(item.page)}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#1A1A2E] text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-2xl ceu-gradient flex items-center justify-center">
                  <span className="text-white font-bold text-xl">C</span>
                </div>
                <span className="text-2xl font-bold">Céu</span>
              </div>
              <p className="text-gray-400 max-w-sm">
                Democratizando a criatividade e dando voz aos artistas. 
                Crie, venda e inspire o mundo com sua arte.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to={createPageUrl('Explore')} className="hover:text-white transition-colors">Explorar</Link></li>
                <li><Link to={createPageUrl('Create')} className="hover:text-white transition-colors">Criar Estampa</Link></li>
                <li><Link to={createPageUrl('Competitions')} className="hover:text-white transition-colors">Competições</Link></li>
                <li><Link to={createPageUrl('Artists')} className="hover:text-white transition-colors">Artistas</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Céu. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}