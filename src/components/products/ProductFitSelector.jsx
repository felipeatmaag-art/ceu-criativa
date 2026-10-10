import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Plus, Shirt, ChevronDown } from 'lucide-react';

export const FALLBACK_FITS = [
  'Tradicional',
  'Regular Fit',
  'Oversized',
  'Streetwear Boxy',
  'Baby Look',
  'Slim Fit',
  'Raglan',
  'Regata',
  'Muscle Tee',
  'Gola V',
  'Moletom Canguru',
  'Moletom Careca',
  'Manga Longa',
  'Camisa Polo',
  'Cropped',
  'Infantil',
  'Longline',
  'Heavyweight Streetwear',
];

export default function ProductFitSelector({ value = '', onChange }) {
  const [fits, setFits] = useState(FALLBACK_FITS);
  const [searchTerm, setSearchTerm] = useState(value || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [statusMessage, setStatusMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sincroniza quando o valor inicial mudar de fora
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Carrega lista de modelagens do banco de dados do sistema
  useEffect(() => {
    let isMounted = true;
    fetch('/api/product-fits')
      .then((res) => {
        if (!res.ok) throw new Error('Falha ao carregar modelagens');
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          // Garante união única entre padrões e o que veio do banco
          const merged = Array.from(new Set([...data, ...FALLBACK_FITS]));
          setFits(merged);
        }
      })
      .catch((err) => {
        console.warn('Usando lista local de modelagens:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtra as opções pelo termo digitado
  const filteredFits = fits.filter((fit) =>
    fit.toLowerCase().includes((searchTerm || '').trim().toLowerCase())
  );

  const exactMatchExists = fits.some(
    (fit) => fit.toLowerCase() === (searchTerm || '').trim().toLowerCase()
  );

  // Cadastra e salva no sistema permanentemente
  const saveAndSelectFit = async (fitName) => {
    const cleanFit = (fitName || searchTerm).trim();
    if (!cleanFit) return;

    // Atualiza o formulário do produto imediatamente
    onChange(cleanFit);
    setSearchTerm(cleanFit);
    setIsOpen(false);

    // Se já estiver na lista, não precisa fazer requisição de cadastro
    if (fits.some((f) => f.toLowerCase() === cleanFit.toLowerCase())) {
      return;
    }

    // Grava a nova modelagem no banco de dados do sistema
    setIsSaving(true);
    try {
      const res = await fetch('/api/product-fits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanFit }),
      });

      if (res.ok) {
        const data = await res.json();
        setFits((prev) => Array.from(new Set([cleanFit, ...prev])));
        setStatusMessage(`✨ Modelagem "${cleanFit}" cadastrada no sistema!`);
        setTimeout(() => setStatusMessage(''), 3500);
      }
    } catch (err) {
      console.error('Erro ao salvar modelagem no sistema:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < filteredFits.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : filteredFits.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredFits[highlightedIndex]) {
        saveAndSelectFit(filteredFits[highlightedIndex]);
      } else if (searchTerm.trim()) {
        saveAndSelectFit(searchTerm.trim());
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Chips com as mais populares para clicar direto
  const POPULAR_SHORTCUTS = [
    'Tradicional',
    'Oversized',
    'Streetwear Boxy',
    'Baby Look',
    'Moletom Canguru',
    'Camisa Polo',
    'Regata',
    'Slim Fit',
  ];

  return (
    <div className="relative" ref={containerRef}>
      <div className="flex items-center justify-between mb-1.5">
        <Label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Modelagem / Fit (com Auto-completar)
        </Label>
        {statusMessage && (
          <span className="text-xs font-semibold text-emerald-600 animate-fade-in flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            {statusMessage}
          </span>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Shirt className="w-4 h-4" />
        </div>

        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            onChange(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Comece a digitar (ex: Oversized, Baby Look)... ou crie uma nova"
          className="pl-9 pr-10 rounded-xl bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus-visible:ring-slate-800 text-sm h-10"
        />

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 rounded-md"
          tabIndex={-1}
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown de Autocomplete Inteligente */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl py-1 text-slate-800">
          {/* Se o usuário digitou algo novo que não existe na lista, mostra opção de cadastro */}
          {searchTerm.trim() && !exactMatchExists && (
            <div
              onClick={() => saveAndSelectFit(searchTerm.trim())}
              className="px-3.5 py-2.5 bg-purple-50/70 hover:bg-purple-100 text-purple-900 cursor-pointer border-b border-purple-100 flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-bold">
                  Cadastrar nova modelagem: <span className="underline decoration-purple-400 font-extrabold">"{searchTerm.trim()}"</span>
                </span>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-purple-200/80 text-purple-800 px-2 py-0.5 rounded-full">
                Tecla Enter
              </span>
            </div>
          )}

          {/* Opções filtradas */}
          {filteredFits.length > 0 ? (
            filteredFits.map((fit, idx) => {
              const isSelected = value?.toLowerCase() === fit.toLowerCase();
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={fit}
                  onClick={() => saveAndSelectFit(fit)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`px-3.5 py-2 cursor-pointer flex items-center justify-between text-xs font-medium transition-colors ${
                    isHighlighted ? 'bg-slate-100 text-slate-900 font-bold' : 'hover:bg-slate-50'
                  } ${isSelected ? 'text-purple-700 font-bold bg-purple-50/40' : ''}`}
                >
                  <span className="flex items-center gap-2">
                    <Shirt className="w-3.5 h-3.5 text-slate-400" />
                    {fit}
                  </span>
                  {isSelected && <Check className="w-4 h-4 text-purple-600" />}
                </div>
              );
            })
          ) : (
            <div className="px-3.5 py-3 text-center text-xs text-slate-500">
              Nenhuma modelagem encontrada com esse nome. Digite o nome e tecle <strong>Enter</strong> para cadastrar!
            </div>
          )}
        </div>
      )}

      {/* Chips Rápidos de Atalho */}
      <div className="mt-2 flex flex-wrap gap-1.5 items-center">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
          Mais usadas:
        </span>
        {POPULAR_SHORTCUTS.map((fitName) => {
          const isSelected = value?.toLowerCase() === fitName.toLowerCase();
          return (
            <button
              key={fitName}
              type="button"
              onClick={() => saveAndSelectFit(fitName)}
              className={`text-xs px-2.5 py-0.5 rounded-full font-semibold transition-all border ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {fitName}
            </button>
          );
        })}
      </div>
    </div>
  );
}
