import { Instagram, Linkedin, MessageCircle } from 'lucide-react';

export default function StorefrontHeader({ artist }) {
  return <section className="overflow-hidden rounded-3xl bg-card shadow-lg">
    <div className="h-52 bg-ceu-navy bg-cover bg-center" style={{ backgroundImage: artist.cover_image ? `url(${artist.cover_image})` : undefined }} />
    <div className="px-6 pb-8 sm:px-10">
      <div className="-mt-16 flex flex-col gap-5 sm:flex-row sm:items-end">
        <div className="h-32 w-32 overflow-hidden rounded-2xl border-4 border-card bg-ceu-aqua shadow-xl">
          {artist.avatar_url ? <img src={artist.avatar_url} alt={artist.artist_name || artist.full_name} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-4xl font-bold text-ceu-cloud">{(artist.artist_name || artist.full_name || 'S')[0]}</div>}
        </div>
        <div className="flex-1"><p className="text-sm font-medium text-ceu-aqua">Loja oficial SEL</p><h1 className="text-3xl font-bold text-ceu-navy">{artist.store_name || artist.artist_name || artist.full_name}</h1><p className="mt-1 text-sm text-ceu-navy/60">por {artist.artist_name || artist.full_name}</p></div>
      </div>
      {artist.bio && <p className="mt-6 max-w-3xl text-ceu-navy/70">{artist.bio}</p>}
      <div className="mt-5 flex flex-wrap gap-3">
        {artist.whatsapp && <a href={`https://wa.me/${artist.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-ceu-navy/5 px-4 py-2 text-sm"><MessageCircle /> WhatsApp</a>}
        {artist.instagram && <a href={`https://instagram.com/${artist.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-ceu-navy/5 px-4 py-2 text-sm"><Instagram /> Instagram</a>}
        {artist.linkedin && <a href={artist.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-ceu-navy/5 px-4 py-2 text-sm"><Linkedin /> LinkedIn</a>}
      </div>
    </div>
  </section>;
}