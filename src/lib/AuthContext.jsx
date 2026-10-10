import React, { createContext, useState, useContext, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { appParams } from '@/lib/app-params';
import { authService } from '@/services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => authService.getCurrentUser());
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!authService.getCurrentUser());
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [redirectPathAfterLogin, setRedirectPathAfterLogin] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({
    id: appParams.appId || 'seuceu',
    public_settings: { auth_required: false }
  });

  useEffect(() => {
    // Escuta mudanças de auth locais
    const unsubscribe = authService.subscribe((newUser) => {
      setUser(newUser);
      setIsAuthenticated(!!newUser);
    });

    // Escuta evento global para abrir modal de login
    const handleOpenLogin = (e) => {
      if (e?.detail?.nextPath) {
        setRedirectPathAfterLogin(e.detail.nextPath);
      }
      setIsLoginModalOpen(true);
    };

    window.addEventListener('open-ceu-login', handleOpenLogin);

    // Validação inicial do usuário
    const current = authService.getCurrentUser();
    if (current) {
      setUser(current);
      setIsAuthenticated(true);
    }

    return () => {
      unsubscribe();
      window.removeEventListener('open-ceu-login', handleOpenLogin);
    };
  }, []);

  const login = async (email, password) => {
    const loggedUser = authService.login(email, password);
    setUser(loggedUser);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    return loggedUser;
  };

  const loginAs = (type) => {
    const loggedUser = authService.loginAs(type);
    setUser(loggedUser);
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
    return loggedUser;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const openLoginModal = (nextPath = null) => {
    if (nextPath) setRedirectPathAfterLogin(nextPath);
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setRedirectPathAfterLogin(null);
  };

  const navigateToLogin = (nextPath) => {
    openLoginModal(nextPath);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoadingAuth,
      isLoadingPublicSettings,
      authChecked: true,
      authError,
      appPublicSettings,
      isLoginModalOpen,
      redirectPathAfterLogin,
      openLoginModal,
      closeLoginModal,
      login,
      loginAs,
      logout,
      navigateToLogin,
      checkAppState: async () => {},
      checkUserAuth: async () => {}
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};