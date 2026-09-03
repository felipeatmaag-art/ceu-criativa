import { UserRound, Shirt, UploadCloud, SlidersHorizontal, WalletCards, Eye } from 'lucide-react';

const tabs = [
  { id: 'profile', label: 'Dados & Fotos', icon: UserRound },
  { id: 'catalog', label: 'Meu Catálogo', icon: Shirt },
  { id: 'upload', label: 'Subir Estampas (Lote)', icon: UploadCloud, badge: 'RÁPIDO' },
  { id: 'prices', label: 'Ajustar Preços', icon: SlidersHorizontal },
  { id: 'sales', label: 'Vendas & Extrato PIX', icon: WalletCards },
  { id: 'preview', label: 'Prévia da Loja', icon: Eye }
];

export default function ProfileTabs({ active, onChange, publishedCount }) {
  return (
    <nav className="mb-8 overflow-x-auto rounded-2xl border bg-white p-2 shadow-sm" aria-label="Áreas do perfil">
      <div className="flex min-w-max gap-2">
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-colors ${active === id ? 'bg-ceu-navy text-white shadow-md' : 'text-ceu-navy/70 hover:bg-ceu-cloud'}`}
          >
            <Icon className="h-4 w-4" />
            <span>{label}{id === 'catalog' ? ` (${publishedCount})` : ''}</span>
            {badge && <span className="rounded-full bg-ceu-aqua px-2 py-0.5 text-[10px] font-black text-ceu-navy">{badge}</span>}
          </button>
        ))}
      </div>
    </nav>
  );
}