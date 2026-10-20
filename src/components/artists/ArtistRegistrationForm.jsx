import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import PortfolioUpload from '@/components/artists/PortfolioUpload';
import {
  Store,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Palette,
  Coins,
  ShieldCheck,
  Globe,
  Instagram,
  Phone
} from 'lucide-react';
import { createPageUrl } from '@/utils';
import { PIX_KEY_TYPES, validatePixKey } from '@/components/financial/PixKeyConfigForm';

const initial = {
  store_name: '',
  store_slug: '',
  name: '',
  email: '',
  phone: '',
  bio: '',
  instagram: '',
  website: '',
  pix_key: '',
  pix_key_type: 'email',
  portfolio_files: []
};

export default function ArtistRegistrationForm() {
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [createdSlug, setCreatedSlug] = useState('');
  const [error, setError] = useState('');

  const field = (key, value) => {
    setForm((current) => {
      const next = { ...current, [key]: value };
      // Se alterou o nome da loja e o slug ainda não foi editado manualmente
      if (key === 'store_name' && (!current.store_slug || current.store_slug === slugify(current.store_name))) {
        next.store_slug = slugify(value);
      }
      return next;
    });
  };

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

  const submit = async (e) => {
    e.preventDefault();
    const pixCheck = validatePixKey(form.pix_key_type || 'email', form.pix_key);
    if (!pixCheck.isValid) {
      setError(`Chave Pix inválida: ${pixCheck.error}`);
      return;
    }
    setSaving(true);
    setError('');

    const finalSlug = form.store_slug || slugify(form.store_name || form.name);

    try {
      // 1. Salvar solicitação / cadastro de artista
      await base44.entities.ArtistApplication.create({
        ...form,
        store_slug: finalSlug,
        status: 'aprovado',
        applied_at: new Date().toISOString()
      });

      // 2. Tentar vincular ao usuário autenticado atual caso exista
      try {
        const currentUser = await base44.auth.me();
        if (currentUser?.id) {
          await base44.entities.User.update(currentUser.id, {
            store_name: form.store_name || form.name,
            store_slug: finalSlug,
            artist_name: form.name,
            bio: form.bio,
            instagram: form.instagram,
            pix_key: form.pix_key,
            is_artist: true,
            is_verified_artist: true
          });
        }
      } catch (userErr) {
        console.warn('Usuário anônimo ou não autenticado no momento:', userErr);
      }

      setCreatedSlug(finalSlug);
      setDone(true);
      setForm(initial);
    } catch (err) {
      setError(err.message || 'Não foi possível concluir a criação da sua loja. Verifique os dados.');
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 text-center shadow-xl space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Loja Criada com Sucesso!
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-ceu-navy tracking-tight">
            Parabéns! Sua loja agora existe na Céu Criativa.
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-sm text-slate-600 leading-relaxed">
            Seu endereço exclusivo já está configurado. O próximo passo é publicar suas primeiras estampas para os clientes comprarem.
          </p>
        </div>

        {/* Card do link da loja */}
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-left">
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Link oficial da sua loja:
            </span>
            <span className="text-sm font-black text-ceu-navy truncate block">
              ceu-criativa.com/loja/{createdSlug}
            </span>
          </div>
          <Link
            to={`/loja/${createdSlug}`}
            className="shrink-0 text-xs font-bold text-ceu-navy hover:underline px-3 py-1.5 bg-white border border-slate-300 rounded-xl shadow-sm"
          >
            Ver Loja
          </Link>
        </div>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to={createPageUrl('Create')}
            className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-ceu-navy hover:bg-slate-800 text-white font-bold text-sm inline-flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Palette className="w-4 h-4 text-ceu-sun" />
            Criar Estampas no Studio
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to={`/loja/${createdSlug}`}
            className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-ceu-sun hover:brightness-105 text-ceu-navy font-bold text-sm inline-flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <Store className="w-4 h-4" />
            Acessar Minha Vitrine
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10 text-slate-900">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold" role="alert">
          {error}
        </div>
      )}

      {/* BLOCO 1: IDENTIDADE DA SUA LOJA */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-7 h-7 rounded-xl bg-ceu-sun text-ceu-navy flex items-center justify-center font-black text-xs">
            1
          </div>
          <h3 className="text-base font-black text-ceu-navy tracking-tight">
            Identidade da Sua Loja
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              Nome da Loja *
            </label>
            <Input
              required
              placeholder="Ex: Urban Waves Studio"
              value={form.store_name}
              onChange={(e) => field('store_name', e.target.value)}
              className="rounded-xl h-12 border-slate-300 font-semibold"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              Endereço / Link da Loja na Céu *
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-xs font-semibold text-slate-400 select-none">
                ceu-criativa.com/loja/
              </span>
              <Input
                required
                placeholder="nomedasualoja"
                value={form.store_slug}
                onChange={(e) => field('store_slug', slugify(e.target.value))}
                className="rounded-xl h-12 border-slate-300 pl-41 font-mono text-xs font-bold text-ceu-navy"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-700 mb-1 block">
            Bio da Loja & Conceito Artístico *
          </label>
          <Textarea
            required
            rows={3}
            placeholder="Conte aos clientes sobre seu estilo, inspirações e o que torna suas estampas únicas..."
            value={form.bio}
            onChange={(e) => field('bio', e.target.value)}
            className="rounded-xl border-slate-300 text-sm"
          />
        </div>
      </div>

      {/* BLOCO 2: DADOS DO ARTISTA / CRIADOR */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-7 h-7 rounded-xl bg-ceu-aqua text-ceu-navy flex items-center justify-center font-black text-xs">
            2
          </div>
          <h3 className="text-base font-black text-ceu-navy tracking-tight">
            Dados do Artista & Contato
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              Seu Nome Completo ou Artístico *
            </label>
            <Input
              required
              placeholder="Ex: Felipe Silvério"
              value={form.name}
              onChange={(e) => field('name', e.target.value)}
              className="rounded-xl h-12 border-slate-300"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block">
              E-mail para Acesso e Vendas *
            </label>
            <Input
              required
              type="email"
              placeholder="seuemail@exemplo.com"
              value={form.email}
              onChange={(e) => field('email', e.target.value)}
              className="rounded-xl h-12 border-slate-300"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              WhatsApp de Contato *
            </label>
            <Input
              required
              placeholder="(11) 98765-4321"
              value={form.phone}
              onChange={(e) => field('phone', e.target.value)}
              className="rounded-xl h-12 border-slate-300"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block flex items-center gap-1">
              <Instagram className="w-3.5 h-3.5 text-slate-400" />
              Instagram (@perfil)
            </label>
            <Input
              placeholder="@seu.perfil"
              value={form.instagram}
              onChange={(e) => field('instagram', e.target.value)}
              className="rounded-xl h-12 border-slate-300"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 mb-1 block flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              Portfólio / Behance
            </label>
            <Input
              type="url"
              placeholder="https://behance.net/..."
              value={form.website}
              onChange={(e) => field('website', e.target.value)}
              className="rounded-xl h-12 border-slate-300 text-xs"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 mb-1.5 block flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              Tipo da Chave PIX (para receber repasses da Atma) *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
              {PIX_KEY_TYPES.map((t) => {
                const Icon = t.icon;
                const isSel = (form.pix_key_type || 'email') === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => field('pix_key_type', t.id)}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSel 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-sm' 
                        : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isSel ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Chave PIX ({PIX_KEY_TYPES.find(t => t.id === (form.pix_key_type || 'email'))?.label}) *
              </label>
              {form.pix_key && (
                <span className={`text-[10px] font-bold ${
                  validatePixKey(form.pix_key_type || 'email', form.pix_key).isValid 
                    ? 'text-emerald-600' 
                    : 'text-amber-600'
                }`}>
                  {validatePixKey(form.pix_key_type || 'email', form.pix_key).isValid ? '✓ Formato Válido' : '⚠️ Formato Pendente'}
                </span>
              )}
            </div>
            <Input
              required
              placeholder={PIX_KEY_TYPES.find(t => t.id === (form.pix_key_type || 'email'))?.placeholder}
              value={form.pix_key}
              onChange={(e) => field('pix_key', e.target.value)}
              className="rounded-xl h-12 border-slate-300 font-mono text-sm"
            />
            {form.pix_key && !validatePixKey(form.pix_key_type || 'email', form.pix_key).isValid && (
              <p className="text-[11px] text-amber-700 mt-1 font-medium">
                {validatePixKey(form.pix_key_type || 'email', form.pix_key).error}
              </p>
            )}
            <p className="text-[11px] text-slate-500 mt-1">
              A plataforma Atma recebe os pagamentos no checkout e transfere as suas comissões de venda diretamente para esta chave Pix.
            </p>
          </div>
        </div>
      </div>

      {/* BLOCO 3: AMOSTRAS / ARTES DE ESTREIA */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <div className="w-7 h-7 rounded-xl bg-ceu-sky text-ceu-navy flex items-center justify-center font-black text-xs">
            3
          </div>
          <h3 className="text-base font-black text-ceu-navy tracking-tight">
            Artes de Estreia da sua Loja (Opcional)
          </h3>
        </div>

        <p className="text-xs text-slate-600">
          Envie até 5 artes ou estampas autorais que você gostaria de estampar na sua vitrine inicial.
        </p>

        <PortfolioUpload
          value={form.portfolio_files}
          onChange={(files) => field('portfolio_files', files)}
        />
      </div>

      {/* SUBMIT BUTTON */}
      <div className="pt-4">
        <Button
          type="submit"
          disabled={saving}
          className="h-14 w-full rounded-2xl bg-ceu-navy hover:bg-slate-800 text-white font-black text-base shadow-xl shadow-ceu-navy/20 gap-2 cursor-pointer"
        >
          <Store className="w-5 h-5 text-ceu-sun" />
          {saving ? 'Criando sua loja na Céu...' : 'Criar Minha Loja e Começar a Vender'}
        </Button>

        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Zero custo fixo ou mensalidade
          </span>
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-ceu-aqua" />
            A Céu cuida de estoque, produção e frete
          </span>
        </div>
      </div>
    </form>
  );
}
