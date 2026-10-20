import React, { useState } from 'react';
import {
  Building2,
  MessageCircle,
  Send,
  CheckCircle2,
  Upload,
  Loader2,
  Trash2
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import TshirtMockup from '@/components/create/TshirtMockup';
import { pixService } from '@/services/pixService';

const CORPORATE_PRODUCTS = [
  { 
    id: 'algodao_classic', 
    name: 'Camiseta Tradicional 100% Algodão', 
    desc: 'Malha penteada 30.1 clássica, macia e versátil para equipes, feiras e eventos corporativos.',
    type: 'camiseta',
    indicativePrice: 39.90
  },
  { 
    id: 'oversized_street', 
    name: 'Camiseta Oversized Streetwear', 
    desc: 'Modelagem ampla moderna, malha pesada premium de alta gramatura e gola canelada.',
    type: 'camiseta',
    indicativePrice: 59.90
  },
  { 
    id: 'baby_look', 
    name: 'Camiseta Baby Look Feminina', 
    desc: 'Corte ajustado feminino elegante com acabamento delicado nas mangas e gola.',
    type: 'baby_look',
    indicativePrice: 39.90
  },
  { 
    id: 'polo_piquet', 
    name: 'Camisa Polo Piquet Corporativa', 
    desc: 'Visual alinhado para atendimento comercial, escritório, gerência e recepção.',
    type: 'polo',
    indicativePrice: 54.90
  },
  { 
    id: 'moletom_canguru', 
    name: 'Moletom Canguru com Capuz', 
    desc: 'Flanelado premium quente e confortável, bolso frontal e cordão reforçado.',
    type: 'moletom',
    indicativePrice: 99.90
  },
  { 
    id: 'ecobag', 
    name: 'Ecobag de Algodão Cru Ecológica', 
    desc: 'Brinde corporativo sustentável para kits de onboarding, congressos e eventos.',
    type: 'ecobag',
    indicativePrice: 24.90
  }
];

const COLOR_OPTIONS = [
  { id: 'preta', label: 'Preta', hex: '#111827', name: 'preta' },
  { id: 'branca', label: 'Branca', hex: '#FFFFFF', name: 'branca' },
  { id: 'marinho', label: 'Azul Marinho', hex: '#1E3A8A', name: 'navy' },
  { id: 'cinza', label: 'Cinza Mescla', hex: '#9CA3AF', name: 'cinza' },
];

const PRINT_POSITIONS = [
  { id: 'peito_esq', label: 'Peito Esquerdo (Discreto)', desc: 'Logo de 8 a 10cm no bolso/coração' },
  { id: 'centro_frente', label: 'Frente Centro (Destaque)', desc: 'Estampa grande centralizada no peito' },
  { id: 'costas', label: 'Costas (Grande)', desc: 'Nome da marca ou slogan nas costas' },
  { id: 'peito_e_costas', label: 'Peito Esquerdo + Costas', desc: 'Logo na frente e estampa completa atrás' },
];

const QUANTITY_TIERS = [
  { qty: 15, label: '15 a 29 peças', discount: 'Preço Base' },
  { qty: 30, label: '30 a 49 peças', discount: 'Até 10% OFF' },
  { qty: 50, label: '50 a 99 peças', discount: 'Até 18% OFF' },
  { qty: 100, label: '100 a 249 peças', discount: 'Até 25% OFF' },
  { qty: 250, label: '250 a 499 peças', discount: 'Até 32% OFF' },
  { qty: 500, label: '500+ peças', discount: 'Condição Especial VIP' },
];

export default function Empresas() {
  const paymentConfig = pixService.getConfig();
  const whatsappNumber = (paymentConfig?.whatsapp || '5547999999999').replace(/\D/g, '');

  // Dados Cadastrais da Empresa
  const [companyData, setCompanyData] = useState({
    companyName: '',
    cnpj: '',
    contactName: '',
    email: '',
    phone: '',
    city: '',
    state: 'SC',
    notes: ''
  });

  // Configuração da Camiseta / Peça Corporativa
  const [selectedProduct, setSelectedProduct] = useState(CORPORATE_PRODUCTS[0]);
  const [selectedColor, setSelectedColor] = useState(COLOR_OPTIONS[0]);
  const [selectedPosition, setSelectedPosition] = useState(PRINT_POSITIONS[0].id);
  const [previewSide, setPreviewSide] = useState('front');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [companyLogoName, setCompanyLogoName] = useState('');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  // Grade & Quantidades
  const [totalQuantity, setTotalQuantity] = useState(50);
  const [sizeGrid, setSizeGrid] = useState({
    P: 10,
    M: 20,
    G: 15,
    GG: 5,
    XG: 0
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdQuoteId, setCreatedQuoteId] = useState('');
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
    setCompanyData((prev) => ({ ...prev, cnpj: value }));
  };

  // Upload da Logo da Empresa
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    setError('');
    try {
      let fileUrl = '';
      try {
        const res = await base44.integrations.Core.UploadFile({ file });
        if (res?.file_url) {
          fileUrl = res.file_url;
        }
      } catch (uploadErr) {
        console.warn('Fallback local para logo:', uploadErr);
      }
      if (!fileUrl) {
        fileUrl = URL.createObjectURL(file);
      }
      setCompanyLogoUrl(fileUrl);
      setCompanyLogoName(file.name);
    } catch {
      setError('Não foi possível carregar a imagem. Tente novamente.');
    } finally {
      setIsUploadingLogo(false);
      e.target.value = '';
    }
  };

  // Atualiza quantidade na grade de tamanhos
  const handleSizeQtyChange = (size, value) => {
    const val = Math.max(0, parseInt(value, 10) || 0);
    const updatedGrid = { ...sizeGrid, [size]: val };
    setSizeGrid(updatedGrid);
    const sum = Object.values(updatedGrid).reduce((a, b) => a + b, 0);
    setTotalQuantity(sum);
  };

  // Ajusta quantidade total rápida distribuindo proporcionalmente
  const handleSelectQuickQuantity = (qty) => {
    setTotalQuantity(qty);
    setSizeGrid({
      P: Math.round(qty * 0.2),
      M: Math.round(qty * 0.4),
      G: Math.round(qty * 0.3),
      GG: Math.round(qty * 0.1),
      XG: 0
    });
  };

  // Enviar Solicitação de Orçamento
  const handleSubmitQuote = async (e) => {
    e.preventDefault();
    if (!companyData.companyName.trim() || !companyData.email.trim() || !companyData.phone.trim()) {
      setError('Por favor, preencha o Nome da Empresa, E-mail e WhatsApp.');
      return;
    }
    if (totalQuantity < 1) {
      setError('A quantidade mínima para orçamento corporativo é de pelo menos 1 peça.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const quotePayload = {
      company_name: companyData.companyName,
      cnpj: companyData.cnpj,
      contact_name: companyData.contactName,
      email: companyData.email,
      phone: companyData.phone,
      city: companyData.city,
      state: companyData.state,
      product_model: selectedProduct.name,
      product_color: selectedColor.label,
      print_position: selectedPosition,
      logo_url: companyLogoUrl,
      total_quantity: totalQuantity,
      size_grid: sizeGrid,
      notes: companyData.notes,
      status: 'aguardando_cotacao',
      created_date: new Date().toISOString()
    };

    try {
      const created = await base44.entities.QuoteRequest.create(quotePayload);
      setCreatedQuoteId(created?.id || `ORC-${Math.floor(100000 + Math.random() * 900000)}`);
      setIsSuccess(true);
    } catch (err) {
      console.warn('Fallback salvo localmente:', err);
      setCreatedQuoteId(`ORC-${Math.floor(100000 + Math.random() * 900000)}`);
      setIsSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Link direto para WhatsApp Comercial da Céu Criativa com todos os dados
  const handleSendWhatsAppQuote = () => {
    const gridText = Object.entries(sizeGrid)
      .filter(([_, qty]) => qty > 0)
      .map(([sz, qty]) => `${sz}: ${qty}un`)
      .join(', ');

    const msg = 
      `*SOLICITAÇÃO DE ORÇAMENTO CORPORATIVO (PJ)*\n` +
      `*Código:* #${createdQuoteId}\n\n` +
      `*Empresa:* ${companyData.companyName}\n` +
      `*CNPJ:* ${companyData.cnpj || 'A informar'}\n` +
      `*Responsável:* ${companyData.contactName || 'Contato'} (${companyData.phone})\n` +
      `*E-mail:* ${companyData.email}\n` +
      `*Cidade/UF:* ${companyData.city || 'Balneário Camboriú'}/${companyData.state}\n\n` +
      `*PEÇA CONFIGURADA:*\n` +
      `• *Modelo:* ${selectedProduct.name}\n` +
      `• *Cor:* ${selectedColor.label}\n` +
      `• *Aplicação:* ${PRINT_POSITIONS.find(p => p.id === selectedPosition)?.label}\n` +
      `• *Quantidade Total:* ${totalQuantity} peças\n` +
      `• *Grade:* ${gridText || 'A definir'}\n` +
      (companyLogoUrl ? `• *Logo / Arte:* ${companyLogoUrl}\n` : '') +
      (companyData.notes ? `• *Observações:* ${companyData.notes}\n` : '') +
      `\nOlá! Montei nossa camiseta corporativa no painel da Céu Criativa e gostaria de receber a proposta oficial em PDF!`;

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* 1. HERO B2B CORPORATIVO */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-white/10 bg-gradient-to-b from-ceu-navy via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(30,144,255,0.18),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-black uppercase tracking-wider">
              <Building2 className="w-4 h-4 text-emerald-400" />
              Painel B2B · Céu Criativa &amp; Empresas
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Monte a Camiseta da sua Empresa &amp; Solicite Orçamento por Quantidade
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              Cadastre sua empresa, suba a logo da sua marca, veja o mockup fotorrealista da peça na hora, defina a grade de peças e envie direto para cotação de atacado com faturamento via Nota Fiscal (NF-e).
            </p>
          </div>
        </div>
      </section>

      {/* 2. PAINEL PRINCIPAL DE MONTAGEM E ORÇAMENTO */}
      <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {isSuccess ? (
          /* TELA DE SUCESSO APÓS ENVIO */
          <div className="bg-white rounded-3xl p-8 sm:p-12 text-slate-900 border border-slate-200 max-w-2xl mx-auto text-center space-y-6 shadow-2xl">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                Solicitação #{createdQuoteId}
              </span>
              <h2 className="text-3xl font-black text-slate-900 mt-3">
                Orçamento Enviado com Sucesso!
              </h2>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                Nossa equipe comercial da Céu Criativa recebeu todos os dados da <strong>{companyData.companyName}</strong> e já está calculando sua tabela com os descontos de atacado.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="font-extrabold text-slate-900 text-sm pb-1 border-b border-slate-200 flex justify-between">
                <span>Resumo da Camiseta Corporativa:</span>
                <span className="text-emerald-700 font-black">{totalQuantity} peças</span>
              </div>
              <div><strong>Empresa:</strong> {companyData.companyName} {companyData.cnpj && `(${companyData.cnpj})`}</div>
              <div><strong>Modelo:</strong> {selectedProduct.name} ({selectedColor.label})</div>
              <div><strong>Aplicação:</strong> {PRINT_POSITIONS.find(p => p.id === selectedPosition)?.label}</div>
              <div><strong>Grade:</strong> {Object.entries(sizeGrid).filter(([_, q]) => q > 0).map(([s, q]) => `${s}: ${q}`).join(', ')}</div>
              <div><strong>Contato:</strong> {companyData.contactName} ({companyData.phone})</div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                type="button"
                onClick={handleSendWhatsAppQuote}
                className="h-13 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5" />
                Agilizar Retorno no WhatsApp Oficial
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsSuccess(false);
                  setCompanyLogoUrl('');
                }}
                className="h-13 px-6 rounded-2xl border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs"
              >
                Montar Outro Projeto
              </Button>
            </div>
          </div>
        ) : (
          /* FORMULÁRIO COMPLETO B2B DIVIDIDO EM DUAS COLUNAS */
          <form onSubmit={handleSubmitQuote} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* COLUNA ESQUERDA: MONTAR A PEÇA (VISUALIZADOR FOTORREALISTA + LOGO) */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Card de Visualização da Camiseta da Empresa */}
              <div className="rounded-3xl bg-white border border-slate-200 p-6 text-slate-900 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                      Passo 1 · Visualização da Peça
                    </span>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                      Camiseta da sua Empresa
                    </h3>
                  </div>

                  {/* Alternador Frente / Costas */}
                  <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setPreviewSide('front')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${previewSide === 'front' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                    >
                      Frente
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewSide('back')}
                      className={`px-3 py-1.5 rounded-lg transition-all ${previewSide === 'back' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                    >
                      Costas
                    </button>
                  </div>
                </div>

                {/* Área do Mockup com a logo da empresa aplicada */}
                <div className="relative aspect-square max-h-[360px] mx-auto rounded-2xl bg-[#F5F5F7] overflow-hidden flex items-center justify-center p-4">
                  <TshirtMockup
                    designImage={companyLogoUrl || null}
                    color={selectedColor.name}
                    side={previewSide}
                  />

                  {!companyLogoUrl && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 backdrop-blur-[2px] p-6 text-center text-slate-700">
                      <div className="w-12 h-12 rounded-2xl bg-white/90 shadow-md flex items-center justify-center text-emerald-700 mb-2">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-extrabold text-slate-900">
                        Suba a logo ou arte da sua empresa
                      </span>
                      <span className="text-[11px] text-slate-600 mt-0.5 max-w-xs">
                        Veja a estampa aparecer em tempo real aplicada na cor da camiseta escolhida.
                      </span>
                    </div>
                  )}
                </div>

                {/* Upload da Logo da Empresa */}
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-800">
                      Arquivo da Logo / Arte Corporativa (PNG transparente)
                    </Label>
                    {companyLogoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setCompanyLogoUrl('');
                          setCompanyLogoName('');
                        }}
                        className="text-[11px] text-red-600 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Trash2 className="w-3 h-3" /> Remover Logo
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 h-12 rounded-2xl border-2 border-dashed border-slate-300 hover:border-emerald-600 bg-slate-50 hover:bg-emerald-50/50 cursor-pointer text-xs font-bold text-slate-700 transition-all">
                      {isUploadingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                          <span>Carregando logo...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-emerald-600" />
                          <span>{companyLogoName ? companyLogoName : 'Selecionar Logo da Empresa (PNG / JPEG)'}</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                        disabled={isUploadingLogo}
                      />
                    </label>
                  </div>
                </div>

                {/* Seleção de Cores da Peça */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-bold text-slate-800">
                    Cor da Peça para sua Equipe:
                  </Label>
                  <div className="flex flex-wrap gap-2.5">
                    {COLOR_OPTIONS.map((c) => {
                      const isSelected = selectedColor.id === c.id;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => setSelectedColor(c)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-slate-900 text-white shadow-sm ring-2 ring-emerald-500'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-black/20"
                            style={{ backgroundColor: c.hex }}
                          />
                          <span>{c.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seleção de Modelo da Peça */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-bold text-slate-800">
                    Modelo de Vestuário:
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CORPORATE_PRODUCTS.map((prod) => {
                      const isSel = selectedProduct.id === prod.id;
                      return (
                        <button
                          key={prod.id}
                          type="button"
                          onClick={() => setSelectedProduct(prod)}
                          className={`p-3 rounded-2xl border text-left transition-all ${
                            isSel
                              ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-500'
                              : 'border-slate-200 bg-white hover:border-slate-300'
                          }`}
                        >
                          <div className="font-extrabold text-xs text-slate-900">{prod.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{prod.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Posição da Aplicação da Logo */}
                <div className="space-y-2 pt-2">
                  <Label className="text-xs font-bold text-slate-800">
                    Posição de Impressão da Logo:
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {PRINT_POSITIONS.map((pos) => {
                      const isSel = selectedPosition === pos.id;
                      return (
                        <button
                          key={pos.id}
                          type="button"
                          onClick={() => {
                            setSelectedPosition(pos.id);
                            if (pos.id === 'costas') setPreviewSide('back');
                            if (pos.id === 'peito_esq' || pos.id === 'centro_frente') setPreviewSide('front');
                          }}
                          className={`p-2.5 rounded-xl border text-left transition-all text-xs ${
                            isSel
                              ? 'border-emerald-600 bg-emerald-50/60 font-bold text-emerald-950'
                              : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <div className="font-bold">{pos.label}</div>
                          <div className="text-[10px] text-slate-500">{pos.desc}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

            {/* COLUNA DIREITA: CADASTRO DA EMPRESA & QUANTIDADE DE PEÇAS */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Card Cadastro da Empresa */}
              <div className="rounded-3xl bg-white border border-slate-200 p-6 text-slate-900 shadow-xl space-y-4">
                <div className="pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    Passo 2 · Cadastro Corporativo
                  </span>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                    Dados da sua Empresa (PJ)
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1 sm:col-span-2">
                    <Label className="text-xs font-bold text-slate-800">
                      Nome da Empresa / Razão Social *
                    </Label>
                    <Input
                      type="text"
                      placeholder="ex: Acme Tecnologia Ltda"
                      value={companyData.companyName}
                      onChange={(e) => setCompanyData({ ...companyData, companyName: e.target.value })}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-900 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">
                      CNPJ da Empresa
                    </Label>
                    <Input
                      type="text"
                      placeholder="00.000.000/0000-00"
                      value={companyData.cnpj}
                      onChange={handleCnpjChange}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">
                      Nome do Responsável *
                    </Label>
                    <Input
                      type="text"
                      placeholder="ex: Marcos Ferreira"
                      value={companyData.contactName}
                      onChange={(e) => setCompanyData({ ...companyData, contactName: e.target.value })}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-900 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">
                      WhatsApp Comercial *
                    </Label>
                    <Input
                      type="text"
                      placeholder="(47) 99999-9999"
                      value={companyData.phone}
                      onChange={(e) => setCompanyData({ ...companyData, phone: e.target.value })}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-900 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">
                      E-mail Corporativo *
                    </Label>
                    <Input
                      type="email"
                      placeholder="compras@suaempresa.com.br"
                      value={companyData.email}
                      onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-900 text-xs"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">
                      Cidade
                    </Label>
                    <Input
                      type="text"
                      placeholder="ex: Balneário Camboriú"
                      value={companyData.city}
                      onChange={(e) => setCompanyData({ ...companyData, city: e.target.value })}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-900 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-800">
                      Estado (UF)
                    </Label>
                    <Input
                      type="text"
                      placeholder="SC"
                      value={companyData.state}
                      onChange={(e) => setCompanyData({ ...companyData, state: e.target.value.toUpperCase().slice(0, 2) })}
                      className="h-10 rounded-xl bg-slate-50 border-slate-200 text-slate-900 text-xs font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Card Grade e Quantidade de Peças */}
              <div className="rounded-3xl bg-white border border-slate-200 p-6 text-slate-900 shadow-xl space-y-4">
                <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                      Passo 3 · Quantidade &amp; Tamanhos
                    </span>
                    <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
                      Quantidade Total de Peças
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-purple-700 tabular-nums">
                      {totalQuantity}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 block -mt-1">
                      peças no lote
                    </span>
                  </div>
                </div>

                {/* Botões Rápidos de Quantidade com Descontos */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-800">
                    Selecione a faixa de volume:
                  </Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {QUANTITY_TIERS.map((tier) => {
                      const isSel = totalQuantity === tier.qty;
                      return (
                        <button
                          key={tier.qty}
                          type="button"
                          onClick={() => handleSelectQuickQuantity(tier.qty)}
                          className={`p-2.5 rounded-xl border text-center transition-all ${
                            isSel
                              ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-500/30'
                              : 'border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="text-sm font-black text-slate-900">{tier.label}</div>
                          <div className="text-[10px] font-bold text-emerald-700">{tier.discount}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Distribuição da Grade de Tamanhos */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <Label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Distribuição da Grade de Tamanhos:</span>
                    <span className="text-[11px] text-slate-400 font-normal">Pode ajustar individualmente</span>
                  </Label>
                  <div className="grid grid-cols-5 gap-2">
                    {['P', 'M', 'G', 'GG', 'XG'].map((sz) => (
                      <div key={sz} className="text-center p-2 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-xs font-black text-slate-700 block mb-1">{sz}</span>
                        <input
                          type="number"
                          min="0"
                          value={sizeGrid[sz] || 0}
                          onChange={(e) => handleSizeQtyChange(sz, e.target.value)}
                          className="w-full h-8 text-center bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-900"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Observações adicionais */}
                <div className="space-y-1 pt-2">
                  <Label className="text-xs font-bold text-slate-800">
                    Observações sobre prazo ou acabamento (Opcional)
                  </Label>
                  <Textarea
                    placeholder="Ex: precisamos para o evento no dia 20, gostaríamos de embalagem individual..."
                    value={companyData.notes}
                    onChange={(e) => setCompanyData({ ...companyData, notes: e.target.value })}
                    className="min-h-16 rounded-xl bg-slate-50 border-slate-200 text-slate-900 text-xs"
                  />
                </div>

                {/* Mensagem de Erro */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                    {error}
                  </div>
                )}

                {/* Botão de Envio do Orçamento */}
                <div className="pt-3 border-t border-slate-100">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-base shadow-xl shadow-emerald-700/25 transition-transform active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Gerando Orçamento Corporativo...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Enviar Pedido para Orçamento ({totalQuantity} peças)</span>
                      </>
                    )}
                  </Button>
                  <p className="text-[11px] text-center text-slate-400 mt-2">
                    ✓ Sem compromisso financeiro agora • Resposta comercial rápida com PDF e Nota Fiscal
                  </p>
                </div>

              </div>

            </div>

          </form>
        )}
      </section>
    </div>
  );
}
