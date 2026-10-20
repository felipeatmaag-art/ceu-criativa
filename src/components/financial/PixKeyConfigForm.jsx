import React, { useState, useEffect, useId } from 'react';
import { 
  Key, 
  Mail, 
  CreditCard, 
  Building2, 
  Phone, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ShieldCheck, 
  Save, 
  Loader2,
  Info,
  WalletCards
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useQueryClient } from '@tanstack/react-query';

// Tipos de Chaves Pix suportadas pelo BACEN
export const PIX_KEY_TYPES = [
  { 
    id: 'email', 
    label: 'E-mail', 
    icon: Mail, 
    placeholder: 'ex: artista@email.com',
    description: 'Chave vinculada ao seu endereço de e-mail.'
  },
  { 
    id: 'random', 
    label: 'Chave Aleatória (EVP)', 
    icon: Key, 
    placeholder: 'ex: 12345678-1234-1234-1234-123456789abc',
    description: 'Código de segurança de 32 ou 36 caracteres gerado pelo seu banco.'
  },
  { 
    id: 'cpf', 
    label: 'CPF', 
    icon: CreditCard, 
    placeholder: '000.000.000-00',
    description: 'Cadastro de Pessoa Física (11 dígitos).'
  },
  { 
    id: 'cnpj', 
    label: 'CNPJ', 
    icon: Building2, 
    placeholder: '00.000.000/0001-00',
    description: 'Cadastro de Pessoa Jurídica (14 dígitos).'
  },
  { 
    id: 'phone', 
    label: 'Celular / WhatsApp', 
    icon: Phone, 
    placeholder: '(00) 90000-0000',
    description: 'Número de telefone móvel com DDD.'
  },
];

// Funções de Validação de Formato
export function validatePixKey(type, value) {
  if (!value || typeof value !== 'string' || !value.trim()) {
    return { isValid: false, error: 'A chave Pix é obrigatória.' };
  }

  const cleanVal = value.trim();

  switch (type) {
    case 'email': {
      // Regex padrão RFC 5322 para e-mail
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(cleanVal)) {
        return { 
          isValid: false, 
          error: 'Formato de e-mail inválido. Utilize o formato nome@provedor.com' 
        };
      }
      return { isValid: true, message: 'E-mail válido para recebimento Pix.' };
    }

    case 'random': {
      // Chave Aleatória (EVP / UUID v4):
      // Padrão canônico BACEN: 36 caracteres com hífens (8-4-4-4-12) ou 32 caracteres hexadecimais puros
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      const pureHexRegex = /^[0-9a-fA-F]{32}$/;

      if (uuidRegex.test(cleanVal)) {
        return { isValid: true, message: 'Chave aleatória válida no padrão BACEN (UUIDv4).' };
      }
      
      if (pureHexRegex.test(cleanVal)) {
        return { 
          isValid: true, 
          message: 'Chave aleatória hexadecimal válida (32 caracteres).' 
        };
      }

      // Se tamanho for diferente ou tiver caracteres inválidos
      const hexCharsOnly = /^[0-9a-fA-F-]+$/.test(cleanVal);
      if (!hexCharsOnly) {
        return { 
          isValid: false, 
          error: 'A chave aleatória deve conter apenas dígitos e letras de A a F geradas pelo seu banco.' 
        };
      }

      if (cleanVal.length < 32) {
        return { 
          isValid: false, 
          error: `Chave muito curta (${cleanVal.length}/32 caracteres). Cole a chave completa gerada no seu banco.` 
        };
      }

      return { 
        isValid: false, 
        error: 'Formato inválido. A chave aleatória deve seguir o padrão: 8-4-4-4-12 (ex: a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d).' 
      };
    }

    case 'cpf': {
      const nums = cleanVal.replace(/\D/g, '');
      if (nums.length !== 11) {
        return { isValid: false, error: 'O CPF deve conter exatamente 11 dígitos.' };
      }
      if (/^(\d)\1{10}$/.test(nums)) {
        return { isValid: false, error: 'CPF com dígitos repetidos inválido.' };
      }
      return { isValid: true, message: 'CPF válido para recebimento.' };
    }

    case 'cnpj': {
      const nums = cleanVal.replace(/\D/g, '');
      if (nums.length !== 14) {
        return { isValid: false, error: 'O CNPJ deve conter exatamente 14 dígitos.' };
      }
      return { isValid: true, message: 'CNPJ válido para recebimento.' };
    }

    case 'phone': {
      const nums = cleanVal.replace(/\D/g, '');
      if (nums.length < 10 || nums.length > 13) {
        return { isValid: false, error: 'Informe o DDD + número do celular (10 ou 11 dígitos).' };
      }
      return { isValid: true, message: 'Número de telefone válido para recebimento.' };
    }

    default:
      return { isValid: true, message: 'Chave cadastrada.' };
  }
}

