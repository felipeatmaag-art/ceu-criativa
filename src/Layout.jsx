import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import {
  Sparkles,
  Palette,
  Trophy,
  Home,
  Cloud } from
'lucide-react';


import BrandLogo from '@/components/BrandLogo';
import Header from '@/components/navigation/Header';
import SaleRealtimeAlert from '@/components/notifications/SaleRealtimeAlert';
import { useAuth } from '@/lib/AuthContext';

export default function Layout({ children, currentPageName }) {
  const { user, openLoginModal, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
  { name: 'Explorar', page: 'Explore', icon: Home },
  { name: 'Criar', page: 'Create', icon: Sparkles },
  { name: 'Concursos', page: 'Competitions', icon: Trophy },
  { name: 'A Céu', page: 'Brindes', icon: Cloud },
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

      <SaleRealtimeAlert userId={user?.id} />

      {/* Animated Background */}
      <div className="animated-gradient-bg">
        <div className="gradient-mesh" />
      </div>

      {/* Navigation Header Oficial Céu Criativa */}
      <Header currentPageName={currentPageName} />

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
                <li><Link to="/support" className="hover:text-white transition-colors">Central de Ajuda</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Termos de Uso</Link></li>
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