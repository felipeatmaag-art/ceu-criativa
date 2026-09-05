import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const types = [['camiseta', 'Camiseta'], ['baby_look', 'Baby Look'], ['caneca', 'Caneca'], ['bone', 'Boné'], ['ecobag', 'Ecobag'], ['almofada', 'Almofada'], ['quadro', 'Quadro'], ['poster', 'Pôster'], ['logo_uniforme', 'Logo para uniforme']];

export default function ProductFormFields({ form, onChange }) {
  const field = (name) => ({ value: form[name], onChange: (event) => onChange(name, event.target.value) });
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 [&>div]:min-w-0">
      <div><Label>Nome do produto</Label><Input {...field('name')} placeholder="Camiseta Algodão Oversized" required /></div>
      <div><Label className="hidden">Tipo</Label><select {...field('type')} className="mt-1 h-10 w-full rounded-md border bg-background px-3 hidden">{types.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></div>
      <div><Label>Material</Label><Input {...field('material')} placeholder="100% algodão" required /></div>
      <div><Label>Modelagem</Label><Input {...field('fit')} placeholder="Oversized" required /></div>
      <div><Label>Preço base</Label><Input {...field('base_price')} type="number" min="0" step="0.01" required /></div>
      <div><Label>Tamanhos</Label><Input {...field('sizes')} placeholder="P, M, G, GG" /></div>
      <div className="sm:col-span-2"><Label>Descrição</Label><Input {...field('description')} placeholder="Detalhes do produto exibidos no Criar" /></div>
      <div className="sm:col-span-2"><Label>Cores disponíveis</Label><Input {...field('colors')} placeholder="Branco, Preto, Azul marinho" /></div>
    </div>);

}