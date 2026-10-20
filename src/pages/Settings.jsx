import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User,
  Bell,
  CreditCard,
  Shield,
  LogOut,
  ChevronRight,
  Palette,
  Mail,
  CheckCircle2,
  Save,
  Database,
  Download,
  UploadCloud,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { pixService, DEFAULT_PAYMENT_CONFIG } from '@/services/pixService';
import { useAuth } from '@/lib/AuthContext';

export default function Settings() {
  const { logout, user } = useAuth();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentConfig, setPaymentConfig] = useState(DEFAULT_PAYMENT_CONFIG);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activePaymentTab, setActivePaymentTab] = useState('pix');

  useEffect(() => {
    pixService.fetchRemoteConfig().then((cfg) => {
      if (cfg) setPaymentConfig(cfg);
    });
  }, []);

  const handleSavePaymentConfig = async (e) => {
    e.preventDefault();
    await pixService.saveRemoteConfig(paymentConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [backupSummary, setBackupSummary] = useState(null);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [backupStatusMsg, setBackupStatusMsg] = useState('');
  const [importingFile, setImportingFile] = useState(false);

  const loadBackupSummary = async () => {
    setIsBackupLoading(true);
    try {
      const res = await fetch('/api/backup/summary');
      if (res.ok) {
        const data = await res.json();
        setBackupSummary(data);
      }
    } catch (err) {
      console.warn('Erro ao carregar resumo do backup:', err);
    } finally {
      setIsBackupLoading(false);
    }
  };

  const handleDownloadBackup = () => {
    window.location.href = '/api/backup/export';
    setBackupStatusMsg('Download iniciado com sucesso! Guarde este arquivo em segurança.');
    setTimeout(() => setBackupStatusMsg(''), 5000);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportingFile(true);
    setBackupStatusMsg('');
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const res = await fetch('/api/backup/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Falha ao restaurar');
      setBackupStatusMsg('Backup restaurado com sucesso! Seus dados foram atualizados.');
      await loadBackupSummary();
      setTimeout(() => setBackupStatusMsg(''), 5000);
    } catch (err) {
      setBackupStatusMsg(`Erro ao restaurar: ${err.message || 'Arquivo inválido'}`);
    } finally {
      setImportingFile(false);
      e.target.value = '';
    }
  };

  const menuItems = [
    {
      id: 'profile',
      title: 'Meu Perfil',
      description: 'Edite suas informações e redes sociais',
      icon: User,
      page: 'Profile',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'designs',
      title: 'Minhas Estampas',
      description: 'Gerencie seus designs e produtos',
      icon: Palette,
      page: 'MyDesigns',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 'payment',
      title: 'Pagamentos & Chave Pix',
      description: 'Configure a chave Pix e integração de recebimento da loja',
      icon: CreditCard,
      action: () => setIsPaymentModalOpen(true),
      color: 'bg-emerald-100 text-emerald-600'
    },
    {
      id: 'backup',
      title: 'Segurança & Backup dos Dados',
      description: 'Baixe cópia de clientes, produtos e estampas em 1 clique',
      icon: Database,
      action: () => {
        loadBackupSummary();
        setIsBackupModalOpen(true);
      },
      color: 'bg-cyan-500/20 text-cyan-400'
    },
    {
      id: 'privacy',
      title: 'Privacidade & Termos',
      description: 'Configurações de privacidade e dados',
      icon: Shield,
      page: 'Terms',
      color: 'bg-blue-100 text-blue-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#0d0e15] to-[#0a0a0f] text-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
              Painel de Ajustes
            </span>
          </div>
          <h1 className="text-3xl font-black text-white">Configurações da Conta</h1>
          <p className="text-gray-400 mt-1">
            Gerencie sua conta, chave de pagamentos e preferências da Céu Criativa
          </p>
        </motion.div>

        <div className="space-y-4">
          {/* Menu Items */}
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div 
                  onClick={item.action}
                  className="p-4 rounded-2xl bg-[#12131c] border border-white/10 hover:border-emerald-500/40 transition-all cursor-pointer flex items-center gap-4 hover:shadow-lg shadow-black/40 group"
                >
                  <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 truncate">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            );

            return item.page ? (
              <Link key={item.id} to={createPageUrl(item.page)}>
                {content}
              </Link>
            ) : (
              <div key={item.id}>{content}</div>
            );
          })}

          {/* Notifications Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="rounded-2xl bg-[#12131c] border border-white/10 p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Notificações da Plataforma</h3>
                  <p className="text-xs text-gray-400">Configure avisos de vendas e novidades</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Notificações por e-mail</span>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-gray-300">Avisos de nova venda aprovada</span>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outline"
              onClick={() => logout()}
              className="w-full h-12 rounded-xl text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair da Conta ({user?.full_name || 'Desconectar'})
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Modal de Configuração de Pagamento */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-xl bg-[#0d0e15] text-white border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-left space-y-1 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </span>
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-bold">
                Recebimentos Céu Criativa
              </span>
            </div>
            <DialogTitle className="text-2xl font-black text-white">
              Configurações de Pagamento & Pix
            </DialogTitle>
            <DialogDescription className="text-gray-400 text-sm">
              Defina a chave Pix para onde o valor das vendas e pedidos do site será creditado.
            </DialogDescription>
          </DialogHeader>

          {saveSuccess && (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-sm font-medium">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>Configurações de pagamento salvas com sucesso!</span>
            </div>
          )}

          {/* Abas Pix vs Cartão Cielo */}
          <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl mb-4">
            <button
              type="button"
              onClick={() => setActivePaymentTab('pix')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePaymentTab === 'pix'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💠 Pix Oficial da Loja
            </button>
            <button
              type="button"
              onClick={() => setActivePaymentTab('cielo')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activePaymentTab === 'cielo'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              💳 Cartão de Crédito Cielo
            </button>
          </div>

          <form onSubmit={handleSavePaymentConfig} className="space-y-4">
            {activePaymentTab === 'pix' ? (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-300 font-bold">Chave Pix da Loja (Recebimento Centralizado Atma)</Label>
                  <Input
                    type="text"
                    placeholder="ex: felipeatmaag@gmail.com, CNPJ ou Celular"
                    value={paymentConfig.pixKey || ''}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, pixKey: e.target.value })}
                    className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500 font-mono text-xs"
                    required
                  />
                  <p className="text-[11px] text-gray-400">
                    O valor total pago pelos clientes no checkout cai diretamente nesta conta oficial.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-300 font-bold">Nome do Titular do Pix</Label>
                    <Input
                      type="text"
                      placeholder="ex: FELIPE SILVERIO"
                      value={paymentConfig.merchantName || ''}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, merchantName: e.target.value.toUpperCase() })}
                      className="h-11 rounded-xl bg-white/5 border-white/10 text-white uppercase text-sm"
                      maxLength={25}
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-300 font-bold">Cidade do Titular</Label>
                    <Input
                      type="text"
                      placeholder="ex: BALNEARIO CAMBORIU"
                      value={paymentConfig.merchantCity || ''}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, merchantCity: e.target.value.toUpperCase() })}
                      className="h-11 rounded-xl bg-white/5 border-white/10 text-white uppercase text-sm"
                      maxLength={15}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-300 font-bold">WhatsApp para Notificação de Vendas</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="ex: 5547999999999 (com código do país e DDD)"
                      value={paymentConfig.whatsapp || ''}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, whatsapp: e.target.value.replace(/\D/g, '') })}
                      className="h-11 rounded-xl bg-white/5 border-white/10 text-white text-sm"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-gray-400">
                    O cliente terá um botão direto no checkout para enviar o comprovante Pix para este WhatsApp.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 leading-relaxed">
                  💡 <strong>Como funciona o Cartão Cielo:</strong> Cadastre seu <em>Merchant ID</em> e <em>Merchant Key</em> da Cielo E-commerce 3.0 para receber pagamentos em até 12x no cartão com autorização direta.
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-300 font-bold">Cielo Merchant ID</Label>
                  <Input
                    type="text"
                    placeholder="ex: c839f284-912b-4fa8-b2a0-4357b98f2495"
                    value={paymentConfig.cieloMerchantId || ''}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, cieloMerchantId: e.target.value })}
                    className="h-11 rounded-xl bg-white/5 border-white/10 text-white font-mono text-xs placeholder:text-gray-500"
                  />
                  <p className="text-[11px] text-gray-400">
                    ID do estabelecimento fornecido no portal Cielo Desenvolvedores.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-300 font-bold">Cielo Merchant Key</Label>
                  <Input
                    type="password"
                    placeholder="Chave secreta de autenticação da Cielo"
                    value={paymentConfig.cieloMerchantKey || ''}
                    onChange={(e) => setPaymentConfig({ ...paymentConfig, cieloMerchantKey: e.target.value })}
                    className="h-11 rounded-xl bg-white/5 border-white/10 text-white font-mono text-xs placeholder:text-gray-500"
                  />
                  <p className="text-[11px] text-gray-400">
                    Chave secreta para autorização das transações de cartão de crédito.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-300 font-bold">Ambiente da API Cielo</Label>
                    <select
                      value={paymentConfig.cieloEnvironment || 'sandbox'}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, cieloEnvironment: e.target.value })}
                      className="w-full h-11 rounded-xl bg-slate-900 border border-white/10 text-white text-xs px-3"
                    >
                      <option value="sandbox">Sandbox (Ambiente de Testes)</option>
                      <option value="production">Produção (Vendas Reais)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-300 font-bold">Parcelamento Máximo</Label>
                    <select
                      value={paymentConfig.cieloMaxInstallments || 6}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, cieloMaxInstallments: Number(e.target.value) })}
                      className="w-full h-11 rounded-xl bg-slate-900 border border-white/10 text-white text-xs px-3"
                    >
                      <option value={1}>1x (À vista)</option>
                      <option value={3}>Até 3x sem juros</option>
                      <option value={6}>Até 6x sem juros (Padrão)</option>
                      <option value={10}>Até 10x sem juros</option>
                      <option value={12}>Até 12x sem juros</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="pt-3 flex justify-end gap-3 border-t border-white/10">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsPaymentModalOpen(false)}
                className="border-white/10 text-gray-300 rounded-xl"
              >
                Fechar
              </Button>
              <Button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-6"
              >
                <Save className="w-4 h-4 mr-2" /> Salvar Configurações
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Backup & Data Security Modal */}
      <Dialog open={isBackupModalOpen} onOpenChange={setIsBackupModalOpen}>
        <DialogContent className="sm:max-w-xl bg-[#0f111a] border border-white/15 text-white p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Database className="w-4 h-4" />
              </div>
              <DialogTitle className="text-xl font-black text-white">
                Segurança dos Dados & Backup
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-gray-400">
              Gerencie a persistência de clientes, produtos, estampas e pedidos para nunca perder cadastros.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Live Metrics Grid */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-gray-300 flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  Dados Salvos no Sistema
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={loadBackupSummary}
                  disabled={isBackupLoading}
                  className="h-7 text-xs text-cyan-400 hover:text-cyan-300 p-1"
                >
                  <RefreshCw className={`w-3 h-3 mr-1 ${isBackupLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-xl font-black text-white">
                    {backupSummary?.counts?.Product ?? '...'}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Produtos</div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-xl font-black text-pink-400">
                    {backupSummary?.counts?.Design ?? '...'}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Estampas</div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-xl font-black text-emerald-400">
                    {backupSummary?.counts?.User ?? '...'}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Usuários</div>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-white/5">
                  <div className="text-xl font-black text-amber-400">
                    {backupSummary?.counts?.Order ?? '...'}
                  </div>
                  <div className="text-[10px] uppercase font-bold text-gray-400">Pedidos</div>
                </div>
              </div>

              {backupSummary?.exported_at && (
                <div className="mt-3 text-[11px] text-gray-400 flex items-center justify-between">
                  <span>Total de registros no banco: <strong className="text-white">{backupSummary.totalItems}</strong></span>
                  <span>Última checagem: {new Date(backupSummary.exported_at).toLocaleTimeString('pt-BR')}</span>
                </div>
              )}
            </div>

            {/* Status message */}
            {backupStatusMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{backupStatusMsg}</span>
              </div>
            )}

            {/* Actions: Download Backup & Restore */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-1">
                    <Download className="w-4 h-4" />
                    Baixar Cópia (.JSON)
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    Gera um download instantâneo com todos os cadastros atuais da sua loja no seu computador.
                  </p>
                </div>
                <Button
                  onClick={handleDownloadBackup}
                  className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs h-10"
                >
                  <Download className="w-3.5 h-3.5 mr-2" /> Baixar Backup Agora
                </Button>
              </div>

              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-1">
                    <UploadCloud className="w-4 h-4" />
                    Restaurar Backup
                  </div>
                  <p className="text-xs text-gray-400 mb-4">
                    Importe um arquivo JSON salvo anteriormente para restabelecer seus cadastros com segurança.
                  </p>
                </div>
                <label className="w-full">
                  <div className={`w-full bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs h-10 flex items-center justify-center cursor-pointer transition-colors ${importingFile ? 'opacity-50 pointer-events-none' : ''}`}>
                    <UploadCloud className="w-3.5 h-3.5 mr-2" />
                    {importingFile ? 'Restaurando...' : 'Carregar Arquivo .JSON'}
                  </div>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Security Explanation Accordion / Guide */}
            <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <AlertCircle className="w-4 h-4" />
                Como funciona a persistência de dados:
              </div>
              
              <div className="text-xs text-gray-300 space-y-2 leading-relaxed">
                <p>
                  <strong>1. Atualizações aqui no desenvolvedor:</strong> Quando você pede novas telas ou ajustes no código, seus produtos, estampas e usuários permanecem intactos na pasta <code className="bg-white/10 px-1 py-0.5 rounded text-emerald-400">data/entities.json</code> e <code className="bg-white/10 px-1 py-0.5 rounded text-emerald-400">public/uploads/</code>.
                </p>
                <p>
                  <strong>2. Ao subir para o servidor (HostGator/VPS):</strong> Nunca apague ou sobrescreva a pasta <code className="bg-white/10 px-1 py-0.5 rounded text-amber-400">data/</code> nem a pasta <code className="bg-white/10 px-1 py-0.5 rounded text-amber-400">public/uploads/</code> do servidor remoto. Suba apenas a pasta de código compilado (<code className="bg-white/10 px-1 py-0.5 rounded text-blue-400">dist/</code>) ou arquivos de aplicação.
                </p>
                <p>
                  <strong>3. Banco de Dados na Nuvem:</strong> O projeto já conta com o Firebase Firestore conectado para guardar dados na nuvem de forma desacoplada do código.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBackupModalOpen(false)}
                className="border-white/10 text-gray-300 rounded-xl"
              >
                Concluir
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}