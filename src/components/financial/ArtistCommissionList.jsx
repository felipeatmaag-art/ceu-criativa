import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';

const money = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export default function ArtistCommissionList({ artists = [] }) {
  const [copiedId, setCopiedId] = useState(null);

  const copyPix = (pix, id) => {
    if (!pix) return;
    navigator.clipboard.writeText(pix);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <section className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b px-5 py-4">
        <h3 className="font-semibold text-foreground">Comissões por Artista</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Ranking e dados bancários Pix cadastrados pelos artistas para receber repasses da Atma.
        </p>
      </div>

      {artists.length ? (
        <div className="divide-y">
          {artists.map((artist) => (
            <div key={artist.artistId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0 space-y-1">
                <p className="truncate font-medium text-foreground">{artist.artistName}</p>
                <p className="text-xs text-muted-foreground">{artist.sales} {artist.sales === 1 ? 'item vendido' : 'itens vendidos'}</p>
                {artist.pixKey && (
                  <div className="flex items-center gap-1.5 pt-1 text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Chave Pix:</span>
                    <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono text-[11px]">
                      {artist.pixKey}
                    </code>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => copyPix(artist.pixKey, artist.artistId)}
                      className="h-6 px-1.5 text-[11px] text-slate-600 hover:text-emerald-700"
                    >
                      {copiedId === artist.artistId ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" /> Copiado
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="w-3 h-3" /> Copiar
                        </span>
                      )}
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">Comissão Acumulada</span>
                <p className="shrink-0 font-bold text-lg text-emerald-700">{money(artist.commission)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="p-8 text-center text-sm text-muted-foreground">
          Ainda não há comissões de artistas registradas.
        </p>
      )}
    </section>
  );
}
