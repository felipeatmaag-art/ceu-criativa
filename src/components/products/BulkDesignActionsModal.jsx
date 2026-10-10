import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Trash2,
  Sliders,
  Loader2,
  Sparkles
} from 'lucide-react';

const CATEGORIES = [
  { value: 'minimalista', label: 'Minimalista' },
  { value: 'geek', label: 'Geek & Games' },
  { value: 'abstrato', label: 'Abstrato' },
  { value: 'natureza', label: 'Natureza & Botânica' },
  { value: 'frases', label: 'Tipografia & Frases' },
  { value: 'vintage', label: 'Vintage & Retrô' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'pop_art', label: 'Pop Art' },
  { value: 'anime', label: 'Anime & Mangá' },
  { value: 'psicodelico', label: 'Psicodélico' },
];

export function BulkDeleteDialog({ open, onClose, selectedDesigns, onConfirmDelete, isDeleting }) {
  const count = selectedDesigns.length;

  return (
    <Dialog open={open} onOpenChange={(val) => !isDeleting && !val && onClose()}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl border-slate-200">
        <DialogHeader className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto sm:mx-0">
            <Trash2 className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Excluir {count} {count === 1 ? 'estampa' : 'estampas'} juntas?
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Esta ação removerá permanentemente as {count} estampas selecionadas do catálogo, do banco de dados e da sua loja. Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        {/* Miniaturas das estampas selecionadas */}
        <div className="max-h-48 overflow-y-auto space-y-2 my-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
            Estampas selecionadas ({count}):
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
            {selectedDesigns.map((d) => (
              <div
                key={d.id}
                className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white aspect-square"
                title={d.title}
              >
                <img
                  src={d.image_url}
                  alt={d.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/icon.svg';
                  }}
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] text-white truncate px-1 text-center">
                  {d.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-xl border-slate-300"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirmDelete}
            disabled={isDeleting}
            className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Sim, excluir {count} {count === 1 ? 'estampa' : 'estampas'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function BulkEditDialog({ open, onClose, selectedDesigns, onConfirmEdit, isUpdating }) {
  const count = selectedDesigns.length;

  const [status, setStatus] = useState('KEEP'); // KEEP, aprovado, pendente, rascunho, rejeitado
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('KEEP');
  const [addTag, setAddTag] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const patchData = {};
    if (status !== 'KEEP') {
      patchData.status = status;
      if (status === 'aprovado') {
        patchData.published_date = new Date().toISOString();
      }
    }
    if (price.trim()) {
      const numPrice = parseFloat(price.replace(',', '.'));
      if (!isNaN(numPrice) && numPrice > 0) {
        patchData.price_base = numPrice;
      }
    }
    if (category !== 'KEEP') {
      patchData.category = category;
    }
    if (addTag.trim()) {
      patchData._addTag = addTag.trim();
    }

    onConfirmEdit(patchData);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isUpdating && !val && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white rounded-2xl border-slate-200">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto sm:mx-0">
            <Sliders className="w-6 h-6" />
          </div>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Editar {count} {count === 1 ? 'estampa' : 'estampas'} em lote
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Selecione apenas os campos que deseja alterar em todas as {count} estampas selecionadas ao mesmo tempo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          {/* Status em lote */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Alterar Status</Label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="KEEP">-- Manter status atual de cada uma --</option>
              <option value="aprovado">✓ Aprovado & Publicado na Loja</option>
              <option value="pendente">⏳ Em Análise / Curadoria</option>
              <option value="rascunho">📝 Rascunho</option>
              <option value="rejeitado">✕ Rejeitado</option>
            </select>
          </div>

          {/* Preço em lote */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Alterar Preço Base (R$)</Label>
            <Input
              type="text"
              placeholder="Ex: 49.90 (deixe vazio para manter atual)"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="h-10 rounded-xl border-slate-300"
            />
            <p className="text-[11px] text-slate-500">
              Deixe em branco se não quiser alterar o preço das estampas.
            </p>
          </div>

          {/* Categoria em lote */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Alterar Categoria</Label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="KEEP">-- Manter categorias atuais --</option>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          {/* Adicionar Tag */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Adicionar Tag em Lote</Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Ex: colecao-verao, destaque, startup"
                value={addTag}
                onChange={(e) => setAddTag(e.target.value)}
                className="h-10 rounded-xl border-slate-300"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Esta tag será adicionada a todas as estampas selecionadas sem apagar as existentes.
            </p>
          </div>

          {/* Mini preview */}
          <div className="pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              Aplicando alterações em: <span className="font-bold text-purple-700">{count} estampas</span>
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isUpdating}
              className="rounded-xl border-slate-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || (status === 'KEEP' && !price.trim() && category === 'KEEP' && !addTag.trim())}
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando alterações...
                </>
              ) : (
                <>
                  <Sliders className="w-4 h-4 mr-2" />
                  Salvar Alterações nas {count} Estampas
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SingleEditDialogForm({ open, onClose, design, onSave, isSaving }) {
  const [title, setTitle] = useState(design.title || '');
  const [description, setDescription] = useState(design.description || '');
  const [price, setPrice] = useState(String(design.price_base || 49.9));
  const [category, setCategory] = useState(design.category || 'minimalista');
  const [status, setStatus] = useState(design.status || 'aprovado');
  const [artistName, setArtistName] = useState(design.artist_name || design.created_by || '');
  const [tags, setTags] = useState(Array.isArray(design.tags) ? design.tags.join(', ') : (design.tags || ''));

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      title: title.trim(),
      description: description.trim(),
      price_base: parseFloat(price.replace(',', '.')) || 49.9,
      category,
      status,
      artist_name: artistName.trim(),
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    if (status === 'aprovado' && !design.published_date) {
      updated.published_date = new Date().toISOString();
    }
    onSave(design.id, updated);
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isSaving && !val && onClose()}>
      <DialogContent className="sm:max-w-lg bg-white rounded-2xl border-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Editar Estampa
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Edite as informações desta estampa diretamente no catálogo.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          <div className="flex gap-4 items-center p-3 bg-slate-50 rounded-xl border border-slate-200">
            <img
              src={design.image_url}
              alt={design.title}
              className="w-16 h-16 rounded-lg object-contain bg-white border border-slate-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/icon.svg';
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase">ID da Estampa</p>
              <p className="text-xs font-mono text-slate-700 truncate">{design.id}</p>
              <div className="flex gap-2 mt-1">
                <Badge variant="outline" className="text-[10px] capitalize">
                  {status}
                </Badge>
                {design.is_ai_generated && (
                  <Badge className="bg-purple-100 text-purple-700 text-[10px]">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Gerada com IA
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Título da Estampa</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da estampa"
              className="h-10 rounded-xl border-slate-300"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Preço Base (R$)</Label>
              <Input
                type="text"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="h-10 rounded-xl border-slate-300"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Status</Label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="aprovado">Aprovado (Na Loja)</option>
                <option value="pendente">Em Análise</option>
                <option value="rascunho">Rascunho</option>
                <option value="rejeitado">Rejeitado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Categoria</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Artista / Autor</Label>
              <Input
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                placeholder="Nome do artista"
                className="h-10 rounded-xl border-slate-300"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Tags (separadas por vírgula)</Label>
            <Input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="ex: arte, geek, verao, minimalista"
              className="h-10 rounded-xl border-slate-300"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Descrição</Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Descrição da arte..."
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border-slate-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar Alterações'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SingleEditDialog({ open, onClose, design, onSave, isSaving }) {
  if (!design || !open) return null;
  return (
    <SingleEditDialogForm
      open={open}
      onClose={onClose}
      design={design}
      onSave={onSave}
      isSaving={isSaving}
    />
  );
}
