import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';
import {
  Store,
  Sparkles,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ShoppingBag
} from 'lucide-react';

export default function ArtistRegistrationModal({
  isOpen,
  onClose,
  onSuccess,
  currentUser,
  onProceedToPurchase,
  productPrice
}) {
  const [formData, setFormData] = useState({
    artist_name: '',
    store_name: '',
    store_slug: '',
    cpf: '',
    phone: '',
    pix_key: '',
    bio: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [stepSuccess, setStepSuccess] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFormData(prev => ({
        ...prev,
        artist_name: currentUser.artist_name || currentUser.full_name || '',
        store_name: currentUser.store_name || '',
        store_slug: currentUser.store_slug || '',
        cpf: currentUser.cpf || '',
        phone: currentUser.phone || '',
        pix_key: currentUser.pix_key || '',
        bio: currentUser.bio || ''
      }));
    }
  }, [currentUser]);

  const slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
      .slice(0, 30);
  };

  const handleStoreNameChange = (val) => {
    setFormData(prev => ({
      ...prev,
      store_name: val,
      store_slug: slugify(val)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.artist_name.trim()) {
      setError('Por favor, informe seu Nome Artístico ou Nome Completo.');
      return;
    }
    if (!formData.store_name.trim()) {
      setError('Por favor, informe o Nome da sua Lojinha.');
      return;
    }
    if (!formData.cpf.trim() || formData.cpf.replace(/\D/g, '').length < 11) {
      setError('Por favor, informe um CPF válido para cadastro e faturamento.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.replace(/\D/g, '').length < 10) {
      setError('Por favor, informe um número de WhatsApp/Telefone para contato.');
      return;
    }
    if (!formData.pix_key.trim()) {
      setError('Por favor, informe uma Chave PIX para receber suas comissões.');
      return;
    }

    setSaving(true);
    try {
      const finalSlug = formData.store_slug || slugify(formData.store_name);

      // Atualiza usuário atual
      const updatedUser = {
        artist_name: formData.artist_name.trim(),
        full_name: formData.artist_name.trim(),
        store_name: formData.store_name.trim(),
        store_slug: finalSlug,
        cpf: formData.cpf.trim(),
        phone: formData.phone.trim(),
        pix_key: formData.pix_key.trim(),
        bio: formData.bio.trim(),
        is_artist: true,
        is_verified_artist: true,
        app_role: 'artist'
      };

      if (currentUser?.id) {
        await base44.entities.User.update(currentUser.id, updatedUser);
        try {
          await base44.auth.updateMe(updatedUser);
        } catch {
          // ignore
        }
      }

      // Cria ou atualiza solicitação de artista para registro
      await base44.entities.ArtistApplication.create({
        name: formData.artist_name.trim(),
        store_name: formData.store_name.trim(),
        store_slug: finalSlug,
        cpf: formData.cpf.trim(),
        phone: formData.phone.trim(),
        pix_key: formData.pix_key.trim(),
        bio: formData.bio.trim(),
        status: 'aprovado',
        applied_at: new Date().toISOString()
      });

      setStepSuccess(true);
      onSuccess?.(updatedUser);
    } catch (err) {
      setError(err.message || 'Erro ao salvar cadastro. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl p-6 sm:p-8 bg-card border border-border shadow-2xl">
        <DialogHeader className="text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            Comunidade de Artistas SEL
          </div>
          <DialogTitle className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
            Finalize seu Cadastro de Artista
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-600">
            Para publicar sua estampa na Galeria pública e receber comissões pelas vendas, complete suas informações de criador.
          </DialogDescription>
        </DialogHeader>

        {/* Banner com a Regra Oficial da SEL */}
        <div className="my-3 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 border border-purple-200/80 space-y-2 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
            <Store className="w-4 h-4 text-purple-600 shrink-0" />
            Regra da SEL para Artistas e Lojinhas:
          </div>
          <p className="text-slate-700 leading-relaxed">
            Para ativar sua <strong>Lojinha Oficial</strong> e liberar suas estampas na galeria pública, você conclui este cadastro e <strong>adquire sua primeira estampa</strong> para conferir em mãos a qualidade premium do produto.
          </p>
          <p className="text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/60">
            ✨ Vantagem exclusiva: Feita a 1ª compra, você nunca mais precisará comprar as próximas estampas que gerar! Todas entram direto para venda e você lucra com cada pedido.
          </p>
        </div>

        {stepSuccess ? (
          <div className="py-6 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Cadastro Concluído! 🎉</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
                Sua conta de artista foi registrada. Agora, complete a compra da sua primeira estampa para ativar sua lojinha pública e colocar sua arte na galeria!
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between font-bold text-slate-900">
                <span>Nome da Loja:</span>
                <span>{formData.store_name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Endereço da Loja:</span>
                <span className="text-purple-600 font-mono">ceucriativa.art/{formData.store_slug}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Comissão por Venda:</span>
                <span className="font-bold text-emerald-600">25% (Pix direto)</span>
              </div>
            </div>

            <Button
              onClick={() => {
                onClose();
                onProceedToPurchase?.();
              }}
              className="w-full h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-xl shadow-emerald-600/20"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Comprar Minha 1ª Estampa {productPrice ? `(R$ ${Number(productPrice).toFixed(2)})` : ''} & Ativar Loja
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4 pt-1">
            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nome Artístico / Completo *
                </Label>
                <Input
                  placeholder="Ex: Pedro Oliveira ou Estúdio Neon"
                  value={formData.artist_name}
                  onChange={(e) => setFormData({ ...formData, artist_name: e.target.value })}
                  className="mt-1 h-11 rounded-xl bg-white border-slate-300"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nome da sua Lojinha *
                </Label>
                <Input
                  placeholder="Ex: Pedro Oliveira Linhas"
                  value={formData.store_name}
                  onChange={(e) => handleStoreNameChange(e.target.value)}
                  className="mt-1 h-11 rounded-xl bg-white border-slate-300"
                  required
                />
                {formData.store_slug && (
                  <span className="text-[11px] text-purple-600 font-mono mt-1 block">
                    Link da sua loja: ceucriativa.art/{formData.store_slug}
                  </span>
                )}
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  CPF *
                </Label>
                <Input
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  className="mt-1 h-11 rounded-xl bg-white border-slate-300"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  WhatsApp / Celular *
                </Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 h-11 rounded-xl bg-white border-slate-300"
                  required
                />
              </div>

              <div>
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Chave PIX (para comissões) *
                </Label>
                <Input
                  placeholder="CPF, e-mail ou chave aleatória"
                  value={formData.pix_key}
                  onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
                  className="mt-1 h-11 rounded-xl bg-white border-slate-300"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Breve Bio do Artista (Opcional)
              </Label>
              <Textarea
                placeholder="Conte um pouco sobre sua arte, inspirações e estilo..."
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                className="mt-1 rounded-xl bg-white border-slate-300 min-h-[70px] text-xs"
              />
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
                className="w-full sm:w-auto rounded-xl border-slate-300 text-xs font-bold h-11 px-5"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold h-11 px-6 shadow-md shadow-purple-600/20"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando Cadastro...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Salvar Cadastro de Artista
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
