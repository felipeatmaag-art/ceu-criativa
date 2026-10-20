import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  RefreshCw,
  Mail,
  Wallet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export default function AdminStoresManager() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState(null);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['admin-stores-list'],
    queryFn: async () => {
      try {
        const list = await base44.entities.User.list('-created_date', 100);
        return Array.isArray(list) ? list : [];
      } catch (err) {
        console.error('Erro ao buscar usuários/lojas:', err);
        return [];
      }
    }
  });

  // Filtra apenas contas que são artistas ou possuem loja (excluindo conta de administração Master)
  const artistStores = users.filter((u) => {
    const isAdmin = u.role === 'admin' || u.app_role === 'master' || u.email === 'admin@seuceu.com.br' || u.id === 'admin-master-ceu';
    if (isAdmin) return false;
    return (
      u.role === 'artist' ||
      u.is_artist ||
      u.store_name ||
      u.store_slug ||
      String(u.id || '').includes('artist')
    );
  });

  const filteredStores = artistStores.filter((s) => {
    const term = search.toLowerCase();
    const name = (s.artist_name || s.full_name || s.name || '').toLowerCase();
    const store = (s.store_name || s.store_slug || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    return name.includes(term) || store.includes(term) || email.includes(term);
  });

  const toggleVerifyArtist = async (store) => {
    try {
      const nextStatus = !store.is_verified_artist;
      await base44.entities.User.update(store.id, {
        is_verified_artist: nextStatus
      });
      await queryClient.invalidateQueries({ queryKey: ['admin-stores-list'] });
      setFeedback({
        type: 'success',
        text: `Loja ${store.store_name || store.artist_name} ${nextStatus ? 'verificada com selo oficial!' : 'teve o selo removido.'}`
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Métricas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
            Controle de Criadores &amp; Lojas
          </span>
          <h2 className="text-2xl font-black text-slate-900 mt-1">
            Todas as Lojas &amp; Artistas ({artistStores.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerencie todas as lojas autorais cadastradas na Céu Criativa, chaves Pix de repasses e status de verificação.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="rounded-xl h-9 text-xs font-bold gap-1.5 border-slate-300"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
            Atualizar
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold">
          {feedback.text}
        </div>
      )}

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          type="text"
          placeholder="Buscar por nome do artista, loja ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-10 rounded-xl bg-white border-slate-300 text-xs text-slate-900"
        />
      </div>

      {/* Lista de Lojas */}
      {isLoading ? (
        <div className="p-10 text-center text-xs text-slate-400 bg-white rounded-3xl border">
          Carregando lojas cadastradas...
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-3xl border">
          Nenhuma loja encontrada para a busca informada.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.map((s) => {
            const storeSlug = s.store_slug || s.store_name?.toLowerCase().replace(/\s+/g, '-');
            return (
              <div
                key={s.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white flex items-center justify-center font-black text-sm overflow-hidden shrink-0 shadow-sm">
                      {s.avatar_url ? (
                        <img src={s.avatar_url} alt={s.store_name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(s.artist_name || s.store_name || 'A')[0]}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-sm text-slate-900 truncate">
                          {s.store_name || s.artist_name || 'Loja Sem Nome'}
                        </h4>
                        {s.is_verified_artist && (
                          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" title="Artista Verificado" />
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate">
                        {s.artist_name || s.full_name}
                      </p>
                    </div>
                  </div>

                  <Badge className={`text-[10px] font-bold ${s.access_status === 'blocked' ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-800'}`}>
                    {s.access_status === 'blocked' ? 'Bloqueada' : 'Ativa'}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{s.email || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-mono text-[11px] text-slate-800 truncate">
                      Pix: {s.pix_key || 'Não cadastrado'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 font-semibold text-[11px]">
                    <span>Vendas: <strong>{s.total_sales || 0} un</strong></span>
                    <span className="text-purple-700">Comissão: {s.commission_rate || 20}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {storeSlug && (
                    <Link
                      to={`/loja/${storeSlug}`}
                      target="_blank"
                      className="flex-1 inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver Vitrine
                    </Link>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => toggleVerifyArtist(s)}
                    className="h-9 px-3 rounded-xl border-slate-300 text-xs font-bold text-slate-700"
                    title={s.is_verified_artist ? "Remover selo oficial" : "Conceder selo oficial"}
                  >
                    <ShieldCheck className={`w-3.5 h-3.5 ${s.is_verified_artist ? 'text-blue-600' : 'text-slate-400'}`} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
