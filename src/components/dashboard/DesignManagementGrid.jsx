import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { MoreVertical, Pencil, Archive, Trash2, Eye, Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const statusColors = {
  aprovado: 'bg-emerald-100 text-emerald-700',
  pendente: 'bg-amber-100 text-amber-700',
  rascunho: 'bg-gray-100 text-gray-600',
  rejeitado: 'bg-red-100 text-red-700'
};

const statusLabels = {
  aprovado: 'Aprovado',
  pendente: 'Pendente',
  rascunho: 'Rascunho',
  rejeitado: 'Rejeitado'
};

export default function DesignManagementGrid({ designs, likes, userId }) {
  const queryClient = useQueryClient();
  const [editingDesign, setEditingDesign] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const likeMap = {};
  likes.forEach(l => { likeMap[l.design_id] = (likeMap[l.design_id] || 0) + 1; });

  const handleEdit = (design) => {
    setEditingDesign(design);
    setEditForm({ title: design.title, description: design.description || '', tags: (design.tags || []).join(', ') });
  };

  const saveEdit = async () => {
    setLoading(true);
    await base44.entities.Design.update(editingDesign.id, {
      title: editForm.title,
      description: editForm.description,
      tags: editForm.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    queryClient.invalidateQueries({ queryKey: ['artist-designs', userId] });
    toast.success('Design atualizado!');
    setEditingDesign(null);
    setLoading(false);
  };

  const handleArchive = async (design) => {
    await base44.entities.Design.update(design.id, { status: 'rascunho' });
    queryClient.invalidateQueries({ queryKey: ['artist-designs', userId] });
    toast.success('Design arquivado.');
  };

  const handleDelete = async () => {
    setLoading(true);
    await base44.entities.Design.delete(deletingId);
    queryClient.invalidateQueries({ queryKey: ['artist-designs', userId] });
    toast.success('Design excluído.');
    setDeletingId(null);
    setLoading(false);
  };

  if (designs.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <Eye className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-medium">Nenhum design criado ainda</p>
        <p className="text-sm mt-1">Crie sua primeira estampa na página Criar</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {designs.map((design, i) => (
          <motion.div
            key={design.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="rounded-2xl border-0 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
              <div className="relative aspect-square bg-gray-50 overflow-hidden">
                <img
                  src={design.image_url}
                  alt={design.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2">
                  <Badge className={`text-xs px-2 py-0.5 rounded-full border-0 ${statusColors[design.status]}`}>
                    {statusLabels[design.status]}
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow hover:bg-white transition-colors">
                        <MoreVertical className="w-4 h-4 text-gray-600" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl shadow-xl">
                      <DropdownMenuItem asChild>
                        <Link to={createPageUrl(`DesignDetail?id=${design.id}`)} className="flex items-center gap-2">
                          <Eye className="w-4 h-4" /> Ver Design
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(design)} className="flex items-center gap-2">
                        <Pencil className="w-4 h-4" /> Editar Detalhes
                      </DropdownMenuItem>
                      {design.status !== 'rascunho' && (
                        <DropdownMenuItem onClick={() => handleArchive(design)} className="flex items-center gap-2">
                          <Archive className="w-4 h-4" /> Arquivar
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeletingId(design.id)}
                        className="flex items-center gap-2 text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardContent className="p-3">
                <p className="font-semibold text-gray-900 text-sm truncate">{design.title}</p>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Heart className="w-3 h-3 text-rose-400" />
                    {likeMap[design.id] || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-emerald-500" />
                    {design.sales_count || 0}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingDesign} onOpenChange={() => setEditingDesign(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Design</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Título</label>
              <Input
                value={editForm.title || ''}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Descrição</label>
              <Textarea
                value={editForm.description || ''}
                onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                className="rounded-xl"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Tags (separadas por vírgula)</label>
              <Input
                value={editForm.tags || ''}
                onChange={e => setEditForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="natureza, minimalista, colorido"
                className="rounded-xl"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setEditingDesign(null)}>Cancelar</Button>
            <Button className="rounded-xl bg-gray-900 hover:bg-gray-800" onClick={saveEdit} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir design?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">Esta ação não pode ser desfeita. O design será permanentemente excluído.</p>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setDeletingId(null)}>Cancelar</Button>
            <Button className="rounded-xl bg-red-600 hover:bg-red-700 text-white" onClick={handleDelete} disabled={loading}>
              {loading ? 'Excluindo...' : 'Excluir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}