/**
 * Serviço de Autenticação Céu Criativa
 * Gerencia sessões locais, credenciais ativas do Artista Felipe Silvério e do Administrador.
 */

const STORAGE_KEY = 'ceu_auth_session';

export const REGISTERED_ACCOUNTS = [
  {
    type: 'admin',
    label: 'Administrador MASTER',
    emails: ['admin@seuceu.com.br', 'admin@seuceu.art.br', 'admin@atmacomunicacao.com.br'],
    defaultEmail: 'admin@seuceu.com.br',
    passwords: ['MasterAdmin@2026', 'admin2026', 'ceuadmin123', '123456'],
    user: {
      id: 'admin-master-ceu',
      full_name: 'Administrador Master Céu',
      artist_name: 'Administrador Master',
      email: 'admin@seuceu.com.br',
      role: 'admin',
      app_role: 'master',
      store_name: '', // O Administrador Master não possui loja própria: administra todas as lojas!
      store_slug: '',
      bio: 'Gestão geral da plataforma: administração de todas as lojas, aprovação de estampas, controle de estoque físico e pagamentos Pix.',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
      cover_image: '',
      instagram: '',
      social_instagram: '',
      is_verified_artist: true,
      access_status: 'active',
      total_sales: 0,
      total_earnings: 0,
      followers_count: 0
    }
  },
  {
    type: 'customer',
    label: 'Usuário de Teste (Cliente)',
    emails: ['usuario@seuceu.com.br', 'cliente@seuceu.com.br'],
    defaultEmail: 'usuario@seuceu.com.br',
    passwords: ['TesteUser@2026', 'usuario2026', '123456'],
    user: {
      id: 'user-cliente-teste',
      full_name: 'Usuário de Teste Céu',
      artist_name: 'Comprador Teste',
      email: 'usuario@seuceu.com.br',
      role: 'customer',
      app_role: 'customer',
      store_name: '',
      store_slug: 'usuario-teste',
      bio: 'Cliente cadastrado para compra de produtos e peças exclusivas.',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      cover_image: '',
      instagram: '',
      social_instagram: '',
      is_verified_artist: false,
      access_status: 'active',
      total_sales: 0,
      total_earnings: 0,
      followers_count: 0
    }
  },
  {
    type: 'artist',
    label: 'Felipe Silvério (Artista/Criador)',
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
      bio: 'Artista visual e criador no Céu Criativa. Estampas autorais exclusivas com surrealismo contemporâneo e arte gráfica urbana.',
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
        // Assegura que admin master nunca tenha loja associada
        if (parsed.role === 'admin' || parsed.app_role === 'master' || parsed.id === 'admin-master-ceu') {
          parsed.store_name = '';
          parsed.store_slug = '';
        }
        return parsed;
      }
      return null;
    } catch (err) {
      console.warn('Erro ao ler sessão de auth:', err);
      return null;
    }
  }

  getCustomUsers() {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem('ceu_custom_users');
      return stored ? JSON.parse(stored) : [];
    } catch (_e) {
      return [];
    }
  }

  register({ fullName, email, password, role = 'artist', storeName = '' }) {
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (fullName || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanName) throw new Error('Informe o seu nome completo.');
    if (!cleanEmail) throw new Error('Informe o seu e-mail.');
    if (!cleanPass || cleanPass.length < 4) throw new Error('A senha deve ter pelo menos 4 caracteres.');

    // Verifica se já existe em contas pré-definidas
    const existsPre = REGISTERED_ACCOUNTS.some(acc =>
      acc.emails.some(e => e.toLowerCase() === cleanEmail) ||
      acc.defaultEmail.toLowerCase() === cleanEmail
    );
    if (existsPre) {
      throw new Error('Este e-mail já possui uma conta no sistema. Faça login diretamente.');
    }

    const customUsers = this.getCustomUsers();
    if (customUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Este e-mail já está cadastrado. Faça login na sua conta.');
    }

    const safeRole = role === 'admin' ? 'artist' : role; // Segurança: novos cadastros NUNCA são admin
    const cleanStore = (storeName || `${cleanName} Studio`).trim();
    const slug = cleanStore.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

    const newUser = {
      id: 'user_' + Date.now(),
      full_name: cleanName,
      artist_name: cleanName,
      email: cleanEmail,
      role: safeRole,
      app_role: safeRole,
      store_name: safeRole === 'artist' ? cleanStore : '',
      store_slug: safeRole === 'artist' ? slug : '',
      password: cleanPass,
      avatar_url: '',
      is_verified_artist: safeRole === 'artist',
      access_status: 'active',
      created_at: new Date().toISOString()
    };

    customUsers.push(newUser);
    try {
      localStorage.setItem('ceu_custom_users', JSON.stringify(customUsers));
      // Salva sessão do usuário recém-criado
      const sessionUser = { ...newUser };
      delete sessionUser.password;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
      this.notify(sessionUser);
      return sessionUser;
    } catch (e) {
      console.warn('Erro ao salvar novo cadastro:', e);
      throw new Error('Falha ao gravar seu cadastro localmente.');
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

    // 1. Procura nas contas oficiais pré-cadastradas
    const account = REGISTERED_ACCOUNTS.find(acc => 
      acc.emails.some(e => e.toLowerCase() === cleanLogin) ||
      acc.defaultEmail.toLowerCase() === cleanLogin ||
      acc.user.email.toLowerCase() === cleanLogin ||
      (cleanLogin.includes('felipe') && acc.type === 'artist') ||
      (cleanLogin.includes('admin') && acc.type === 'admin')
    );

    if (account) {
      const isPassValid = account.passwords.includes(cleanPass);
      if (!isPassValid) {
        throw new Error('Senha incorreta. Verifique suas credenciais.');
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(account.user));
      } catch (e) {
        console.warn('Não foi possível persistir no localStorage', e);
      }

      this.notify(account.user);
      return account.user;
    }

    // 2. Procura nas contas cadastradas dinamicamente pelos usuários
    const customUsers = this.getCustomUsers();
    const customAccount = customUsers.find(u => u.email.toLowerCase() === cleanLogin);

    if (customAccount) {
      if (customAccount.password && customAccount.password !== cleanPass) {
        throw new Error('Senha incorreta. Verifique suas credenciais.');
      }

      const sessionUser = { ...customAccount };
      delete sessionUser.password;

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionUser));
      } catch (e) {
        console.warn('Não foi possível persistir no localStorage', e);
      }

      this.notify(sessionUser);
      return sessionUser;
    }

    throw new Error('Usuário não cadastrado. Clique em "Criar Conta" para se cadastrar com seu nome e e-mail.');
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
