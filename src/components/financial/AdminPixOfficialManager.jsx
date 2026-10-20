import React, { useState, useEffect } from 'react';
import { 
  KeyRound, 
  Building2, 
  MapPin, 
  MessageCircle, 
  Save, 
  CheckCircle2, 
  Copy, 
  Check, 
  QrCode, 
  ShieldCheck, 
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { pixService, DEFAULT_PAYMENT_CONFIG } from '@/services/pixService';

export default function AdminPixOfficialManager() {
  const [config, setConfig] = useState(DEFAULT_PAYMENT_CONFIG);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testAmount, setTestAmount] = useState('1.00');
  const [generatedPix, setGeneratedPix] = useState(null);
  const [copied, setCopied] = useState(false);
  const [simulatedPaid, setSimulatedPaid] = useState(false);

  useEffect(() => {
    const current = pixService.getConfig();
    setConfig(current);
    // Gera prévia com a chave atual
    try {
      const sample = pixService.generatePixCode({
        amount: Number(testAmount) || 1.0,
        orderNumber: 'TESTE-MASTER-' + Date.now().toString().slice(-4),
        description: 'Teste de Recebimento Céu Criativa'
      });
      setGeneratedPix(sample);
    } catch (e) {
      console.warn('Erro ao gerar código de teste Pix:', e);
    }
  }, []);

  const handleSave = (e) => {
    e.preventDefault();
    pixService.saveConfig(config);
    setSavedSuccess(true);

    // Regenera código de teste com os dados salvos
    const updatedSample = pixService.generatePixCode({
      amount: Number(testAmount) || 1.0,
      orderNumber: 'TESTE-MASTER-' + Date.now().toString().slice(-4),
      description: 'Teste de Recebimento Céu Criativa'
    });
    setGeneratedPix(updatedSample);

    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const handleCopyCode = () => {
    if (!generatedPix?.pixCode) return;
    navigator.clipboard.writeText(generatedPix.pixCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSimulatePayment = () => {
    setSimulatedPaid(true);
    setTimeout(() => setSimulatedPaid(false), 5000);
  };

  return (
    <div className="space-y-6">
      {/* CARD 1: FORMULÁRIO DE CONFIGURAÇÃO PIX MASTER */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Conta Master de Recebimento
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Configuração Pix Oficial da Loja
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Esta é a chave Pix oficial que receberá todos os pagamentos de clientes no checkout (gerando o QR Code dinâmico padrão BACEN BRCode).
            </p>
          </div>

          <Badge className="bg-emerald-500/10 text-emerald-700 border-emerald-300 font-bold text-xs py-1 px-3 self-start sm:self-auto">
            ● Padrão EMV Banco Central Ativo
          </Badge>
        </div>

        {savedSuccess && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Configurações Pix salvas com sucesso de forma persistente! Todos os checkouts já estão utilizando esta chave.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Tipo de Chave */}
            <div>
              <Label className="text-xs font-bold text-slate-700">Tipo de Chave Pix</Label>
              <select
                value={config.pixKeyType || 'email'}
                onChange={(e) => setConfig({ ...config, pixKeyType: e.target.value })}
                className="mt-1.5 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="email">E-mail</option>
                <option value="cpf">CPF (Pessoa Física)</option>
                <option value="cnpj">CNPJ (Pessoa Jurídica)</option>
                <option value="phone">Celular / Telefone</option>
                <option value="random">Chave Aleatória (EVP)</option>
              </select>
            </div>

            {/* Chave Pix */}
            <div>
              <Label className="text-xs font-bold text-slate-700">Chave Pix de Recebimento</Label>
              <div className="relative mt-1.5">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  required
                  value={config.pixKey || ''}
                  onChange={(e) => setConfig({ ...config, pixKey: e.target.value })}
                  placeholder="ex: felipeatmaag@gmail.com ou 00.000.000/0001-00"
                  className="pl-9 h-10 rounded-xl border-slate-200 text-xs font-bold"
                />
              </div>
            </div>

            {/* Nome do Titular */}
            <div>
              <Label className="text-xs font-bold text-slate-700">Nome do Titular / Empresa (Merchant Name)</Label>
              <div className="relative mt-1.5">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  required
                  value={config.merchantName || ''}
                  onChange={(e) => setConfig({ ...config, merchantName: e.target.value })}
                  placeholder="ex: FELIPE SILVERIO CEU ou ATMA COMUNICACAO"
                  className="pl-9 h-10 rounded-xl border-slate-200 text-xs font-bold uppercase"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Nome exibido no comprovante do banco do cliente (máx. 25 caracteres).</p>
            </div>

            {/* Cidade do Titular */}
            <div>
              <Label className="text-xs font-bold text-slate-700">Cidade da Conta (Merchant City)</Label>
              <div className="relative mt-1.5">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  required
                  value={config.merchantCity || ''}
                  onChange={(e) => setConfig({ ...config, merchantCity: e.target.value })}
                  placeholder="ex: BALNEARIO CAMBORIU ou SAO PAULO"
                  className="pl-9 h-10 rounded-xl border-slate-200 text-xs font-bold uppercase"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Cidade da agência bancária registrada no Banco Central (máx. 15 caracteres).</p>
            </div>

            {/* WhatsApp de Atendimento */}
            <div>
              <Label className="text-xs font-bold text-slate-700">WhatsApp para Suporte &amp; Comprovantes</Label>
              <div className="relative mt-1.5">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  value={config.whatsapp || ''}
                  onChange={(e) => setConfig({ ...config, whatsapp: e.target.value })}
                  placeholder="ex: 5547999999999"
                  className="pl-9 h-10 rounded-xl border-slate-200 text-xs font-bold font-mono"
                />
              </div>
            </div>

            {/* Modo da Loja */}
            <div>
              <Label className="text-xs font-bold text-slate-700">Modo de Operação</Label>
              <select
                value={config.storeMode || 'production'}
                onChange={(e) => setConfig({ ...config, storeMode: e.target.value })}
                className="mt-1.5 w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="production">Produção Oficial (Recebimento Real Ativo)</option>
                <option value="test">Ambiente de Demonstração / Homologação</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Chave atualmente ativa: <strong className="text-slate-800 font-mono">{config.pixKey || 'Não configurada'}</strong>
            </span>

            <Button
              type="submit"
              className="w-full sm:w-auto h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 gap-2"
            >
              <Save className="w-4 h-4" />
              Salvar Configuração Pix Oficial
            </Button>
          </div>
        </form>
      </div>

      {/* CARD 2: SIMULADOR DE TESTE EM TEMPO REAL */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-1.5 border border-emerald-500/30">
              <QrCode className="w-3.5 h-3.5" />
              Simulador em Tempo Real
            </div>
            <h3 className="text-xl font-black text-white">
              Teste de Geração de QR Code e Código Pix
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Valide o código Pix Copia e Cola gerado exatamente com os dados da conta Master cadastrada.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Valor de teste:</span>
            <div className="relative w-28">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R$</span>
              <Input
                value={testAmount}
                onChange={(e) => {
                  setTestAmount(e.target.value);
                  const sample = pixService.generatePixCode({
                    amount: Number(e.target.value) || 1.0,
                    orderNumber: 'TESTE-MASTER-' + Date.now().toString().slice(-4),
                    description: 'Teste de Recebimento Céu Criativa'
                  });
                  setGeneratedPix(sample);
                }}
                className="pl-8 h-9 text-xs font-bold bg-slate-800 border-slate-700 text-white rounded-xl"
              />
            </div>
          </div>
        </div>

        {generatedPix ? (
          <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6 items-center">
            {/* Imagem do QR Code */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner">
              <img
                src={generatedPix.qrCodeUrl}
                alt="QR Code Pix"
                className="w-40 h-40 object-contain rounded-lg"
              />
              <span className="text-[10px] text-slate-600 font-bold mt-2 text-center">
                Escaneie no app do seu banco
              </span>
            </div>

            {/* Dados e Botão Copiar */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Beneficiário</span>
                  <p className="text-xs font-bold text-white truncate mt-0.5">{generatedPix.beneficiary}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Chave Vinculada</span>
                  <p className="text-xs font-bold text-emerald-400 truncate mt-0.5">{generatedPix.pixKey}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Valor Total</span>
                  <p className="text-xs font-black text-white mt-0.5">R$ {Number(generatedPix.amount).toFixed(2).replace('.', ',')}</p>
                </div>
              </div>

              {/* Linha do Código Pix Copia e Cola */}
              <div>
                <Label className="text-[11px] font-semibold text-slate-300">Código Pix Copia e Cola Oficial (BRCode EMV):</Label>
                <div className="mt-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all max-h-20 overflow-y-auto">
                  {generatedPix.pixCode}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button
                  type="button"
                  onClick={handleCopyCode}
                  className={`h-10 px-4 rounded-xl font-bold text-xs gap-2 transition-all ${
                    copied 
                      ? 'bg-emerald-500 text-slate-950' 
                      : 'bg-white text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Código Pix Copiado!' : 'Copiar Código Pix (Pix Copia e Cola)'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSimulatePayment}
                  className="h-10 px-4 rounded-xl border-slate-700 text-emerald-400 hover:bg-slate-800 font-bold text-xs gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  Simular Confirmação Instantânea
                </Button>
              </div>

              {simulatedPaid && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Simulação validada com sucesso! Pagamento confirmado e pedido liberado para produção têxtil.</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-xs">
            Informe a chave Pix e clique em Salvar para gerar o código de teste.
          </div>
        )}
      </div>
    </div>
  );
}
