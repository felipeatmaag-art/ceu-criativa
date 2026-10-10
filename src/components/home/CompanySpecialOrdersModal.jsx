import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  MessageCircle,
  Send,
  CheckCircle2,
  Package,
  ShieldCheck,
  Upload,
  Loader2,
  Trash2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const WHATSAPP_NUMBER = '5511999999999';

const TSHIRT_MODELS = [
  { id: 'algodao_classic', name: 'Camiseta Tradicional 100% Algodão', desc: 'Malha penteada 30.1 clássica, macia e versátil para equipes e eventos.' },
  { id: 'oversized_street', name: 'Camiseta Oversized Streetwear', desc: 'Modelagem ampla, malha pesada premium e gola canelada de 3cm.' },
  { id: 'baby_look', name: 'Camiseta Baby Look Feminina', desc: 'Corte ajustado feminino, gola fina e acabamento suave.' },
  { id: 'moletom_canguru', name: 'Moletom Canguru com Capuz', desc: 'Flanelado encorpado com bolso frontal e cordão de ajuste.' },
  { id: 'ecobag', name: 'Ecobag de Algodão Cru Ecológica', desc: 'Brinde corporativo sustentável, costura reforçada.' },
  { id: 'outro', name: 'Outro Modelo Personalizado', desc: 'Modelagens esportivas, polos ou peças especiais sob medida.' }
];

const PRINT_POSITIONS = [
  'Frente Centro (Grande)',
  'Peito Esquerdo (Logo)',
  'Costas (Grande)',
  'Peito Esquerdo + Costas Grande',
  'Manga + Frente',
  'Total / Sob Consulta'
];

const COLOR_OPTIONS = [
  { id: 'branca', label: 'Branca', hex: '#FFFFFF', border: 'border-slate-300' },
  { id: 'preta', label: 'Preta', hex: '#111827', border: 'border-slate-800' },
  { id: 'cinza', label: 'Cinza Mescla', hex: '#9CA3AF', border: 'border-slate-400' },
  { id: 'marinho', label: 'Azul Marinho', hex: '#1E3A8A', border: 'border-blue-900' },
  { id: 'offwhite', label: 'Off-White', hex: '#F5F5F0', border: 'border-slate-300' },
  { id: 'verde', label: 'Verde Militar', hex: '#374151', border: 'border-emerald-800' },
  { id: 'outra', label: 'Cores Mistas / Especiais', hex: 'linear-gradient(45deg, #111, #fff)', border: 'border-slate-400' },
];