// Máscaras automáticas por tipo
function applyPixMask(type, rawValue) {
  if (!rawValue) return '';
  const val = String(rawValue);

  if (type === 'cpf') {
    const d = val.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
  }

  if (type === 'cnpj') {
    const d = val.replace(/\D/g, '').slice(0, 14);
    if (d.length <= 2) return d;
    if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
    if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
    if (d.length <= 12) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12, 14)}`;
  }

  if (type === 'phone') {
    const d = val.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 2) return d ? `(${d}` : '';
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
  }

  if (type === 'random') {
    // Se colou 32 caracteres hexadecimais sem hífen, formata automaticamente no padrão 8-4-4-4-12
    const clean = val.trim();
    if (/^[0-9a-fA-F]{32}$/.test(clean)) {
      return `${clean.slice(0, 8)}-${clean.slice(8, 12)}-${clean.slice(12, 16)}-${clean.slice(16, 20)}-${clean.slice(20, 32)}`.toLowerCase();
    }
    return clean.toLowerCase();
  }

  if (type === 'email') {
    return val.trim().toLowerCase();
  }

  return val;
}

/**
 * Componente PixKeyConfigForm
 * Permite ao artista/usuário configurar suas preferências e chave Pix para receber os repasses da Atma.
 */
export default function PixKeyConfigForm({
  initialData = {},
  onSaveSuccess = null,
  showTitle = true,
  standaloneSave = true,
  className = ''
}) {
  const [keyType, setKeyType] = useState(initialData.pix_key_type || 'email');
  const [pixKey, setPixKey] = useState(initialData.pix_key || '');
  const [holderName, setHolderName] = useState(initialData.pix_holder_name || initialData.name || '');
  const [bankName, setBankName] = useState(initialData.pix_bank_name || '');
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(initialData.notify_payout_whatsapp ?? true);
  
  const [validation, setValidation] = useState({ isValid: false, error: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [copied, setCopied] = useState(false);

  const queryClient = useQueryClient();
  const selectId = useId();

  // Detecta tipo automaticamente se chave inicial vier preenchida e sem tipo explícito
  useEffect(() => {
    if (initialData.pix_key && !initialData.pix_key_type) {
      const k = initialData.pix_key.trim();
      if (k.includes('@')) {
        setKeyType('email');
      } else if (/^[0-9a-fA-F-]{32,36}$/.test(k)) {
        setKeyType('random');
      } else if (k.replace(/\D/g, '').length === 11) {
        setKeyType('cpf');
      } else if (k.replace(/\D/g, '').length === 14) {
        setKeyType('cnpj');
      }
    }
  }, [initialData]);

  // Atualiza validação sempre que tipo ou chave mudam
  useEffect(() => {
    if (!pixKey) {
      setValidation({ isValid: false, error: '' });
      return;
    }
    const result = validatePixKey(keyType, pixKey);
    setValidation(result);
  }, [keyType, pixKey]);

  const handleTypeChange = (newType) => {
    setKeyType(newType);
    // Se mudar o tipo, tenta reaplicar a máscara ou limpar caso incompatível
    if (pixKey) {
      const formatted = applyPixMask(newType, pixKey);
      setPixKey(formatted);
    }
  };

  const handleKeyChange = (e) => {
    const formatted = applyPixMask(keyType, e.target.value);
    setPixKey(formatted);
  };

  const handleCopy = () => {
    if (!pixKey) return;
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();

    const result = validatePixKey(keyType, pixKey);
    if (!result.isValid) {
      setFeedback({ type: 'error', message: result.error });
      return;
    }

    setIsSaving(true);
    setFeedback(null);

    const payload = {
      pix_key: pixKey.trim(),
      pix_key_type: keyType,
      pix_holder_name: holderName.trim(),
      pix_bank_name: bankName.trim(),
      notify_payout_whatsapp: notifyWhatsApp,
      has_configured_payout: true
    };

    try {
      // 1. Atualiza no backend / User
      if (base44?.auth?.updateMe) {
        await base44.auth.updateMe(payload);
      } else {
        await fetch('/api/entities/User/me', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      // 2. Invalida queries
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      await queryClient.invalidateQueries({ queryKey: ['artist-financial-summary'] });

      setFeedback({ 
        type: 'success', 
        message: '✓ Preferências de recebimento Pix salvas com sucesso! Seus repasses serão enviados para esta chave.' 
      });

      if (onSaveSuccess) {
        onSaveSuccess(payload);
      }

      setTimeout(() => setFeedback(null), 6000);
    } catch (err) {
      console.error('Erro ao salvar chave Pix:', err);
      setFeedback({ 
        type: 'error', 
        message: 'Não foi possível salvar as configurações. Verifique os dados e tente novamente.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const activeTypeInfo = PIX_KEY_TYPES.find(t => t.id === keyType) || PIX_KEY_TYPES[0];
  const ActiveIcon = activeTypeInfo.icon;

  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm ${className}`}>
      {showTitle && (
        <div className="mb-6 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600 mb-1">
            <WalletCards className="w-4 h-4" />
            <span>Configurações de Recebimento MVP</span>
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">
            Chave Pix para Repasses de Vendas
          </h3>
          <p className="mt-1 text-xs text-slate-500 leading-relaxed">
            Configure onde a plataforma <strong>Atma (Céu Criativa)</strong> deve depositar o valor das suas comissões de vendas.
          </p>
        </div>
      )}

      {/* BANNER INFORMATIVO MODELO ATMA */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/80 p-4 text-xs">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-emerald-600 text-white p-2 shrink-0 shadow-sm shadow-emerald-600/30">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-extrabold text-emerald-950 text-sm">
              Como funciona o repasse na Céu Criativa:
            </h4>
            <p className="text-emerald-900 leading-relaxed text-[11px]">
              O cliente paga o pedido no site centralmente para a <strong>Atma</strong>. Nós produzimos a peça, enviamos ao comprador e <strong>repassamos 100% da sua comissão</strong> direto para a chave Pix configurada abaixo.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* SELEÇÃO DO TIPO DE CHAVE PIX */}
        <div>
          <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 block">
            1. Selecione o Tipo da sua Chave Pix *
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {PIX_KEY_TYPES.map((type) => {
              const Icon = type.icon;
              const isSelected = keyType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => handleTypeChange(type.id)}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-900 font-bold shadow-sm ring-2 ring-emerald-600/20'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs">{type.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            {activeTypeInfo.description}
          </p>
        </div>

        {/* CAMPO DA CHAVE PIX COM VALIDAÇÃO EM TEMPO REAL */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor={selectId} className="text-xs font-bold uppercase tracking-wider text-slate-700">
              2. Digite sua Chave Pix ({activeTypeInfo.label}) *
            </Label>
            
            {pixKey && (
              <Badge 
                variant="outline"
                className={`text-[10px] px-2 py-0.5 font-bold ${
                  validation.isValid
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {validation.isValid ? (
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Válida
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" /> Formato Pendente
                  </span>
                )}
              </Badge>
            )}
          </div>

          <div className="relative">
            <div className="absolute left-3.5 top-3.5 text-slate-400">
              <ActiveIcon className="w-5 h-5" />
            </div>

            <Input
              id={selectId}
              type={keyType === 'email' ? 'email' : 'text'}
              value={pixKey}
              onChange={handleKeyChange}
              placeholder={activeTypeInfo.placeholder}
              className={`h-12 rounded-2xl pl-11 pr-24 font-mono text-xs transition-all ${
                pixKey && validation.isValid
                  ? 'border-emerald-500 focus-visible:ring-emerald-500/20 bg-emerald-50/10'
                  : pixKey && !validation.isValid
                  ? 'border-amber-400 focus-visible:ring-amber-400/20 bg-amber-50/10'
                  : 'border-slate-300'
              }`}
              required
            />

            {pixKey && (
              <div className="absolute right-2 top-2 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 px-2.5 text-xs text-slate-500 hover:text-emerald-700 rounded-xl"
                  title="Copiar chave digitada"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* MENSAGEM DE VALIDAÇÃO ESPECÍFICA */}
          {pixKey && (
            <div className="mt-2 text-xs">
              {validation.isValid ? (
                <p className="text-emerald-700 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  {validation.message}
                </p>
              ) : (
                <p className="text-amber-800 flex items-center gap-1 font-medium bg-amber-50/80 p-2 rounded-xl border border-amber-200">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                  {validation.error}
                </p>
              )}
            </div>
          )}

          {/* DICA ESPECIAL PARA CHAVE ALEATÓRIA */}
          {keyType === 'random' && !validation.isValid && (
            <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
              💡 <strong>Como pegar sua chave aleatória:</strong> Abra o aplicativo do seu banco, acesse a área <em>Pix &gt; Minhas Chaves</em>, copie a chave aleatória gerada e cole diretamente no campo acima.
            </div>
          )}
        </div>

        {/* DADOS DE CONFERÊNCIA DA CONTA (NOME DO TITULAR E BANCO) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
              Nome do Titular da Conta Bancária
            </Label>
            <Input
              type="text"
              placeholder="ex: João Silva"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              className="h-11 rounded-xl border-slate-300 text-xs"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Usado para conferência no envio do Pix pela Atma.
            </p>
          </div>

          <div>
            <Label className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 block">
              Banco / Instituição (Opcional)
            </Label>
            <Input
              type="text"
              placeholder="ex: Nubank, Inter, Itaú, Bradesco..."
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="h-11 rounded-xl border-slate-300 text-xs"
            />
            <p className="text-[10px] text-slate-400 mt-1">
              Facilita a identificação da sua conta bancária.
            </p>
          </div>
        </div>

        {/* FEEDBACK DE SUCESSO / ERRO */}
        {feedback && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                : 'bg-red-50 text-red-900 border border-red-300'
            }`}
          >
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* BOTÃO DE SALVAMENTO */}
        {standaloneSave && (
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSaving || !validation.isValid}
              className="w-full sm:w-auto h-12 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 gap-2 cursor-pointer transition-all"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando Preferências...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Preferências de Recebimento Pix
                </>
              )}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}
