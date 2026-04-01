import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, FolderOpen, Pencil, Trash2, Globe, Lock, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function CollectionsManager({ designs, user }) {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', is_public: false, design_ids: [] });
  const [loading, setLoading] = useState(false);

  const { data: collections = [] } = useQuery({
    queryKey: ['artist-collections', user?.id],
    queryFn: () => base44.entities.Collection.filter({ artist_id: user.id }),
    enabled: !!user?.id
  });

  const openCreate = () => {
    setForm({ title: '', description: '', is_public: false, design_ids: [] });
    setCreateOpen(true);
    setEditTarget(null);
  };

  const openEdit = (col) => {
    setForm({
      title: col.title,
      description: col.description || '',
      is_public: col.is_public || false,
      design_ids: col.design_ids || []
    });
    setEditTarget(col);
    setCreateOpen(true);
  };

  const toggleDesign = (id) => {
    setForm(f => ({
      ...f,
      design_ids: f.design_ids.includes(id)
        ? f.design_ids.filter(d => d !== id)
        : [...f.design_ids, id]
    }));
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error('Dê um nome para a coleção'); return; }
    setLoading(true);
    const payload = { ...form, artist_id: user.id, artist_name: user.full_name };
    if (editTarget) {
      await base44.entities.Collection.update(editTarget.id, payload);
      toast.success('Coleção atualizada!');
    } else {
      await base44.entities.Collection.create(payload);
      toast.success('Coleção criada!');
    }
    queryClient.invalidateQueries({ queryKey: ['artist-collections', user?.id] });
    setCreateOpen(false);
    setLoading(false);
  };

  const deleteCollection = async (id) => {
    await base44.entities.Collection.delete(id);
    queryClient.invalidateQueries({ queryKey: ['artist-collections', user?.id] });
    toast.success('Coleção excluída.');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-bold text-gray-900">Minhas Coleções</h3>
          <p className="text-sm text-gray-500 mt-0.5">Agrupe seus designs em kits temáticos</p>
        </div>
        <Button onClick={openCreate} className="rounded-xl bg-gray-900 hover:bg-gray-800 gap-2 text-sm">
          <Plus className="w-4 h-4" /> Nova Coleção
        </Button>
      </div>

      {collections.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium text-gray-500">Nenhuma coleção criada</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Organize seus designs em kits temáticos</p>
          <Button onClick={openCreate} className="rounded-xl bg-gray-900 hover:bg-gray-800 gap-2 text-sm">
            <Plus className="w-4 h-4" /> Criar Primeira Coleção
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {collections.map((col, i) => {
            const colDesigns = designs.filter(d => (col.design_ids || []).includes(d.id));
            return (
              <motion.div
                key={col.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Card className="rounded-2xl border-0 shadow-sm hover:shadow-md transition-all overflow-hidden">
                  {/* Cover strip */}
                  <div className="h-20 bg-gradient-to-r from-gray-100 to-gray-50 flex overflow-hidden">
                    {colDesigns.slice(0, 4).map((d, j) => (
                      <img
                        key={d.id}
                        src={d.image_url}
                        alt={d.title}
                        className="flex-1 object-cover min-w-0"
                      />
                    ))}
                    {colDesigns.length === 0 && (
                      <div className="w-full flex items-center justify-center text-gray-300">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900 truncate">{col.title}</h4>
                          <Badge className={`text-xs rounded-full border-0 flex items-center gap-1 ${col.is_public ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                            {col.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                            {col.is_public ? 'Pública' : 'Privada'}
                          </Badge>
                        </div>
                        {col.description && <p className="text-xs text-gray-500 mt-1 truncate">{col.description}</p>}
                        <p className="text-xs text-gray-400 mt-1">{colDesigns.length} design(s)</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => openEdit(col)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                          <Pencil className="w-3.5 h-3.5 text-gray-500" />
                        </button>
                        <button onClick={() => deleteCollection(col.id)} className="w-8 h-8 rounded-full hover:bg-red-50 flex items-center justify-center transition-colors">
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editTarget ? 'Editar Coleção' : 'Nova Coleção'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Nome da coleção *</label>
              <Input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Verão Tropical, Minimalismo, etc."
                className="rounded-xl"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">Descrição</label>
              <Textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descreva o tema desta coleção..."
                className="rounded-xl"
                rows={2}
              />
            </div>
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="text-sm font-medium text-gray-700">Coleção pública</p>
                <p className="text-xs text-gray-500">Visível para todos os usuários</p>
              </div>
              <button
                onClick={() => setForm(f => ({ ...f, is_public: !f.is_public }))}
                className={`w-12 h-6 rounded-full transition-colors relative ${form.is_public ? 'bg-emerald-500' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_public ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">Selecione os designs</label>
              {designs.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-4">Nenhum design disponível</p>
              ) : (
                <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto pr-1">
                  {designs.map(d => (
                    <button
                      key={d.id}
                      onClick={() => toggleDesign(d.id)}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                        form.design_ids.includes(d.id) ? 'border-gray-900 scale-95' : 'border-transparent'
                      }`}
                    >
                      <img src={d.image_url} alt={d.title} className="w-full h-full object-cover" />
                      {form.design_ids.includes(d.id) && (
                        <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
                          <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                            <span className="text-gray-900 text-xs font-bold">✓</span>
                          </div>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">{form.design_ids.length} design(s) selecionado(s)</p>
            </div>
          </div>
          <DialogFooter className="gap-2 pt-2">
            <Button variant="outline" className="rounded-xl" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button className="rounded-xl bg-gray-900 hover:bg-gray-800" onClick={save} disabled={loading}>
              {loading ? 'Salvando...' : editTarget ? 'Salvar' : 'Criar Coleção'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}