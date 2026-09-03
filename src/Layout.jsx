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
  Home,
  Gift } from
'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger } from
"@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from '@/components/BrandLogo';

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
  { name: 'Concursos', page: 'Competitions', icon: Trophy },
  { name: 'Brindes', page: 'Brindes', icon: Gift },
  { name: 'Artistas', page: 'Artists', icon: Palette }];


  return (
    <div className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <style>{`
        :root {
          --ceu-dark-bg: #0a0a0f;
          --ceu-dark-card: rgba(20, 20, 30, 0.7);
          --ceu-emerald: #10b981;
          --ceu-emerald-dark: #059669;
          --ceu-emerald-light: #34d399;
          --ceu-gradient: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
        }

        body {
          background: #0a0a0f;
        }

        .glass-effect {
          background: rgba(20, 20, 30, 0.7);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .glass-card {
          background: linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.1) 100%);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border: 1px solid rgba(16, 185, 129, 0.2);
          box-shadow: 0 8px 32px 0 rgba(16, 185, 129, 0.15);
        }

        .ceu-gradient {
          background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
        }

        .ceu-text-gradient {
          background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .animated-gradient-bg {
          position: fixed;
          inset: 0;
          z-index: -1;
          background: #0a0a0f;
          overflow: hidden;
        }

        .gradient-mesh {
          position: absolute;
          inset: -50%;
          background: 
            radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 40% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%);
          animation: meshMove 20s ease-in-out infinite;
        }

        @keyframes meshMove {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(5%, 5%) rotate(120deg); }
          66% { transform: translate(-5%, 5%) rotate(240deg); }
        }

        .hover-glow {
          position: relative;
          transition: all 0.3s ease;
        }

        .hover-glow:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.4), 0 0 40px rgba(16, 185, 129, 0.2);
        }

        .hover-glow::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: inherit;
          background: linear-gradient(135deg, #10b981, #3b82f6);
          opacity: 0;
          z-index: -1;
          transition: opacity 0.3s ease;
        }

        .hover-glow:hover::before {
          opacity: 0.3;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .bento-grid {
          display: grid;
          gap: 1rem;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        }

        @media (min-width: 1024px) {
          .bento-grid {
            grid-template-columns: repeat(12, 1fr);
          }
          .bento-span-6 { grid-column: span 6; }
          .bento-span-4 { grid-column: span 4; }
          .bento-span-8 { grid-column: span 8; }
          .bento-span-12 { grid-column: span 12; }
          .bento-row-2 { grid-row: span 2; }
        }

        input, textarea, select {
          transition: all 0.3s ease;
        }

        input:focus, textarea:focus, select:focus {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }

        button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        button::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }

        button:hover::before {
          width: 300px;
          height: 300px;
        }
      `}</style>

      {/* Animated Background */}
      <div className="animated-gradient-bg">
        <div className="gradient-mesh" />
      </div>

      {/* Navigation */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'glass-effect shadow-lg shadow-emerald-500/10' : 'bg-transparent'}`
        }>
        
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center group relative">
              <div className="relative">
                <BrandLogo size="md" />
                <div className="absolute -top-1 -right-2 w-3 h-3 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
              </div>
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
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 text-[hsl(var(--ceu-sky))] ${
                    isActive ?
                    'ceu-gradient text-white shadow-lg shadow-purple-500/25' :
                    "hover:text-gray-900 hover:bg-gray-100"}`
                    }>
                    
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>);

              })}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl hover:bg-white/10 hover-glow transition-all">
                
                <Search className="w-5 h-5 text-gray-300 hover:text-emerald-400 transition-colors" />
              </Button>

              <Link to={createPageUrl('Cart')}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl hover:bg-white/10 hover-glow relative transition-all">
                  
                  <ShoppingBag className="w-5 h-5 text-gray-300 hover:text-emerald-400 transition-colors" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-emerald-500 to-blue-500 text-white text-xs rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/50">
                    0
                  </span>
                </Button>
              </Link>

              {user ?
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="rounded-xl p-1 hover:bg-gray-100">
                      <div className="w-9 h-9 rounded-xl ceu-gradient flex items-center justify-center">
                        {user.avatar_url ?
                      <img
                        src={user.avatar_url}
                        alt={user.full_name}
                        className="w-full h-full rounded-xl object-cover" /> :


                      <span className="text-white font-medium">
                            {user.full_name?.charAt(0) || 'U'}
                          </span>
                      }
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
                    {user.role === 'admin' && <DropdownMenuItem asChild>
                      <Link to="/ProductAdmin" className="cursor-pointer rounded-lg">
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Produtos do Estúdio
                      </Link>
                    </DropdownMenuItem>}
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
                    className="cursor-pointer rounded-lg text-red-600 focus:text-red-600">
                    
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> :

              <Button
                onClick={() => base44.auth.redirectToLogin()}
                className="ceu-gradient text-white rounded-xl px-6 hover:opacity-90 transition-opacity">
                
                  Entrar
                </Button>
              }

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-xl"
                onClick={() => setIsMenuOpen(!isMenuOpen)}>
                
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen &&
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-effect border-t">
            
              <div className="px-4 py-6 space-y-2">
                {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.page}
                    to={createPageUrl(item.page)}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors">
                    
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>);

              })}
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <main className="pt-20">
        {children}
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-white/10 text-gray-300 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-4">
                <BrandLogo size="lg" />
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
                <li><Link to={createPageUrl('Competitions')} className="hover:text-white transition-colors">Concursos</Link></li>
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
    </div>);

}