import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, Eye, X } from 'lucide-react';

export default function CurationDesignCard({ design, onReview }) {
  return <article data-design-id={design.id} className="overflow-hidden rounded-3xl border bg-card shadow-sm">
    <div className="aspect-square overflow-hidden bg-muted"><img src={design.image_url} alt={design.title} className="h-full w-full object-cover"/></div>
    <div className="p-5">
      <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-foreground">{design.title}</h2><p className="text-sm text-muted-foreground">por {design.artist_name || 'Artista'}</p></div><Badge variant="secondary" className="capitalize">{design.category?.replace('_', ' ')}</Badge></div>
      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{design.description || 'Sem descrição enviada.'}</p>
      <div className="mt-5 grid grid-cols-3 gap-2"><Button variant="outline" onClick={() => onReview(design, 'review')}><Eye/>Revisar</Button><Button variant="outline" className="text-destructive" onClick={() => onReview(design, 'rejeitado')}><X/>Rejeitar</Button><Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => onReview(design, 'aprovado')}><Check/>Aprovar</Button></div>
    </div>
  </article>;
}