/**
 * Serviço de Autenticação Céu Criativa
 * Gerencia sessões locais, credenciais ativas do Artista Felipe Silvério e do Administrador.
 */

const STORAGE_KEY = 'ceu_auth_session';

export const REGISTERED_ACCOUNTS = [
  {
    type: 'artist',
    label: 'Felipe Silvério (Artista)',
    emails: ['felipe@seuceu.art.br', 'felipeatmaag@gmail.com'],
    defaultEmail: 'felipe@seuceu.art.br',
    passwords: ['felipe2026', 'ceu123', '123456'],
    user: {
      id: '69431e0c00397efc6e14e9e0',
      full_name: 'Felipe Silvério',
      artist_name: 'Felipe Silvério',
      email: 'felipeatmaag@gmail.com',
      role: 'artist',
      app_role: 'artist',
      store_name: 'Felipe Silvério Studio',
      store_slug: 'felipe-silverio',
      bio: 'Artista visual e diretor criativo do Céu Criativa. Estampas autorais exclusivas com surrealismo contemporâneo e arte gráfica urbana.',
      avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80',
      cover_image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=1200&q=80',
      instagram: 'felipesilverio',
      social_instagram: 'https://instagram.com/felipesilverio',
      is_verified_artist: true,
      access_status: 'active',
      total_sales: 1420,
      total_earnings: 21300,
      followers_count: 980
    }
  },
  {
    type: 'admin',
    label: 'Administrador (Gestão & Aprovação)',
    emails: ['admin@seuceu.art.br', 'admin@atmacomunicacao.com.br'],
    defaultEmail: 'admin@seuceu.art.br',
    passwords: ['admin2026', 'ceuadmin123', '123456'],
    user: {
      id: 'admin-ceu-gestor',
      full_name: 'Administrador Céu',
      artist_name: 'Céu Criativa Admin',
      email: 'admin@seuceu.art.br',
      role: 'admin',
      app_role: 'master',
      store_name: 'Céu Criativa Admin',
      store_slug: 'admin',
      bio: 'Gestão geral, controle de catálogo, curadoria de estampas e aprovações do Céu Criativa.',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      cover_image: 'https://images.unsplash.com/photo-1550859492-d5da9d8e45f3?auto=format&fit=crop&w=1200&q=80',
      instagram: 'ceucriativa',
      social_instagram: 'https://instagram.com/ceucriativa',
      is_verified_artist: true,
      access_status: 'active',
      total_sales: 0,
      total_earnings: 0,
      followers_count: 0
    }
  }
];

class AuthService {
  constructor() {
    this.listeners = new Set();
  }

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === 'object' && parsed.id) {
        return parsed;
      }
      return null;
    } catch (err) {
      console.warn('Erro ao ler sessão de auth:', err);
      return null;
    }
  }

  login(emailOrUsername, password) {
    const cleanLogin = (emailOrUsername || '').trim().toLowerCase();
    const cleanPass = (password || '').trim();

    if (!cleanLogin) {
      throw new Error('Informe o e-mail ou nome de usuário.');
    }
    if (!cleanPass) {
      throw new Error('Informe a sua senha.');
    }

    // Procura nas contas cadastradas
    const account = REGISTERED_ACCOUNTS.find(acc => 
      acc.emails.some(e => e.toLowerCase() === cleanLogin) ||
      acc.defaultEmail.toLowerCase() === cleanLogin ||
      acc.user.email.toLowerCase() === cleanLogin ||
      (cleanLogin.includes('felipe') && acc.type === 'artist') ||
      (cleanLogin.includes('admin') && acc.type === 'admin')
    );

    if (!account) {
      throw new Error('Usuário não encontrado. Use felipe@seuceu.art.br ou admin@seuceu.art.br');
    }

    const isPassValid = account.passwords.includes(cleanPass);
    if (!isPassValid) {
      throw new Error('Senha incorreta. Verifique suas credenciais.');
    }

    // Salva a sessão no localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account.user));
    } catch (e) {
      console.warn('Não foi possível persistir no localStorage', e);
    }

    this.notify(account.user);
    return account.user;
  }

  loginAs(type) {
    const account = REGISTERED_ACCOUNTS.find(acc => acc.type === type);
    if (!account) throw new Error('Conta não encontrada.');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(account.user));
    } catch (e) {
      console.warn('Não foi possível persistir no localStorage', e);
    }
    this.notify(account.user);
    return account.user;
  }

  logout() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Erro ao remover sessão:', e);
    }
    this.notify(null);
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(user) {
    this.listeners.forEach(cb => {
      try {
        cb(user);
      } catch (err) {
        console.error('Erro em listener de auth:', err);
      }
    });
  }
}

export const authService = new AuthService();
