import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';

export default function ProductColorPicker({ colors, onChange }) {
  const [name, setName] = useState('');
  const [hex, setHex] = useState('#000000');
  const add = () => {
    const cleanName = name.trim();
    if (!cleanName || colors.some((color) => color.name.toLowerCase() === cleanName.toLowerCase())) return;
    onChange([...colors, { name: cleanName, hex }]); setName('');
  };
  return <div className="mt-4"><p className="mb-2 text-sm font-semibold">Cores disponíveis</p><div className="flex min-w-0 gap-2"><Input value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); add(); } }} placeholder="Ex.: Azul" className="min-w-0 flex-1 rounded-xl" /><input type="color" value={hex} onChange={(event) => setHex(event.target.value)} className="h-9 w-12 shrink-0 cursor-pointer rounded-xl border bg-card p-1" aria-label="Escolher tom da cor" /><Button type="button" variant="outline" size="icon" onClick={add} className="shrink-0 rounded-xl" title="Adicionar cor"><Plus /></Button></div><div className="mt-3 flex flex-wrap gap-2">{colors.map((color) => <span key={color.name} className="inline-flex items-center gap-2 rounded-full border bg-card py-1 pl-2 pr-1 text-xs font-semibold"><span className="h-4 w-4 rounded-full border" style={{ backgroundColor: color.hex }} />{color.name}<button type="button" onClick={() => onChange(colors.filter((item) => item.name !== color.name))} className="rounded-full p-1 hover:bg-muted" aria-label={`Remover ${color.name}`}><X className="h-3 w-3" /></button></span>)}</div></div>;
}