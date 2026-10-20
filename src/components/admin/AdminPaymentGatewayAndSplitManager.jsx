import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Users,
  Plus,
  Trash2,
  Edit2,
  Save,
  RefreshCw,
  QrCode,
  Copy,
  Check,
  Lock,
  Eye,
  EyeOff,
  Server,
  Zap,
  FileCode2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { pixService, DEFAULT_PAYMENT_CONFIG } from '@/services/pixService';
import { base44 } from '@/api/base44Client';

export default function AdminPaymentGatewayAndSplitManager() {
  const [activeSubTab, setActiveSubTab] = useState('cielo'); // cielo | split | pix | hostgator
  const [config, setConfig] = useState(DEFAULT_PAYMENT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);

  // Modal de Subordinado
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartnerIndex, setEditingPartnerIndex] = useState(null);
  const [partnerForm, setPartnerForm] = useState({
    name: '',
    document: '',
    subordinatedMerchantId: '',
    bankAccount: '',
    pixKey: '',
    commissionPercent: 85,
    status: 'active'
  });

  // Teste de conexão Cielo
  const [testResult, setTestResult] = useState(null);
  const [isTestingCielo, setIsTestingCielo] = useState(false);

  // Amostra PIX em tempo real
  const [pixSample, setPixSample] = useState(null);
  const [copiedPix, setCopiedPix] = useState(false);

  // Chave Google Gemini
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [isTestingGemini, setIsTestingGemini] = useState(false);
  const [geminiTestResult, setGeminiTestResult] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const remote = await pixService.fetchRemoteConfig();
      setConfig(remote);
      generatePixSample(remote);
    } catch (e) {
      console.warn('Erro ao carregar configurações de pagamento:', e);
      const local = pixService.getConfig();
      setConfig(local);
      generatePixSample(local);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePixSample = (currentConfig) => {
    try {
      const sample = pixService.generatePixCode({
        amount: 1.00,
        orderNumber: 'TESTE-' + Date.now().toString().slice(-4),
        description: 'Teste Master Ceu Criativa'
      });
      setPixSample(sample);
    } catch (_e) {}
  };

  const handleSaveAll = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMessage('');
    try {
      const saved = await pixService.saveRemoteConfig(config);
      setConfig(saved);
      generatePixSample(saved);
      setSaveSuccessMessage('✓ Configurações de pagamento e split salvas com sucesso no servidor e sincronizadas!');
      setTimeout(() => setSaveSuccessMessage(''), 5000);
    } catch (err) {
      alert('Erro ao salvar no servidor: ' + (err.message || 'Falha de conexão'));
    } finally {
      setIsSaving(false);
    }
  };

  // Testar chamada à API da Cielo
  const handleTestCielo = async () => {
    setIsTestingCielo(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/cielo/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentMethod: 'credit_card',
          totalAmount: 1.00,
          customer: {
            name: 'Teste Master Cielo',
            email: 'admin@seuceu.com.br',
            cpf: '11111111111',
            phone: '47999999999'
          },
          shippingAddress: {
            street: 'Av Central',
            number: '100',
            city: 'Balneario Camboriu',
            state: 'SC',
            zipcode: '88330000'
          },
          card: {
            cardNumber: '0000000000000001',
            holder: 'TESTE CIELO MASTER',
            expirationDate: '12/28',
            securityCode: '123'
          },
          items: [{ id: 'test_item', name: 'Simulação Teste Master', price: 1.00, quantity: 1 }]
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTestResult({
          success: true,
          message: data.cielo?.returnMessage || 'Conexão e processamento validados com sucesso!',
          details: data.cielo
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Erro na resposta do gateway.',
          details: data
        });
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Falha de comunicação com o endpoint local: ' + err.message
      });
    } finally {
      setIsTestingCielo(false);
    }
  };

  // Testar conexão com a Google Gemini API
  const handleTestGeminiKey = async () => {
    setIsTestingGemini(true);
    setGeminiTestResult(null);
    try {
      const res = await fetch('/api/gemini/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: config.geminiApiKey })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Falha ao validar a chave da Google Gemini API.');
      }
      setGeminiTestResult({
        success: true,
        message: data.message || 'Chave validada com sucesso!',
        details: data.keyMasked ? `Chave ativa: ${data.keyMasked}` : 'Pronta para uso.'
      });
    } catch (err) {
      setGeminiTestResult({
        success: false,
        message: err.message || 'Erro na validação da chave.'
      });
    } finally {
      setIsTestingGemini(false);
    }
  };

  // Sincronizar Artistas cadastrados
  const handleSyncArtists = async () => {
    try {
      const users = await base44.entities.User.list().catch(() => []);
      const artists = users.filter((u) => u.store_active || u.role === 'artist' || u.role === 'seller');

      if (artists.length === 0) {
        alert('Nenhum artista com loja ativa encontrado no banco no momento.');
        return;
      }

      const existingSub = config.subordinatedPartners || [];
      const newPartners = [...existingSub];

      artists.forEach((art) => {
        const alreadyExists = newPartners.some(
          (p) => p.document === art.cpf || p.pixKey === art.pix_key || p.name === (art.artist_name || art.full_name)
        );

        if (!alreadyExists) {
          newPartners.push({
            id: 'sub_' + (art.id || Date.now()),
            name: art.artist_name || art.full_name || 'Artista Parceiro',
            document: art.cpf || art.cnpj || '000.000.000-00',
            subordinatedMerchantId: 'sub-cielo-' + (art.id ? art.id.slice(0, 8) : Date.now()),
            bankAccount: art.bank_account || 'Pendente de preenchimento',
            pixKey: art.pix_key || art.email || '',
            commissionPercent: 85,
            status: 'active'
          });
        }
      });

      const updated = { ...config, subordinatedPartners: newPartners };
      setConfig(updated);
      await pixService.saveRemoteConfig(updated);
      alert(`Sincronização concluída! ${newPartners.length} parceiros configurados para Split.`);
    } catch (e) {
      alert('Erro na sincronização: ' + e.message);
    }
  };

  // Abrir modal de criação/edição de subordinado
  const handleOpenPartnerModal = (partner = null, index = null) => {
    if (partner) {
      setEditingPartnerIndex(index);
      setPartnerForm({ ...partner });
    } else {
      setEditingPartnerIndex(null);
      setPartnerForm({
        name: '',
        document: '',
        subordinatedMerchantId: '',
        bankAccount: '',
        pixKey: '',
        commissionPercent: 85,
        status: 'active'
      });
    }
    setIsPartnerModalOpen(true);
  };

  const handleSavePartner = () => {
    if (!partnerForm.name.trim()) {
      alert('Informe o Nome / Razão Social do parceiro.');
      return;
    }
    const currentList = [...(config.subordinatedPartners || [])];
    if (editingPartnerIndex !== null) {
      currentList[editingPartnerIndex] = { ...partnerForm };
    } else {
      currentList.push({
        ...partnerForm,
        id: 'sub_' + Date.now()
      });
    }
    const updated = { ...config, subordinatedPartners: currentList };
    setConfig(updated);
    pixService.saveRemoteConfig(updated);
    setIsPartnerModalOpen(false);
  };

  const handleDeletePartner = (index) => {
    if (!confirm('Deseja realmente remover este parceiro subordinado do Split?')) return;
    const currentList = [...(config.subordinatedPartners || [])];
    currentList.splice(index, 1);
    const updated = { ...config, subordinatedPartners: currentList };
    setConfig(updated);
    pixService.saveRemoteConfig(updated);
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-3" />
        <p className="text-sm font-bold text-slate-700">Carregando credenciais de pagamento...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* BANNER PRINCIPAL DE SEGURANÇA */}
      <div className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 font-extrabold uppercase text-[10px] tracking-wider">
                  Gateway Cielo 3.0 &amp; Split Marketplace
                </Badge>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                  <Lock className="w-3 h-3" /> Credenciais Protegidas no Servidor
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Configurações Master de Pagamentos &amp; Split
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Configure as chaves da <strong>Cielo E-commerce API 3.0</strong>, regras de retenção e comissionamento por Split de Marketplace, e a chave Pix oficial.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch md:self-auto">
            <Button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="w-full md:w-auto h-11 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs gap-2 shadow-lg shadow-emerald-900/30"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Salvando no Servidor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Configurações
                </>
              )}
            </Button>
          </div>
        </div>

        {saveSuccessMessage && (
          <div className="mt-4 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{saveSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* NAVEGAÇÃO DE SUB-ABAS */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
        <button
          type="button"
          onClick={() => setActiveSubTab('cielo')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'cielo'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4 text-blue-400" />
          <span>Cielo 3.0 (Master)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('split')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'split'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4 text-pink-400" />
          <span>Split Marketplace</span>
          {config.subordinatedPartners?.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-700 text-[10px] font-black">
              {config.subordinatedPartners.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('pix')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'pix'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <QrCode className="w-4 h-4 text-emerald-500" />
          <span>Pix Oficial BACEN</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('hostgator')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'hostgator'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4 text-amber-500" />
          <span>Backend PHP HostGator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('gemini')}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeSubTab === 'gemini'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Google Gemini IA</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* ABA 1: CONFIGURAÇÕES CIELO E-COMMERCE API 3.0 */}
      {/* ========================================================================= */}
      {activeSubTab === 'cielo' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Credenciais da Loja Master na Cielo
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Obtidas no portal oficial de desenvolvedores da Cielo (https://developercielo.github.io).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  className={
                    config.cieloEnvironment === 'production'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300'
                  }
                >
                  {config.cieloEnvironment === 'production'
                    ? '● Modo Produção (Vendas Reais)'
                    : '● Modo Sandbox (Ambiente de Testes)'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Merchant ID */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Merchant ID (ID do Estabelecimento Master)</span>
                  <span className="text-[10px] text-slate-400 font-mono">UUID</span>
                </Label>
                <Input
                  type="text"
                  placeholder="ex: c839f284-912b-4fa8-b2a0-4357b98f2495"
                  value={config.cieloMerchantId || ''}
                  onChange={(e) => setConfig({ ...config, cieloMerchantId: e.target.value.trim() })}
                  className="h-11 rounded-xl font-mono text-xs"
                />
                <p className="text-[11px] text-slate-500">
                  Identificador fornecido pela Cielo para a conta principal da Céu Criativa.
                </p>
              </div>

              {/* Merchant Key */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Merchant Key (Chave Secreta de Integração)</span>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Server-side only
                  </span>
                </Label>
                <div className="relative">
                  <Input
                    type={showSecretKey ? 'text' : 'password'}
                    placeholder="Chave secreta alfanumérica fornecida pela Cielo"
                    value={config.cieloMerchantKey || ''}
                    onChange={(e) => setConfig({ ...config, cieloMerchantKey: e.target.value.trim() })}
                    className="h-11 rounded-xl font-mono text-xs pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Esta chave é processada exclusivamente no servidor (PHP/Node) e <strong>nunca</strong> é enviada ao navegador do cliente.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Ambiente */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Ambiente da API Cielo</Label>
                <select
                  value={config.cieloEnvironment || 'sandbox'}
                  onChange={(e) => setConfig({ ...config, cieloEnvironment: e.target.value })}
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs bg-white font-bold"
                >
                  <option value="sandbox">Sandbox (Testes sem cobrança real)</option>
                  <option value="production">Produção (Processamento real com cartões)</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Alterne para Produção quando for receber vendas reais de clientes.
                </p>
              </div>

              {/* Soft Descriptor */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Soft Descriptor (Fatura do Cartão)</Label>
                <Input
                  type="text"
                  maxLength={13}
                  placeholder="CEU CRIATIVA"
                  value={config.cieloSoftDescriptor || 'CEU CRIATIVA'}
                  onChange={(e) => setConfig({ ...config, cieloSoftDescriptor: e.target.value.toUpperCase() })}
                  className="h-11 rounded-xl font-bold uppercase text-xs"
                />
                <p className="text-[11px] text-slate-500">
                  Nome curto que aparecerá no extrato do cartão do comprador (máx 13 chars).
                </p>
              </div>

              {/* Parcelamento Máximo */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Parcelamento Máximo no Checkout</Label>
                <select
                  value={config.cieloMaxInstallments || 12}
                  onChange={(e) => setConfig({ ...config, cieloMaxInstallments: Number(e.target.value) })}
                  className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs bg-white font-bold"
                >
                  <option value={1}>1x (À vista apenas)</option>
                  <option value={3}>Até 3x sem juros</option>
                  <option value={6}>Até 6x sem juros</option>
                  <option value={10}>Até 10x sem juros</option>
                  <option value={12}>Até 12x sem juros</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  Define o limite de parcelas disponibilizado para os compradores.
                </p>
              </div>
            </div>

            {/* ÁREA DE TESTE RÁPIDO DO GATEWAY */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Diagnóstico &amp; Teste de Conexão da API Cielo
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Dispara uma requisição de teste para o backend validando o ciclo completo do gateway.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleTestCielo}
                  disabled={isTestingCielo}
                  variant="outline"
                  className="rounded-xl border-slate-300 font-bold text-xs h-10 gap-2 shrink-0 bg-white"
                >
                  {isTestingCielo ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      Testando Gateway...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      Executar Teste de Simulação
                    </>
                  )}
                </Button>
              </div>

              {testResult && (
                <div
                  className={`p-4 rounded-xl text-xs font-bold ${
                    testResult.success
                      ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border border-red-300 text-red-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{testResult.message}</span>
                  </div>
                  {testResult.details && (
                    <pre className="mt-2 p-2.5 rounded-lg bg-black/5 text-[11px] font-mono overflow-x-auto text-slate-800">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: CONFIGURAÇÕES DE SPLIT DE PAGAMENTO (MARKETPLACE CIELO) */}
      {/* ========================================================================= */}
      {activeSubTab === 'split' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Divisão Automática de Pagamentos (Cielo Split Marketplace)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
                  Permite que o valor pago pelo comprador seja automaticamente dividido no momento da transação entre a <strong>Céu Criativa (Master)</strong> e os <strong>Artistas/Parceiros Subordinados</strong>.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!config.splitEnabled}
                    onChange={(e) => setConfig({ ...config, splitEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-bold text-slate-800">Habilitar Split no Checkout</span>
                </label>
              </div>
            </div>

            {/* REGRAS DE RETENÇÃO DA PLATAFORMA */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-4">
              <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-blue-600" />
                Regra Geral de Retenção da Plataforma Master
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Tipo de Retenção da Plataforma</Label>
                  <select
                    value={config.platformFeeType || 'percentage'}
                    onChange={(e) => setConfig({ ...config, platformFeeType: e.target.value })}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs bg-white font-bold"
                  >
                    <option value="percentage">Percentual (%) sobre a venda</option>
                    <option value="fixed">Valor Fixo (R$) por item/pedido</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">
                    {config.platformFeeType === 'percentage' ? 'Percentual Retido pela Master (%)' : 'Valor Fixo Retido (R$)'}
                  </Label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      min="0"
                      max={config.platformFeeType === 'percentage' ? 100 : 9999}
                      value={config.platformFeeValue ?? 15}
                      onChange={(e) => setConfig({ ...config, platformFeeValue: parseFloat(e.target.value) || 0 })}
                      className="h-11 rounded-xl font-bold text-xs"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      {config.platformFeeType === 'percentage' ? '%' : 'R$'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Modo de Repasse ao Parceiro</Label>
                  <select
                    value={config.partnerPayoutMode || 'cielo_split'}
                    onChange={(e) => setConfig({ ...config, partnerPayoutMode: e.target.value })}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs bg-white font-bold"
                  >
                    <option value="cielo_split">Split Automático Cielo (Subordinados)</option>
                    <option value="pix_transfer">Repasse Manual/Automático via PIX</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-blue-800 leading-relaxed">
                💡 <strong>Exemplo de funcionamento:</strong> Em uma camiseta de R$ 100,00 com retenção de 15%, a Céu Criativa retém <strong>R$ 15,00</strong> e o parceiro subordinado recebe <strong>R$ 85,00</strong> diretamente na conta vinculada ao seu <em>MerchantId</em> na Cielo.
              </p>
            </div>

            {/* TABELA DE SUBORDINADOS / PARCEIROS */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Subordinados &amp; Artistas Parceiros Cadastrados
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Lista de estabelecimentos subordinados aptos a receber divisões na API Cielo 3.0.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleSyncArtists}
                    variant="outline"
                    className="h-10 rounded-xl border-slate-300 text-xs font-bold gap-1.5 text-slate-700"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-purple-600" />
                    Sincronizar Artistas da Base
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleOpenPartnerModal()}
                    className="h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Novo Subordinado
                  </Button>
                </div>
              </div>

              {(!config.subordinatedPartners || config.subordinatedPartners.length === 0) ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <Users className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Nenhum parceiro subordinado cadastrado ainda.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Clique em "Novo Subordinado" ou "Sincronizar Artistas da Base" para registrar seu primeiro parceiro de split.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-4">Nome / Razão Social</th>
                        <th className="py-3 px-4">CPF / CNPJ</th>
                        <th className="py-3 px-4">Merchant ID Subordinado</th>
                        <th className="py-3 px-4">Conta Bancária / PIX</th>
                        <th className="py-3 px-4">Comissão (%)</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {config.subordinatedPartners.map((part, idx) => (
                        <tr key={part.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900">{part.name}</td>
                          <td className="py-3 px-4 font-mono">{part.document || '-'}</td>
                          <td className="py-3 px-4 font-mono text-[11px] text-blue-600 font-bold">
                            {part.subordinatedMerchantId || 'Pendente'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-[200px] truncate" title={part.bankAccount || part.pixKey}>
                            {part.bankAccount || part.pixKey || '-'}
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-600">
                            {part.commissionPercent ? `${part.commissionPercent}%` : '85%'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                                part.status === 'active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {part.status === 'active' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenPartnerModal(part, idx)}
                              className="h-7 w-7 p-0 text-slate-500 hover:text-blue-600"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeletePartner(idx)}
                              className="h-7 w-7 p-0 text-slate-500 hover:text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: CONFIGURAÇÕES DE PIX (OFICIAL BACEN & CONTINGÊNCIA) */}
      {/* ========================================================================= */}
      {activeSubTab === 'pix' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Configuração Pix Oficial da Loja Master
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gera QR Code dinâmico e código "Copia e Cola" compatível com o padrão EMV do Banco Central do Brasil.
                </p>
              </div>

              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-xs py-1 px-3">
                ● Padrão BACEN BRCode 100% Funcional
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Formulário PIX */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Tipo de Chave Pix</Label>
                  <select
                    value={config.pixKeyType || 'email'}
                    onChange={(e) => setConfig({ ...config, pixKeyType: e.target.value })}
                    className="w-full h-11 rounded-xl border border-slate-200 px-3 text-xs bg-white font-bold"
                  >
                    <option value="email">E-mail</option>
                    <option value="cpf">CPF (apenas números)</option>
                    <option value="cnpj">CNPJ (apenas números)</option>
                    <option value="phone">Celular / WhatsApp com DDD</option>
                    <option value="random">Chave Aleatória (EVP)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Chave Pix de Recebimento</Label>
                  <Input
                    type="text"
                    placeholder="felipeatmaag@gmail.com ou CNPJ"
                    value={config.pixKey || ''}
                    onChange={(e) => {
                      const updated = { ...config, pixKey: e.target.value.trim() };
                      setConfig(updated);
                      generatePixSample(updated);
                    }}
                    className="h-11 rounded-xl font-mono text-xs font-bold"
                    required
                  />
                  <p className="text-[11px] text-slate-500">
                    O valor total do Pix no checkout é direcionado diretamente para esta conta bancária.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Nome do Titular</Label>
                    <Input
                      type="text"
                      maxLength={25}
                      placeholder="FELIPE SILVERIO CEU"
                      value={config.merchantName || 'FELIPE SILVERIO CEU'}
                      onChange={(e) => {
                        const updated = { ...config, merchantName: e.target.value.toUpperCase() };
                        setConfig(updated);
                        generatePixSample(updated);
                      }}
                      className="h-11 rounded-xl uppercase text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Cidade do Titular</Label>
                    <Input
                      type="text"
                      maxLength={15}
                      placeholder="BALNEARIO CAMBORIU"
                      value={config.merchantCity || 'BALNEARIO CAMBORIU'}
                      onChange={(e) => {
                        const updated = { ...config, merchantCity: e.target.value.toUpperCase() };
                        setConfig(updated);
                        generatePixSample(updated);
                      }}
                      className="h-11 rounded-xl uppercase text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">WhatsApp de Notificação / Comprovantes</Label>
                  <Input
                    type="text"
                    placeholder="5547999999999"
                    value={config.whatsapp || ''}
                    onChange={(e) => setConfig({ ...config, whatsapp: e.target.value.replace(/\D/g, '') })}
                    className="h-11 rounded-xl text-xs font-bold"
                  />
                  <p className="text-[11px] text-slate-500">
                    O cliente receberá um botão para enviar o comprovante Pix diretamente para este número.
                  </p>
                </div>
              </div>

              {/* Pré-visualização ao vivo do QR Code */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
                <span className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-3">
                  Pré-visualização do QR Code Gerado
                </span>

                {pixSample?.qrCodeUrl ? (
                  <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md mb-3">
                    <img
                      src={pixSample.qrCodeUrl}
                      alt="QR Code Pix"
                      className="w-48 h-48 object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-2xl bg-slate-200 animate-pulse mb-3" />
                )}

                <div className="text-xs text-slate-600 space-y-0.5 mb-3">
                  <p className="font-bold text-slate-900">{config.merchantName}</p>
                  <p className="font-mono text-[11px] text-slate-500">{config.pixKey}</p>
                  <p className="text-[10px] text-slate-400">{config.merchantCity} • Brasil</p>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (pixSample?.pixCode) {
                      navigator.clipboard.writeText(pixSample.pixCode);
                      setCopiedPix(true);
                      setTimeout(() => setCopiedPix(false), 3000);
                    }
                  }}
                  className="rounded-xl border-slate-300 text-xs font-bold gap-1.5"
                >
                  {copiedPix ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Código Pix Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Código Copia-e-Cola de Teste
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: BACKEND PHP HOSTGATOR (ARQUITETURA & HOSPEDAGEM) */}
      {/* ========================================================================= */}
      {activeSubTab === 'hostgator' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Server className="w-5 h-5 text-amber-500" />
                  Arquitetura de Pagamentos no Apache / cPanel HostGator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Como o backend PHP processa as transações com segurança máxima no seu servidor de hospedagem.
                </p>
              </div>

              <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-bold text-xs py-1 px-3">
                ● Pronto para public_html
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4 text-blue-600" />
                  Estrutura de Arquivos Criada
                </h4>
                <ul className="text-xs text-slate-700 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-emerald-600 font-bold">/api/processar-pagamento.php</span>
                    <span className="text-slate-500">— Endpoint cURL seguro para a Cielo 3.0 e cálculo de Split.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-emerald-600 font-bold">/api/config-pagamento.php</span>
                    <span className="text-slate-500">— Carrega e salva as configurações de pagamento.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-emerald-600 font-bold">/api/payment_config.json</span>
                    <span className="text-slate-500">— Arquivo persistente protegido no disco do servidor.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-emerald-600 font-bold">/api/.htaccess</span>
                    <span className="text-slate-500">— Regra de segurança bloqueando downloads de arquivos .json.</span>
                  </li>
                </ul>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
                <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  Garantia de Segurança &amp; PCI-DSS
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  ✓ O <strong>Merchant Key</strong> da Cielo é armazenado no servidor e <strong>nunca trafega</strong> pelo JavaScript do navegador do cliente.<br />
                  ✓ As chamadas cURL para os servidores da Cielo utilizam criptografia TLS 1.2+ obrigatória.<br />
                  ✓ O arquivo <em>payment_config.json</em> possui bloqueio HTTP direto no <em>.htaccess</em>, impedindo que qualquer usuário leia suas credenciais pela URL.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs font-mono space-y-2">
              <p className="text-slate-400 font-bold">// Exemplo de chamada CURL gerada automaticamente pelo PHP na HostGator:</p>
              <p className="text-emerald-400">
                POST https://api.cieloecommerce.cielo.com.br/1/sales/
              </p>
              <p className="text-slate-300">
                MerchantId: {config.cieloMerchantId ? config.cieloMerchantId.slice(0, 8) + '...' : '(Definido no painel)'}<br />
                MerchantKey: [PROTEGIDO NO SERVIDOR - NÃO EXPOSTO NO FRONTEND]<br />
                Content-Type: application/json
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 5: CONFIGURAÇÕES GOOGLE GEMINI IA */}
      {/* ========================================================================= */}
      {activeSubTab === 'gemini' && (
        <div className="space-y-6">
          <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Google Gemini API (Geração de Estampas &amp; IA Criativa)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chave de API do Google Gemini utilizada no Estúdio de Criação, aprimoramento de prompts e vetorização automática de decalques.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  className={
                    config.geminiApiKey?.trim()
                      ? 'bg-purple-100 text-purple-800 border-purple-300 font-bold'
                      : 'bg-slate-100 text-slate-700 border-slate-300 font-bold'
                  }
                >
                  {config.geminiApiKey?.trim() ? '● Chave Personalizada Ativa' : '● Chave Padrão do Projeto'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-slate-800">
                    Chave Secreta da API Gemini (GEMINI_API_KEY)
                  </Label>
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-purple-600 hover:text-purple-800 font-semibold underline"
                  >
                    Gerar chave no Google AI Studio ↗
                  </a>
                </div>

                <div className="relative">
                  <Input
                    type={showGeminiKey ? 'text' : 'password'}
                    placeholder="AIzaSy..."
                    value={config.geminiApiKey || ''}
                    onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value.trim() })}
                    className="h-11 rounded-xl text-xs font-mono pr-20"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setShowGeminiKey(!showGeminiKey)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      title={showGeminiKey ? 'Ocultar chave' : 'Exibir chave'}
                    >
                      {showGeminiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Para gerar imagens por IA sem limite de cota, certifique-se de que o seu projeto no Google AI Studio possui créditos pré-pagos ou faturamento ativado (Pay-as-you-go).
                </p>
              </div>

              {/* Botão de teste e status da chave */}
              <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestGeminiKey}
                  disabled={isTestingGemini}
                  className="rounded-xl border-purple-200 text-purple-700 hover:bg-purple-50 hover:text-purple-900 text-xs font-bold h-10"
                >
                  {isTestingGemini ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin text-purple-600" />
                      Testando Conexão com Gemini...
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5 mr-2 text-purple-600" />
                      Testar Conexão com a API Gemini
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={isSaving}
                  className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold h-10 px-6 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 mr-2" />
                  Salvar Chave
                </Button>
              </div>

              {geminiTestResult && (
                <div
                  className={`p-4 rounded-2xl border text-xs font-medium space-y-1 ${
                    geminiTestResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold">
                    {geminiTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{geminiTestResult.message}</span>
                  </div>
                  {geminiTestResult.details && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 pl-6">
                      {geminiTestResult.details}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-amber-500" />
                  Persistência na HostGator
                </h4>
                <p className="text-slate-600 leading-relaxed">
                  A chave inserida acima é salva no arquivo seguro <code>/api/payment_config.json</code> e lida diretamente pelo script PHP <code>/api/config.php</code> na sua hospedagem cPanel HostGator, sem depender do Node.js em produção.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-2">
                <h4 className="font-bold text-purple-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  Modo de Demonstração Ativo
                </h4>
                <p className="text-purple-800 leading-relaxed">
                  Caso a cota da API termine ou os créditos expirem, a aplicação disponibiliza automaticamente o carregamento de estampas vetoriais em alta definição pré-renderizadas, garantindo que nenhum cliente fique bloqueado.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADICIONAR / EDITAR SUBORDINADO */}
      <Dialog open={isPartnerModalOpen} onOpenChange={setIsPartnerModalOpen}>
        <DialogContent className="max-w-md rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              {editingPartnerIndex !== null ? 'Editar Subordinado de Split' : 'Cadastrar Parceiro Subordinado'}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Preencha os dados do parceiro/artista para configurar a divisão automática na Cielo 3.0.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Nome / Razão Social</Label>
              <Input
                type="text"
                placeholder="ex: Ateliê Arte & Co"
                value={partnerForm.name}
                onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">CPF ou CNPJ</Label>
                <Input
                  type="text"
                  placeholder="000.000.000-00"
                  value={partnerForm.document}
                  onChange={(e) => setPartnerForm({ ...partnerForm, document: e.target.value })}
                  className="h-10 rounded-xl text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Comissão do Parceiro (%)</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={partnerForm.commissionPercent}
                  onChange={(e) => setPartnerForm({ ...partnerForm, commissionPercent: Number(e.target.value) })}
                  className="h-10 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">MerchantId Subordinado da Cielo</Label>
              <Input
                type="text"
                placeholder="ex: sub-cielo-12345"
                value={partnerForm.subordinatedMerchantId}
                onChange={(e) => setPartnerForm({ ...partnerForm, subordinatedMerchantId: e.target.value.trim() })}
                className="h-10 rounded-xl text-xs font-mono text-blue-600"
              />
              <p className="text-[10px] text-slate-400">
                Código gerado pela Cielo para o estabelecimento subordinado do parceiro.
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Conta Bancária (Banco / Ag / CC)</Label>
              <Input
                type="text"
                placeholder="ex: Nubank (260) Ag 0001 CC 12345-6"
                value={partnerForm.bankAccount}
                onChange={(e) => setPartnerForm({ ...partnerForm, bankAccount: e.target.value })}
                className="h-10 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Chave PIX do Parceiro (Opcional)</Label>
              <Input
                type="text"
                placeholder="artista@email.com"
                value={partnerForm.pixKey}
                onChange={(e) => setPartnerForm({ ...partnerForm, pixKey: e.target.value.trim() })}
                className="h-10 rounded-xl text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Status</Label>
              <select
                value={partnerForm.status}
                onChange={(e) => setPartnerForm({ ...partnerForm, status: e.target.value })}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 text-xs bg-white font-bold"
              >
                <option value="active">Ativo (Participa do Split)</option>
                <option value="inactive">Inativo (Pausado)</option>
              </select>
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-slate-100 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPartnerModalOpen(false)}
              className="rounded-xl text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSavePartner}
              className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold"
            >
              Salvar Subordinado
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
