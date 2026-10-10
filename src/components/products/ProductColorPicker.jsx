import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X, Check, Sparkles } from 'lucide-react';

export const POPULAR_APPAREL_COLORS = [
  { name: 'VERMELHO', hex: '#DC2626', label: 'Vermelho' },
  { name: 'PRETO', hex: '#000000', label: 'Preto' },
  { name: 'BRANCO', hex: '#FFFFFF', border: true, label: 'Branco' },
  { name: 'OFF-WHITE', hex: '#FAF9F6', border: true, label: 'Off-White' },
  { name: 'AZUL MARINHO', hex: '#1E3A8A', label: 'Azul Marinho' },
  { name: 'AZUL ROYAL', hex: '#2563EB', label: 'Azul Royal' },
  { name: 'AZUL BEBÊ', hex: '#93C5FD', label: 'Azul Bebê' },
  { name: 'CINZA MESCLA', hex: '#9CA3AF', label: 'Cinza Mescla' },
  { name: 'CHUMBO', hex: '#374151', label: 'Chumbo' },
  { name: 'VERDE MILITAR', hex: '#4D5D43', label: 'Verde Militar' },
  { name: 'VERDE BANDEIRA', hex: '#15803D', label: 'Verde Bandeira' },
  { name: 'AMARELO OURO', hex: '#EAB308', label: 'Amarelo Ouro' },
  { name: 'BORDÔ / VINHO', hex: '#831843', label: 'Bordô / Vinho' },
  { name: 'ROSA PINK', hex: '#EC4899', label: 'Rosa Pink' },
  { name: 'ROSA CLARO', hex: '#FBCFE8', label: 'Rosa Claro' },
  { name: 'LARANJA', hex: '#EA580C', label: 'Laranja' },
  { name: 'BEGE / CRU', hex: '#D7C4A5', label: 'Bege / Cru' },
  { name: 'MARROM', hex: '#713F12', label: 'Marrom' },
  { name: 'ROXO', hex: '#7E22CE', label: 'Roxo' },
  { name: 'TERRACOTA', hex: '#C25E3B', label: 'Terracota' }
];

// Dicionário inteligente para mapear termos digitados diretamente para a cor correta
const COLOR_NAME_DICTIONARY = {
  'vermelho': { name: 'VERMELHO', hex: '#DC2626' },
  'vermelha': { name: 'VERMELHO', hex: '#DC2626' },
  'red': { name: 'VERMELHO', hex: '#DC2626' },
  'preto': { name: 'PRETO', hex: '#000000' },
  'preta': { name: 'PRETO', hex: '#000000' },
  'black': { name: 'PRETO', hex: '#000000' },
  'branco': { name: 'BRANCO', hex: '#FFFFFF' },
  'branca': { name: 'BRANCO', hex: '#FFFFFF' },
  'white': { name: 'BRANCO', hex: '#FFFFFF' },
  'off white': { name: 'OFF-WHITE', hex: '#FAF9F6' },
  'off-white': { name: 'OFF-WHITE', hex: '#FAF9F6' },
  'marinho': { name: 'AZUL MARINHO', hex: '#1E3A8A' },
  'azul marinho': { name: 'AZUL MARINHO', hex: '#1E3A8A' },
  'navy': { name: 'AZUL MARINHO', hex: '#1E3A8A' },
  'azul': { name: 'AZUL ROYAL', hex: '#2563EB' },
  'royal': { name: 'AZUL ROYAL', hex: '#2563EB' },
  'azul royal': { name: 'AZUL ROYAL', hex: '#2563EB' },
  'azul bebe': { name: 'AZUL BEBÊ', hex: '#93C5FD' },
  'azul bebê': { name: 'AZUL BEBÊ', hex: '#93C5FD' },
  'cinza': { name: 'CINZA MESCLA', hex: '#9CA3AF' },
  'cinza mescla': { name: 'CINZA MESCLA', hex: '#9CA3AF' },
  'mescla': { name: 'CINZA MESCLA', hex: '#9CA3AF' },
  'gray': { name: 'CINZA MESCLA', hex: '#9CA3AF' },
  'grey': { name: 'CINZA MESCLA', hex: '#9CA3AF' },
  'chumbo': { name: 'CHUMBO', hex: '#374151' },
  'grafite': { name: 'CHUMBO', hex: '#374151' },
  'verde militar': { name: 'VERDE MILITAR', hex: '#4D5D43' },
  'militar': { name: 'VERDE MILITAR', hex: '#4D5D43' },
  'verde': { name: 'VERDE BANDEIRA', hex: '#15803D' },
  'verde bandeira': { name: 'VERDE BANDEIRA', hex: '#15803D' },
  'amarelo': { name: 'AMARELO OURO', hex: '#EAB308' },
  'amarela': { name: 'AMARELO OURO', hex: '#EAB308' },
  'ouro': { name: 'AMARELO OURO', hex: '#EAB308' },
  'yellow': { name: 'AMARELO OURO', hex: '#EAB308' },
  'vinho': { name: 'BORDÔ / VINHO', hex: '#831843' },
  'bordo': { name: 'BORDÔ / VINHO', hex: '#831843' },
  'bordô': { name: 'BORDÔ / VINHO', hex: '#831843' },
  'pink': { name: 'ROSA PINK', hex: '#EC4899' },
  'rosa pink': { name: 'ROSA PINK', hex: '#EC4899' },
  'rosa': { name: 'ROSA CLARO', hex: '#FBCFE8' },
  'rosa claro': { name: 'ROSA CLARO', hex: '#FBCFE8' },
  'laranja': { name: 'LARANJA', hex: '#EA580C' },
  'orange': { name: 'LARANJA', hex: '#EA580C' },
  'bege': { name: 'BEGE / CRU', hex: '#D7C4A5' },
  'cru': { name: 'BEGE / CRU', hex: '#D7C4A5' },
  'marrom': { name: 'MARROM', hex: '#713F12' },
  'brown': { name: 'MARROM', hex: '#713F12' },
  'roxo': { name: 'ROXO', hex: '#7E22CE' },
  'roxa': { name: 'ROXO', hex: '#7E22CE' },
  'purple': { name: 'ROXO', hex: '#7E22CE' },
  'terracota': { name: 'TERRACOTA', hex: '#C25E3B' },
};

