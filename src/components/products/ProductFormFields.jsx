import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const types = [['camiseta', 'Camiseta'], ['baby_look', 'Baby Look'], ['bone', 'Boné'], ['quadro', 'Quadro'], ['caneca', 'Caneca'], ['poster', 'Pôster'], ['ecobag', 'Ecobag'], ['almofada', 'Almofada'], ['logo_uniforme', 'Logo para uniforme'], ['vestido', 'Vestido'], ['saia', 'Saia'], ['jaqueta', 'Jaqueta'], ['moletom', 'Moletom'], ['regata', 'Regata'], ['calca', 'Calça'], ['shorts', 'Shorts'], ['colete', 'Colete'], ['cropped', 'Cropped'], ['touca', 'Touca']];

export default function ProductFormFields({ form, onChange }) {
  const field = (name) => ({ value: form[name], onChange: (event) => onChange(name, event.target.value) });
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 [&>div]:min-w-0">
      <div><Label>Nome do produto</Label><Input {...field('name')} placeholder="Camiseta Algodão Oversized" required /></div>
      <div><Label>Tipo</Label><Select value={form.type} onValueChange={(value) => onChange('type', value)}><SelectTrigger className="mt-1"><SelectValue /></SelectTrigger><SelectContent>{types.map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Material</Label><Input {...field('material')} placeholder="100% algodão" required /></div>
      <div><Label>Modelagem</Label><Input {...field('fit')} placeholder="Oversized" required /></div>
      <div><Label>Preço base</Label><Input {...field('base_price')} type="number" min="0" step="0.01" required /></div>
      <div><Label>Tamanhos *</Label><Input {...field('sizes')} placeholder="P, M, G, GG" required aria-required="true" /><p className="mt-1 text-xs text-muted-foreground">Informe ao menos um tamanho, separado por vírgulas.</p></div>
      <div className="sm:col-span-2"><Label>Descrição</Label><Input {...field('description')} placeholder="Detalhes do produto exibidos no Criar" /></div>
      <div className="sm:col-span-2"><Label>Cores disponíveis</Label><Input {...field('colors')} placeholder="Branco, Preto, Azul marinho" /></div>
    </div>);

}