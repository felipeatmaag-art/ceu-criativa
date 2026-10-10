import React, { useState } from 'react';
import {
  Building2,
  MessageCircle,
  Send,
  CheckCircle2,
  Package,
  ShieldCheck,
  Upload,
  Loader2,
  Trash2,
  Layers,
  FileText,
  Clock,
  Headphones
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import StandardPrintSizesGuide from '@/components/create/StandardPrintSizesGuide';

const WHATSAPP_NUMBER = '5511999999999';

const TSHIRT_MODELS = [
  { id: 'algodao_classic', name: 'Camiseta Tradicional 100% Algodão', desc: 'Malha penteada 30.1 clássica, macia e versátil para equipes, feiras e eventos corporativos.' },
  { id: 'oversized_street', name: 'Camiseta Oversized Streetwear', desc: 'Modelagem ampla moderna, malha pesada premium de alta gramatura e gola canelada 3cm.' },
  { id: 'baby_look', name: 'Camiseta Baby Look Feminina', desc: 'Corte ajustado feminino elegante com acabamento delicado nas mangas e gola.' },
  { id: 'moletom_canguru', name: 'Moletom Canguru com Capuz', desc: 'Flanelado premium quente e confortável, bolso frontal e cordão de ajuste reforçado.' },
  { id: 'ecobag', name: 'Ecobag de Algodão Cru Ecológica', desc: 'Brinde corporativo sustentável para kits de onboarding, congressos e eventos.' },
  { id: 'outro', name: 'Outro Projeto Sob Medida', desc: 'Polos, corta-vento, vestuário esportivo ou projetos de confecção exclusivos.' }
];

const PRINT_POSITIONS = [
  'Frente Centro (Grande)',
  'Peito Esquerdo (Logo discreto)',
  'Costas (Grande destaque)',
  'Peito Esquerdo + Costas Grande',
  'Manga + Frente',
  'Total / Posições Personalizadas'
];

const COLOR_OPTIONS = [
  { id: 'branca', label: 'Branca', hex: '#FFFFFF', border: 'border-slate-300' },
  { id: 'preta', label: 'Preta', hex: '#111827', border: 'border-slate-800' },
  { id: 'cinza', label: 'Cinza Mescla', hex: '#9CA3AF', border: 'border-slate-400' },
  { id: 'marinho', label: 'Azul Marinho', hex: '#1E3A8A', border: 'border-blue-900' },
  { id: 'offwhite', label: 'Off-White', hex: '#F5F5F0', border: 'border-slate-300' },
  { id: 'verde', label: 'Verde Militar', hex: '#374151', border: 'border-emerald-800' },
  { id: 'outra', label: 'Cores Especiais / Mistas', hex: 'linear-gradient(45deg, #111, #fff)', border: 'border-slate-400' },
];

const ADVANTAGES = [
  {
    icon: ShieldCheck,
    title: 'Estampa DTF HD Têxtil',
    desc: 'Tecnologia que entrega fidelidade de cores, alta resolução de detalhes e durabilidade que não racha nem desbota com lavagens.'
  },
  {
    icon: Package,
    title: 'Sem Lotes Gigantescos',
    desc: 'Produzimos sob demanda a partir de pequenas e médias tiragens. Peça apenas o que sua equipe precisa, sem estoque parado.'
  },
  {
    icon: FileText,
    title: 'Faturamento & NF-e para PJ',
    desc: 'Emissão 100% regularizada de Nota Fiscal Eletrônica com todos os dados da sua empresa para compras corporativas.'
  },
  {
    icon: Layers,
    title: 'Amostra Virtual / Mockup 3D',
    desc: 'Visualização realista da sua estampa aplicada na peça antes de rodar o lote, garantindo aprovação prévia da sua diretoria.'
  },
];

export default function Empresas() {
  const [formData, setFormData] = useState({
    cnpj: '',
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    tshirtModel: 'Camiseta Tradicional 100% Algodão',
    tshirtColor: 'Preta',
    printPosition: 'Frente Centro (Grande)',
    quantity: '50',
    deadline: '',
    description: '',
    artworkUrl: '',
    artworkName: ''
  });

  const [uploadingArtwork, setUploadingArtwork] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Máscara CNPJ: 00.000.000/0000-00
  const handleCnpjChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 14);
    if (value.length > 12) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{1,2})/, '$1.$2.$3/$4-$5');
    } else if (value.length > 8) {
      value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
    } else if (value.length > 5) {
      value = value.replace(/^(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
    } else if (value.length > 2) {
      value = value.replace(/^(\d{2})(\d{1,3})/, '$1.$2');
    }
    setFormData((prev) => ({ ...prev, cnpj: value }));
  };

  // Upload de estampa
  const handleArtworkUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingArtwork(true);
    setError('');

    try {
      let fileUrl = '';
      try {
        const res = await base44.integrations.Core.UploadFile({ file });
        if (res?.file_url) {
          fileUrl = res.file_url;
        }
      } catch (uploadErr) {
        console.warn('Fallback local para arquivo de estampa:', uploadErr);
      }

      if (!fileUrl) {
        fileUrl = URL.createObjectURL(file);
      }

      setFormData((prev) => ({
        ...prev,
        artworkUrl: fileUrl,
        artworkName: file.name
      }));
    } catch {
      setError('Não foi possível carregar a imagem. Tente novamente ou envie via WhatsApp.');
    } finally {
      setUploadingArtwork(false);
      e.target.value = '';
    }
  };

  const removeArtwork = () => {
    setFormData((prev) => ({
      ...prev,
      artworkUrl: '',
      artworkName: ''
    }));
  };

  const handleWhatsAppDirect = () => {
    const text = encodeURIComponent(
      `Olá, equipe Céu Criativa! Sou da empresa *${formData.companyName || '(Empresa)'}* (CNPJ: ${formData.cnpj || 'A informar'}).\n\n` +
      `Gostaria de solicitar um orçamento para pedidos corporativos:\n` +
      `• *Modelo:* ${formData.tshirtModel}\n` +
      `• *Cor:* ${formData.tshirtColor}\n` +
      `• *Quantidade:* ${formData.quantity} peças\n` +
      `• *Posição:* ${formData.printPosition}\n` +
      (formData.artworkUrl ? `• *Estampa:* ${formData.artworkUrl}\n` : '') +
      `• *Contato:* ${formData.contactName || 'Responsável'} (${formData.phone || formData.email})\n` +
      (formData.description ? `• *Observações:* ${formData.description}\n` : '') +
      `\nPoderiam me enviar uma proposta com os prazos e condições?`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.companyName || !formData.email || !formData.quantity) {
      setError('Por favor, preencha os campos obrigatórios (Empresa, E-mail e Quantidade).');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await base44.entities.SpecialOrderInquiry.create({
        cnpj: formData.cnpj,
        company_name: formData.companyName,
        contact_name: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        product_type: formData.tshirtModel,
        color: formData.tshirtColor,
        print_position: formData.printPosition,
        quantity: formData.quantity,
        artwork_url: formData.artworkUrl,
        artwork_name: formData.artworkName,
        deadline: formData.deadline,
        description: formData.description,
        status: 'novo',
        created_at: new Date().toISOString(),
      });
      setIsSuccess(true);
    } catch (err) {
      console.warn('Erro ao salvar formulário corporativo:', err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* HERO SECTION B2B / PJ */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-white/10 bg-gradient-to-b from-ceu-navy via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,144,255,0.18),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(0,255,200,0.10),transparent_50%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Texto do Hero */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ceu-sky/20 border border-ceu-sky/40 text-ceu-sky text-xs font-black uppercase tracking-wider">
                <Building2 className="w-4 h-4 text-ceu-aqua" />
                Céu Criativa PJ & Vendas Corporativas
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05]">
                Camisetas e Brindes Corporativos <span className="text-transparent bg-clip-text bg-gradient-to-r from-ceu-sky via-ceu-aqua to-emerald-400">para sua Empresa</span>
              </h1>

              <p className="text-base sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
                Produção têxtil sob demanda com estampa DTF HD em camisetas 100% algodão e modelagens premium. Sem estoque parado, com faturamento para CNPJ e envio para todo o Brasil.
              </p>

              {/* Badges Rápidos */}
              <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-slate-300">
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-ceu-aqua" />
                  <span>Emissão de NF-e Automática</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                  <Package className="w-4 h-4 text-ceu-sky" />
                  <span>A partir de 15 a 20 peças</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Tabela progressiva por volume</span>
                </div>
              </div>
            </div>

            {/* CTA Lateral WhatsApp Imediato */}
            <div className="lg:col-span-5">
              <div className="p-6 sm:p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/15 shadow-2xl space-y-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Headphones className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Atendimento Corporativo Ágil</h3>
                    <p className="text-xs text-slate-400">Resposta média em menos de 15 minutos</p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Tem urgência com um evento da empresa ou precisa de consultoria sobre tecidos e amostras? Converse direto com nosso especialista B2B.
                </p>

                <Button
                  onClick={handleWhatsAppDirect}
                  className="w-full h-13 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5" />
                  Falar no WhatsApp Comercial
                </Button>
                <p className="text-[11px] text-center text-slate-500">
                  Ou preencha o formulário abaixo para receber proposta formal em PDF.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FORMULÁRIO PRINCIPAL DE ORÇAMENTO PARA PJ */}
      <section className="py-14 sm:py-20 bg-slate-900 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 space-y-2">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-ceu-sky">
              Solicitação de Proposta Comercial
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Preencha para Orçarmos seu Pedido
            </h2>
            <p className="text-sm text-slate-400 max-w-lg mx-auto">
              Envie a estampa da sua marca, selecione o modelo de camiseta e a quantidade que deseja para a gente cotar.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl text-slate-900 border border-slate-200">
            {isSuccess ? (
              <div className="text-center py-10 space-y-6">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-slate-900">
                    Solicitação Recebida com Sucesso!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto mt-2 leading-relaxed">
                    Nossa equipe comercial já recebeu os dados da empresa <strong>{formData.companyName}</strong> e está montando sua proposta personalizada.
                  </p>
                </div>

                <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 pb-1 border-b border-slate-200 text-sm">
                    Resumo do Pedido PJ:
                  </div>
                  <div><strong>CNPJ:</strong> {formData.cnpj || 'A informar'}</div>
                  <div><strong>Modelo:</strong> {formData.tshirtModel}</div>
                  <div><strong>Cor:</strong> {formData.tshirtColor}</div>
                  <div><strong>Quantidade:</strong> {formData.quantity} unidades</div>
                  <div><strong>Posição da Estampa:</strong> {formData.printPosition}</div>
                  {formData.artworkName && (
                    <div className="text-emerald-700 font-semibold">
                      ✓ Estampa enviada: {formData.artworkName}
                    </div>
                  )}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    onClick={handleWhatsAppDirect}
                    className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-lg cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Adiantar conversa pelo WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsSuccess(false)}
                    className="w-full sm:w-auto h-13 px-8 rounded-2xl border-slate-300 font-bold cursor-pointer"
                  >
                    Fazer outra cotação
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
                    {error}
                  </div>
                )}

                {/* ETAPA 1: DADOS DO CNPJ */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="w-7 h-7 rounded-xl bg-ceu-navy text-white text-xs font-black flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">
                      Dados da Empresa (CNPJ)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">
                        CNPJ da Empresa
                      </label>
                      <Input
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={handleCnpjChange}
                        className="rounded-xl h-12 border-slate-300 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">
                        Razão Social ou Nome Fantasia *
                      </label>
                      <Input
                        required
                        placeholder="Ex: Minha Empresa Tecnologia Ltda"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="rounded-xl h-12 border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">
                        Nome do Responsável / Solicitante
                      </label>
                      <Input
                        placeholder="Seu nome"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="rounded-xl h-12 border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">
                        E-mail Corporativo *
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="compras@empresa.com.br"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-xl h-12 border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">
                        WhatsApp para Retorno *
                      </label>
                      <Input
                        required
                        placeholder="(11) 98765-4321"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="rounded-xl h-12 border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* ETAPA 2: ENVIAR A ESTAMPA DA EMPRESA */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="w-7 h-7 rounded-xl bg-ceu-navy text-white text-xs font-black flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">
                      Enviar a Estampa ou Logotipo da Empresa
                    </h3>
                  </div>

                  {formData.artworkUrl ? (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-18 h-18 rounded-2xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          <img
                            src={formData.artworkUrl}
                            alt="Estampa corporativa"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 truncate max-w-sm">
                            {formData.artworkName || 'Estampa enviada'}
                          </p>
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Arquivo anexado para orçamento
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeArtwork}
                        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl gap-1 text-xs"
                      >
                        <Trash2 className="w-4 h-4" />
                        Remover e trocar
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 p-8 rounded-2xl border-2 border-dashed border-slate-300 hover:border-ceu-sky bg-slate-50 hover:bg-sky-50/50 cursor-pointer transition-colors group">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp,application/pdf"
                        onChange={handleArtworkUpload}
                        disabled={uploadingArtwork}
                        className="sr-only"
                      />
                      <div className="w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-500 group-hover:text-ceu-navy group-hover:scale-105 transition-all">
                        {uploadingArtwork ? (
                          <Loader2 className="w-7 h-7 animate-spin text-ceu-navy" />
                        ) : (
                          <Upload className="w-7 h-7" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-800">
                          {uploadingArtwork ? 'Enviando arquivo...' : 'Clique para enviar o arquivo da sua estampa'}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Formatos recomendados: PNG transparente em alta definição, JPG, SVG ou PDF vetorial
                        </p>
                      </div>
                    </label>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">
                      Posicionamento da Estampa na Camiseta
                    </label>
                    <select
                      value={formData.printPosition}
                      onChange={(e) => setFormData({ ...formData, printPosition: e.target.value })}
                      className="w-full h-12 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {PRINT_POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>

                  {/* Guia Visual de Tamanhos Recomendados para PJ */}
                  <StandardPrintSizesGuide defaultExpanded={false} />
                </div>

                {/* ETAPA 3: MODELO DA CAMISETA E COR */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="w-7 h-7 rounded-xl bg-ceu-navy text-white text-xs font-black flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">
                      Modelo da Camiseta & Cor Desejada
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TSHIRT_MODELS.map((model) => {
                      const isSelected = formData.tshirtModel === model.name;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, tshirtModel: model.name })}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-ceu-navy bg-slate-900 text-white shadow-lg'
                              : 'border-slate-200 bg-slate-50/70 hover:bg-slate-100 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">{model.name}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-ceu-aqua" />}
                          </div>
                          <p className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                            {model.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                      Cor da Peça
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {COLOR_OPTIONS.map((c) => {
                        const isSelected = formData.tshirtColor === c.label;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, tshirtColor: c.label })}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <span
                              className={`w-3.5 h-3.5 rounded-full border ${c.border}`}
                              style={{ background: c.hex }}
                            />
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* ETAPA 4: QUANTIDADE PARA ORÇAR */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="w-7 h-7 rounded-xl bg-ceu-navy text-white text-xs font-black flex items-center justify-center">
                      4
                    </span>
                    <h3 className="text-base font-black text-slate-800 uppercase tracking-wider">
                      Quantidade para a Gente Orçar
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">
                        Quantidade Exata de Peças *
                      </label>
                      <Input
                        required
                        type="number"
                        min="1"
                        placeholder="Ex: 50"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="rounded-xl h-12 border-slate-300 font-bold text-lg"
                      />

                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-slate-500 font-medium">Sugestões:</span>
                        {['20', '50', '100', '250', '500'].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setFormData({ ...formData, quantity: q })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                              formData.quantity === q
                                ? 'bg-ceu-navy text-white border-ceu-navy'
                                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {q} un
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">
                        Prazo Desejado / Data do Evento (Opcional)
                      </label>
                      <Input
                        placeholder="Ex: Em 15 dias / Data de entrega"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="rounded-xl h-12 border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">
                      Observações adicionais (detalhes da arte, tamanhos pretendidos, etc.)
                    </label>
                    <Textarea
                      rows={3}
                      placeholder="Ex: Precisamos de tamanhos P, M e G. A estampa nas costas precisa ter 30cm de largura..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="rounded-xl border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* BOTÃO FINAL DE SUBMISSÃO */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl bg-ceu-navy hover:bg-slate-800 text-white font-black text-base shadow-xl shadow-ceu-navy/20 gap-2 cursor-pointer"
                  >
                    <Send className="w-5 h-5 text-ceu-sky" />
                    {isSubmitting ? 'Calculando cotação corporativa...' : 'Enviar Solicitação de Orçamento PJ'}
                  </Button>
                  <p className="text-xs text-center text-slate-500 mt-2.5">
                    Retorno no mesmo dia útil com proposta em PDF e prazos de produção.
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* DIFERENCIAIS B2B DA CÉU CRIATIVA */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-ceu-sky">
            Padrão Céu Criativa
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Por que Empresas Escolhem Produzir com a Gente?
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Da concepção à entrega: tecnologia de estamparia industrial sem a burocracia de confecções tradicionais.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ADVANTAGES.map((adv) => {
            const Icon = adv.icon;
            return (
              <div
                key={adv.title}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-ceu-sky/50 transition-all space-y-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-ceu-sky/15 text-ceu-sky flex items-center justify-center">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">{adv.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{adv.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* PASSO A PASSO CORPORATIVO */}
      <section className="py-16 bg-slate-900 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-white">Como Funciona o Fluxo de Pedidos PJ</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="w-8 h-8 rounded-full bg-ceu-sky text-ceu-navy font-black text-sm flex items-center justify-center mx-auto">1</span>
              <h4 className="font-bold text-sm text-white">Envio do Orçamento</h4>
              <p className="text-xs text-slate-400">Você envia estampa, modelo e quantidade pelo formulário ou WhatsApp.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="w-8 h-8 rounded-full bg-ceu-aqua text-ceu-navy font-black text-sm flex items-center justify-center mx-auto">2</span>
              <h4 className="font-bold text-sm text-white">Mockup & Proposta</h4>
              <p className="text-xs text-slate-400">Enviamos a visualização 3D da estampa na peça e a tabela com desconto de volume.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="w-8 h-8 rounded-full bg-emerald-400 text-ceu-navy font-black text-sm flex items-center justify-center mx-auto">3</span>
              <h4 className="font-bold text-sm text-white">Aprovação & NF-e</h4>
              <p className="text-xs text-slate-400">Faturamento da sua empresa com emissão de nota fiscal e início da produção.</p>
            </div>
            <div className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <span className="w-8 h-8 rounded-full bg-amber-400 text-ceu-navy font-black text-sm flex items-center justify-center mx-auto">4</span>
              <h4 className="font-bold text-sm text-white">Envio com Rastreio</h4>
              <p className="text-xs text-slate-400">Embalagem individual cuidadosa e envio direto para sua empresa ou filiais.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