export default function ProductColorPicker({ colors = [], onChange }) {
  const [name, setName] = useState('');
  const [hex, setHex] = useState('#DC2626');

  // Adicionar cor manual ou detectada
  const addColor = (colorName, colorHex) => {
    const cleanName = (colorName || name).trim().toUpperCase();
    if (!cleanName) return;

    // Verificar se já existe (case-insensitive)
    const exists = colors.some((c) => c.name.toUpperCase() === cleanName);
    if (exists) return;

    // Se não forneceu hex, verifica se temos mapeado no dicionário inteligente
    let targetHex = colorHex || hex;
    const normalizedKey = cleanName.toLowerCase();
    if (!colorHex && COLOR_NAME_DICTIONARY[normalizedKey]) {
      targetHex = COLOR_NAME_DICTIONARY[normalizedKey].hex;
    }

    onChange([...colors, { name: cleanName, hex: targetHex }]);
    setName('');
  };

  // Toggle ao clicar num preset de cor (se já tem, remove; se não tem, já inclui na hora!)
  const togglePresetColor = (preset) => {
    const isIncluded = colors.some(
      (c) => c.name.toUpperCase() === preset.name.toUpperCase()
    );

    if (isIncluded) {
      // Remove
      onChange(colors.filter((c) => c.name.toUpperCase() !== preset.name.toUpperCase()));
    } else {
      // Já inclui na hora!
      onChange([...colors, { name: preset.name, hex: preset.hex }]);
    }
  };

  // Ao digitar no campo: se der match exato com dicionário ou usuário der Enter, inclui direto!
  const handleInputChange = (e) => {
    const val = e.target.value;
    setName(val);

    const norm = val.trim().toLowerCase();
    if (COLOR_NAME_DICTIONARY[norm]) {
      // Atualiza o hex preview para acompanhar a cor digitada
      setHex(COLOR_NAME_DICTIONARY[norm].hex);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const norm = name.trim().toLowerCase();
      if (COLOR_NAME_DICTIONARY[norm]) {
        const item = COLOR_NAME_DICTIONARY[norm];
        addColor(item.name, item.hex);
      } else {
        addColor(name, hex);
      }
    }
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Cores Disponíveis do Produto
        </label>
        <span className="text-xs text-slate-500 font-medium">
          {colors.length} {colors.length === 1 ? 'cor selecionada' : 'cores selecionadas'}
        </span>
      </div>

      {/* Paleta rápida de 1 clique - Clicou, já inclui na hora! */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            Cores Rápidas (Clique para incluir direto):
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POPULAR_APPAREL_COLORS.map((preset) => {
            const isSelected = colors.some(
              (c) => c.name.toUpperCase() === preset.name.toUpperCase()
            );

            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => togglePresetColor(preset)}
                title={isSelected ? `Remover ${preset.label}` : `Incluir ${preset.label} agora`}
                className={`group inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all shadow-sm ${
                  isSelected
                    ? 'bg-slate-900 text-white ring-2 ring-slate-900 ring-offset-1'
                    : 'bg-white text-slate-700 border border-slate-300 hover:border-slate-400 hover:bg-slate-100'
                }`}
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full border border-black/20"
                  style={{ backgroundColor: preset.hex }}
                />
                <span>{preset.label}</span>
                {isSelected ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Plus className="h-3 w-3 text-slate-400 group-hover:text-slate-700 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Campo para digitar qualquer cor personalizada com auto-detecção */}
      <div className="flex min-w-0 gap-2 items-center">
        <div className="relative flex-1 min-w-0">
          <Input
            value={name}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite o nome da cor (ex: Vermelho, Preto, Rosa) e tecle Enter..."
            className="rounded-xl bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-800 text-sm h-10"
          />
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <input
            type="color"
            value={hex}
            onChange={(e) => setHex(e.target.value)}
            className="h-10 w-11 shrink-0 cursor-pointer rounded-xl border border-slate-300 bg-white p-1"
            title="Escolher tom exato da cor"
            aria-label="Escolher tom exato da cor"
          />
          <Button
            type="button"
            onClick={() => {
              const norm = name.trim().toLowerCase();
              if (COLOR_NAME_DICTIONARY[norm]) {
                const item = COLOR_NAME_DICTIONARY[norm];
                addColor(item.name, item.hex);
              } else {
                addColor(name, hex);
              }
            }}
            disabled={!name.trim()}
            className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar
          </Button>
        </div>
      </div>

      {/* Lista das Cores Ativas no Produto */}
      {colors.length > 0 && (
        <div className="pt-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
            Cores incluídas neste modelo:
          </p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <span
                key={color.name}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pl-2.5 pr-1.5 text-xs font-semibold text-slate-800 shadow-sm"
              >
                <span
                  className="h-4 w-4 rounded-full border border-slate-300 shrink-0"
                  style={{ backgroundColor: color.hex }}
                />
                <span className="font-bold">{color.name}</span>
                <button
                  type="button"
                  onClick={() =>
                    onChange(colors.filter((item) => item.name !== color.name))
                  }
                  className="rounded-full p-1 hover:bg-slate-100 text-slate-400 hover:text-rose-600 transition-colors"
                  aria-label={`Remover ${color.name}`}
                  title={`Remover ${color.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
