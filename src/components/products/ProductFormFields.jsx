import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const types = [['camiseta', 'Camiseta'], ['baby_look', 'Baby Look'], ['bone', 'Boné'], ['quadro', 'Quadro'], ['caneca', 'Caneca'], ['poster', 'Pôster'], ['ecobag', 'Ecobag'], ['almofada', 'Almofada'], ['logo_uniforme', 'Logo para uniforme'], ['vestido', 'Vestido'], ['saia', 'Saia'], ['jaqueta', 'Jaqueta'], ['moletom', 'Moletom'], ['regata', 'Regata'], ['calca', 'Calça'], ['shorts', 'Shorts'], ['colete', 'Colete'], ['cropped', 'Cropped'], ['touca', 'Touca']];

export default function ProductFormFields({ form, onChange }) {
  const field = (name) => ({ value: form[name], onChange: (event) => onChange(name, event.target.value) });
  return (
    <div className="grid min-w-0 gap-4 sm:grid-cols-2 [&>div]:min-w-0">
      <div>
        <Label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Nome do produto</Label>
        <Input {...field('name')} placeholder="Camiseta Algodão Oversized" required className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-800" />
      </div>
      <div>
        <Label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Tipo</Label>
        <Select value={form.type} onValueChange={(value) => onChange('type', value)}>
          <SelectTrigger className="mt-1 bg-white border-slate-300 text-slate-900 focus:ring-slate-800"><SelectValue /></SelectTrigger>
          <SelectContent className="bg-white text-slate-900 border-slate-200">
            {types.map(([value, label]) => <SelectItem key={value} value={value} className="text-slate-900 focus:bg-slate-100">{label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Material</Label>
        <Input {...field('material')} placeholder="100% algodão" required className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-800" />
      </div>
      <div>
        <Label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Modelagem</Label>
        <Input {...field('fit')} placeholder="Oversized" required className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-800" />
      </div>
      <div>
        <Label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Preço base</Label>
        <Input {...field('base_price')} type="number" min="0" step="0.01" required className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-800" />
      </div>
      <div>
        <Label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Tamanhos *</Label>
        <Input {...field('sizes')} placeholder="P, M, G, GG" required aria-required="true" className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-800" />
        <p className="mt-1 text-xs text-muted-foreground">Informe ao menos um tamanho, separado por vírgulas.</p>
      </div>
      <div className="sm:col-span-2">
        <Label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Descrição</Label>
        <Input {...field('description')} placeholder="Detalhes do produto exibidos no Criar" className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-800" />
      </div>
      <div className="sm:col-span-2">
        <Label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-700">Cores disponíveis</Label>
        <Input {...field('colors')} placeholder="Branco, Preto, Azul marinho" className="bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-800" />
      </div>
    </div>
  );
}