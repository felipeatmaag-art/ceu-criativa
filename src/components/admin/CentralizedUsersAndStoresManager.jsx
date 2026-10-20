import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Users, 
  Store, 
  Search, 
  ExternalLink, 
  RefreshCw, 
  Wallet,
  BadgeCheck,
  ShoppingBag,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function CentralizedUsersAndStoresManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL'); // 'ALL' | 'stores' | 'customers' | 'admins'
  const [feedback, setFeedback] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Busca todos os usuários cadastrados
  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['centralized-users-stores'],
    queryFn: async () => {
      try {
        const list = await base44.entities.User.list('-created_date', 200);
        return Array.isArray(list) ? list : [];
      } catch (err) {
        console.error('Erro ao buscar usuários:', err);
        return [];
      }
    }
  });

  // Métricas
  const totalUsers = users.length;
  const storeUsers = users.filter(u => 
    (u.role === 'artist' || u.store_name || u.store_slug || u.is_artist) &&
    u.role !== 'admin' && u.email !== 'admin@seuceu.com.br' && u.id !== 'admin-master-ceu'
  );
  const verifiedStores = storeUsers.filter(u => u.is_verified_artist);
  const adminUsers = users.filter(u => u.role === 'admin' || u.app_role === 'master');
  const customerUsers = users.filter(u => !storeUsers.includes(u) && !adminUsers.includes(u));

  // Filtragem
  const filteredUsers = users.filter(u => {
    const isMaster = u.email === 'admin@seuceu.com.br' || u.id === 'admin-master-ceu' || u.role === 'admin';
    const isStore = !isMaster && (u.role === 'artist' || u.store_name || u.store_slug || u.is_artist);

    if (typeFilter === 'stores' && !isStore) return false;
    if (typeFilter === 'admins' && !isMaster) return false;
    if (typeFilter === 'customers' && (isStore || isMaster)) return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = (u.full_name || u.artist_name || u.name || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      const matchStore = (u.store_name || u.store_slug || '').toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchStore) return false;
    }

    return true;
  });

  // Alternar Selo Oficial de Artista Verificado
  const handleToggleVerified = async (targetUser) => {
    setActionLoadingId(targetUser.id);
    try {
      const nextStatus = !targetUser.is_verified_artist;
      await base44.entities.User.update(targetUser.id, {
        is_verified_artist: nextStatus
      });
      await queryClient.invalidateQueries({ queryKey: ['centralized-users-stores'] });
      setFeedback({
        type: 'success',
        text: `✓ Loja "${targetUser.store_name || targetUser.artist_name}" ${nextStatus ? 'agora possui o Selo Oficial de Artista Verificado!' : 'teve o selo de verificação removido.'}`
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Não foi possível atualizar o selo da loja.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // Alternar Bloqueio / Ativação de Acesso
  const handleToggleAccess = async (targetUser) => {
    if (targetUser.email === 'admin@seuceu.com.br' || targetUser.id === 'admin-master-ceu') {
      alert('A conta Master Administrador não pode ser desativada.');
      return;
    }

    setActionLoadingId(targetUser.id);
    try {
      const nextStatus = targetUser.access_status === 'disabled' ? 'active' : 'disabled';
      await base44.entities.User.update(targetUser.id, {
        access_status: nextStatus
      });
      await queryClient.invalidateQueries({ queryKey: ['centralized-users-stores'] });
      setFeedback({
        type: 'success',
        text: `✓ Usuário ${targetUser.full_name || targetUser.email} ${nextStatus === 'disabled' ? 'foi desativado.' : 'foi reativado com sucesso.'}`
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error(err);
      setFeedback({ type: 'error', text: 'Erro ao alterar status de acesso.' });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. CARDS DE MÉTRICAS GERAIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Total de Usuários</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              {totalUsers}
            </span>
            <span className="text-xs text-slate-500">contas</span>
          </div>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">
            Cadastrados na plataforma Céu Criativa
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Lojas &amp; Artistas</span>
            <Store className="w-4 h-4 text-pink-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              {storeUsers.length}
            </span>
            <span className="text-xs text-slate-500">lojas ativas</span>
          </div>
          <p className="text-[11px] text-pink-600 font-semibold mt-1">
            {verifiedStores.length} com selo de verificação oficial
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Clientes / Compradores</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              {customerUsers.length}
            </span>
            <span className="text-xs text-slate-500">compradores</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            Compram estampas personalizadas
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Administração</span>
            <Shield className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 tabular-nums">
              {adminUsers.length}
            </span>
            <span className="text-xs text-slate-500">gestores</span>
          </div>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">
            Gestão total sem loja individual
          </p>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS E BUSCA */}
      <div className="rounded-2xl bg-white p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Filtro de Tipo */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setTypeFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              typeFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Todos ({totalUsers})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('stores')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              typeFilter === 'stores'
                ? 'bg-pink-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Lojas &amp; Artistas ({storeUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('customers')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              typeFilter === 'customers'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Clientes ({customerUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('admins')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              typeFilter === 'admins'
                ? 'bg-blue-600 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Administradores ({adminUsers.length})
          </button>
        </div>

        {/* Campo de Busca & Recarregar */}
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, e-mail ou loja..."
              className="pl-9 h-9 text-xs rounded-xl bg-slate-50 border-slate-200"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl h-9 text-xs font-bold border-slate-300"
            title="Recarregar usuários"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
            : 'bg-red-50 border border-red-300 text-red-900'
        }`}>
          <span>{feedback.text}</span>
          <button type="button" onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* 3. LISTAGEM CENTRALIZADA DE USUÁRIOS E LOJAS */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-sm">Carregando usuários e lojas...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Nenhum usuário ou loja encontrado para o filtro atual.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Usuário</th>
                  <th className="py-3.5 px-4">Papel &amp; Permissão</th>
                  <th className="py-3.5 px-4">Loja Vinculada</th>
                  <th className="py-3.5 px-4">Chave Pix Repasses</th>
                  <th className="py-3.5 px-4">Status de Acesso</th>
                  <th className="py-3.5 px-4 text-right">Ações de Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isMasterUser = u.email === 'admin@seuceu.com.br' || u.id === 'admin-master-ceu' || u.role === 'admin';
                  const isArtistStore = !isMasterUser && (u.role === 'artist' || u.store_name || u.store_slug || u.is_artist);
                  const storeSlug = u.store_slug || u.store_name?.toLowerCase().replace(/\s+/g, '-');
                  const isDisabled = u.access_status === 'disabled';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Usuário */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                            {u.avatar_url ? (
                              <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span>{(u.full_name || u.name || u.email || 'U')[0]?.toUpperCase()}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">
                              {u.full_name || u.artist_name || u.name || 'Sem nome'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Papel */}
                      <td className="py-3.5 px-4">
                        {isMasterUser ? (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-bold text-[10px]">
                            🛡️ Administrador Master
                          </Badge>
                        ) : isArtistStore ? (
                          <Badge className="bg-pink-100 text-pink-800 border-pink-200 font-bold text-[10px]">
                            👑 Artista / Loja
                          </Badge>
                        ) : (
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold text-[10px]">
                            🛍️ Cliente
                          </Badge>
                        )}
                      </td>

                      {/* Loja Vinculada */}
                      <td className="py-3.5 px-4">
                        {isMasterUser ? (
                          <span className="text-[11px] text-slate-400 italic">
                            Sem loja (Gestão Global)
                          </span>
                        ) : isArtistStore ? (
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-800">
                                {u.store_name || u.artist_name || 'Loja do Artista'}
                              </span>
                              {u.is_verified_artist && (
                                <BadgeCheck className="w-4 h-4 text-blue-600" title="Loja Oficial Verificada" />
                              )}
                            </div>
                            {storeSlug && (
                              <a
                                href={`/${storeSlug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:text-purple-800 font-mono mt-0.5"
                              >
                                <span>ceucriativa.art/{storeSlug}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            Nenhuma loja vinculada
                          </span>
                        )}
                      </td>

                      {/* Chave Pix Repasses */}
                      <td className="py-3.5 px-4 font-mono text-[11px]">
                        {u.pix_key ? (
                          <div className="flex items-center gap-1 text-slate-700">
                            <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate max-w-[150px]">{u.pix_key}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Não informada</span>
                        )}
                      </td>

                      {/* Status de Acesso */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isDisabled
                            ? 'bg-rose-100 text-rose-700 border border-rose-200'
                            : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isDisabled ? 'bg-rose-600' : 'bg-emerald-600'}`} />
                          {isDisabled ? 'Acesso Desativado' : 'Conta Ativa'}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isArtistStore && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={actionLoadingId === u.id}
                              onClick={() => handleToggleVerified(u)}
                              className={`h-7 px-2.5 text-[10px] font-bold rounded-lg ${
                                u.is_verified_artist
                                  ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                                  : 'border-blue-300 text-blue-700 hover:bg-blue-50'
                              }`}
                            >
                              {u.is_verified_artist ? 'Remover Selo' : 'Dar Selo Oficial'}
                            </Button>
                          )}

                          {!isMasterUser && (
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              disabled={actionLoadingId === u.id}
                              onClick={() => handleToggleAccess(u)}
                              className={`h-7 px-2 text-[10px] font-bold rounded-lg ${
                                isDisabled
                                  ? 'text-emerald-700 hover:bg-emerald-50'
                                  : 'text-rose-600 hover:bg-rose-50'
                              }`}
                            >
                              {isDisabled ? 'Reativar' : 'Desativar'}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
