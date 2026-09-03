import React from 'react';
import { Label } from '@/components/ui/label';

export default function ProductColorSelector({ options, value, onChange, label = 'Cor do produto' }) {
  return <div><Label className="mb-3 block text-sm font-semibold text-gray-900">{label}</Label><div className="flex flex-wrap gap-3">{options.map((color) => <button type="button" key={color.name} onClick={() => onChange(color.name)} className={`relative h-12 w-12 rounded-full border transition-transform hover:scale-110 ${value === color.name ? 'ring-2 ring-gray-900 ring-offset-2 scale-110' : 'ring-1 ring-gray-200'}`} style={{ backgroundColor: color.hex }} title={color.label || color.name} aria-label={color.label || color.name}>{value === color.name && <span className="absolute inset-0 flex items-center justify-center"><span className="h-2 w-2 rounded-full border border-white bg-gray-900" /></span>}</button>)}</div></div>;
}