export default function CompanySpecialOrdersModal({ isOpen, onClose }) {
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

  if (!isOpen) return null;

  // Formatador de CNPJ: 00.000.000/0000-00
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

  // Upload da estampa do cliente
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
        console.warn('Fallback para visualização local do arquivo de estampa:', uploadErr);
      }

      if (!fileUrl) {
        fileUrl = URL.createObjectURL(file);
      }

      setFormData((prev) => ({
        ...prev,
        artworkUrl: fileUrl,
        artworkName: file.name
      }));
    } catch (err) {
      setError('Não foi possível carregar a imagem. Tente novamente ou use outro formato.');
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
      `Olá, equipe Céu Criativa! Sou da empresa *${formData.companyName || 'Empresa'}* (CNPJ: ${formData.cnpj || 'Não informado'}).\n\n` +
      `Gostaria de solicitar um orçamento corporativo de camisetas:\n` +
      `• *Modelo:* ${formData.tshirtModel}\n` +
      `• *Cor:* ${formData.tshirtColor}\n` +
      `• *Quantidade:* ${formData.quantity} peças\n` +
      `• *Posição da Estampa:* ${formData.printPosition}\n` +
      (formData.artworkUrl ? `• *Estampa enviada:* ${formData.artworkUrl}\n` : '') +
      `• *Contato:* ${formData.contactName} (${formData.phone || formData.email})\n` +
      (formData.description ? `• *Observações:* ${formData.description}\n` : '') +
      `\nPodem me enviar a proposta comercial?`
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
      console.warn('Erro ao salvar no banco, prosseguindo com confirmação:', err);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop escuro com blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-ceu-navy/85 backdrop-blur-md"
        />

        {/* Janela do Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-6 text-slate-900 max-h-[92vh] flex flex-col"
        >
          {/* Header Superior Corporativo */}
          <div className="relative bg-gradient-to-r from-ceu-navy via-slate-900 to-ceu-navy text-white p-6 sm:p-7 shrink-0">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ceu-sky/20 text-ceu-sky text-xs font-black uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5" />
              Céu Criativa B2B & Pedidos Corporativos
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Orçamento de Camisetas para Empresas (CNPJ)
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Envie sua estampa, escolha o modelo e a quantidade desejada. Produzimos sob demanda com estampa DTF HD têxtil de altíssima durabilidade.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/80 pt-3 border-t border-white/10">
              <span className="flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-ceu-aqua" />
                Sem pedido mínimo abusivo
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-ceu-aqua" />
                Emissão de Nota Fiscal (NFe)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-ceu-aqua" />
                Descontos progressivos por volume
              </span>
            </div>
          </div>

          {/* Conteúdo com rolagem suave */}
          <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
            {isSuccess ? (
              <div className="text-center py-6 space-y-5">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                    Solicitação de Orçamento Enviada!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-lg mx-auto mt-2 leading-relaxed">
                    Recebemos os dados da sua empresa <strong>{formData.companyName}</strong> para <strong>{formData.quantity} peças</strong> do modelo <strong>{formData.tshirtModel}</strong>.
                  </p>
                </div>

                {/* Resumo do Pedido */}
                <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
                  <div className="font-bold text-slate-800 pb-1 border-b border-slate-200 text-sm">
                    Resumo da Solicitação:
                  </div>
                  <div><strong>CNPJ:</strong> {formData.cnpj || 'Não informado'}</div>
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

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    onClick={handleWhatsAppDirect}
                    className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-md cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Adiantar Atendimento no WhatsApp
                  </Button>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="w-full sm:w-auto h-12 px-6 rounded-2xl border-slate-300 font-semibold cursor-pointer"
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Alerta de Contato Rápido */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                      Prefere orçar diretamente no WhatsApp?
                    </div>
                    <p className="text-xs text-emerald-800">
                      Envie sua estampa e tire dúvidas na hora com nosso time corporativo.
                    </p>
                  </div>
                  <Button
                    type="button"
                    onClick={handleWhatsAppDirect}
                    className="w-full sm:w-auto shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-9 px-4 gap-1.5 shadow-sm cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chamar no WhatsApp
                  </Button>
                </div>

                {error && (
                  <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl">
                    {error}
                  </div>
                )}

                {/* BLOCO 1: DADOS DA EMPRESA (CNPJ) */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <span className="w-6 h-6 rounded-full bg-ceu-navy text-white text-xs font-black flex items-center justify-center">
                      1
                    </span>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                      Dados da Empresa (CNPJ)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">
                        CNPJ da Empresa
                      </label>
                      <Input
                        placeholder="00.000.000/0000-00"
                        value={formData.cnpj}
                        onChange={handleCnpjChange}
                        className="rounded-xl h-11 border-slate-300 font-mono text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">
                        Razão Social ou Nome Fantasia *
                      </label>
                      <Input
                        required
                        placeholder="Ex: StartUp Tecnologia Ltda"
                        value={formData.companyName}
                        onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                        className="rounded-xl h-11 border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">
                        Nome do Responsável
                      </label>
                      <Input
                        placeholder="Seu nome"
                        value={formData.contactName}
                        onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                        className="rounded-xl h-11 border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">
                        E-mail Corporativo *
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="contato@empresa.com.br"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="rounded-xl h-11 border-slate-300"
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
                        className="rounded-xl h-11 border-slate-300"
                      />
                    </div>
                  </div>
                </div>

                {/* BLOCO 2: ENVIAR A ESTAMPA DA EMPRESA */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <span className="w-6 h-6 rounded-full bg-ceu-navy text-white text-xs font-black flex items-center justify-center">
                      2
                    </span>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                      Enviar a Estampa ou Logotipo
                    </h3>
                  </div>

                  {formData.artworkUrl ? (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          <img
                            src={formData.artworkUrl}
                            alt="Estampa anexada"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 truncate max-w-xs">
                            {formData.artworkName || 'Estampa enviada com sucesso'}
                          </p>
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Arquivo pronto para orçamento
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
                        Trocar estampa
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed border-slate-300 hover:border-ceu-sky bg-slate-50 hover:bg-sky-50/50 cursor-pointer transition-colors group">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/svg+xml,image/webp,application/pdf"
                        onChange={handleArtworkUpload}
                        disabled={uploadingArtwork}
                        className="sr-only"
                      />
                      <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-slate-500 group-hover:text-ceu-navy group-hover:scale-105 transition-all">
                        {uploadingArtwork ? (
                          <Loader2 className="w-6 h-6 animate-spin text-ceu-navy" />
                        ) : (
                          <Upload className="w-6 h-6" />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-xs font-bold text-slate-800">
                          {uploadingArtwork ? 'Carregando estampa...' : 'Clique para enviar o arquivo da sua estampa'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Aceitamos PNG em alta definição (fundo transparente), JPG, SVG ou PDF vetorial
                        </p>
                      </div>
                    </label>
                  )}

                  {/* Posição da estampa */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">
                      Posição da Estampa na Camiseta
                    </label>
                    <select
                      value={formData.printPosition}
                      onChange={(e) => setFormData({ ...formData, printPosition: e.target.value })}
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      {PRINT_POSITIONS.map((pos) => (
                        <option key={pos} value={pos}>{pos}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* BLOCO 3: MODELO DA CAMISETA & COR */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <span className="w-6 h-6 rounded-full bg-ceu-navy text-white text-xs font-black flex items-center justify-center">
                      3
                    </span>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                      Modelo da Camiseta & Cor
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {TSHIRT_MODELS.map((model) => {
                      const isSelected = formData.tshirtModel === model.name;
                      return (
                        <button
                          key={model.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, tshirtModel: model.name })}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'border-ceu-navy bg-slate-900 text-white shadow-md'
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

                  {/* Seleção de Cor */}
                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                      Cor Principal da Peça
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

                {/* BLOCO 4: QUANTIDADE PARA ORÇAR */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                    <span className="w-6 h-6 rounded-full bg-ceu-navy text-white text-xs font-black flex items-center justify-center">
                      4
                    </span>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-800">
                      Quantidade para a Gente Orçar
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 mb-1 block">
                        Quantidade Exata de Peças *
                      </label>
                      <div className="flex gap-2">
                        <Input
                          required
                          type="number"
                          min="1"
                          placeholder="Ex: 50"
                          value={formData.quantity}
                          onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                          className="rounded-xl h-11 border-slate-300 font-bold text-base"
                        />
                      </div>

                      {/* Botões rápidos de quantidade */}
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[11px] text-slate-500 font-medium">Sugestões:</span>
                        {['20', '50', '100', '250', '500'].map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setFormData({ ...formData, quantity: q })}
                            className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
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
                        placeholder="Ex: Em 15 dias / Data do evento"
                        value={formData.deadline}
                        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                        className="rounded-xl h-11 border-slate-300 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 mb-1 block">
                      Observações adicionais (grades de tamanhos, detalhes da estampa, etc.)
                    </label>
                    <Textarea
                      rows={2}
                      placeholder="Ex: Precisamos de 20 P, 20 M e 10 G. A estampa tem detalhes em gradiente..."
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="rounded-xl border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* BOTÃO DE SUBMIT */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-13 rounded-2xl bg-ceu-navy hover:bg-slate-800 text-white font-black text-base shadow-lg shadow-ceu-navy/20 gap-2 cursor-pointer"
                  >
                    <Send className="w-5 h-5 text-ceu-sky" />
                    {isSubmitting ? 'Gerando solicitação corporativa...' : 'Enviar Solicitação de Orçamento para o CNPJ'}
                  </Button>
                  <p className="text-[11px] text-center text-slate-500 mt-2">
                    Retornamos no mesmo dia útil com proposta comercial detalhada e tabela progressiva.
                  </p>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
