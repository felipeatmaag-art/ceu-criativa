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
  Sparkles,
  Save
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

  useEffect(() => {
    setPaymentConfig(pixService.getConfig());
  }, []);

  const handleSavePaymentConfig = (e) => {
    e.preventDefault();
    pixService.saveConfig(paymentConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
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

          <form onSubmit={handleSavePaymentConfig} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-300 font-bold">Chave Pix da Loja</Label>
              <Input
                type="text"
                placeholder="ex: felipeatmaag@gmail.com, CNPJ ou Celular"
                value={paymentConfig.pixKey}
                onChange={(e) => setPaymentConfig({ ...paymentConfig, pixKey: e.target.value })}
                className="h-11 rounded-xl bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-emerald-500"
                required
              />
              <p className="text-[11px] text-gray-400">
                Pode ser e-mail, CPF, CNPJ, telefone com DDD ou chave aleatória.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-300 font-bold">Nome do Titular do Pix</Label>
                <Input
                  type="text"
                  placeholder="ex: FELIPE SILVERIO"
                  value={paymentConfig.merchantName}
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
                  value={paymentConfig.merchantCity}
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
                  value={paymentConfig.whatsapp}
                  onChange={(e) => setPaymentConfig({ ...paymentConfig, whatsapp: e.target.value.replace(/\D/g, '') })}
                  className="h-11 rounded-xl bg-white/5 border-white/10 text-white text-sm"
                  required
                />
              </div>
              <p className="text-[11px] text-gray-400">
                O cliente terá um botão direto no checkout para enviar o comprovante Pix para este WhatsApp.
              </p>
            </div>

            {/* Como Plugar Gateway (Mercado Pago / Asaas / Cielo) */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-2 mt-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" /> Como conectar outros Gateways:
              </div>
              <p className="text-xs text-gray-300 leading-relaxed">
                • <strong>Pix Direto (Já ativo):</strong> O cliente paga pelo QR Code instantâneo com 5% de desconto e o valor cai 100% na sua conta sem taxas de intermediários.
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">
                • <strong>Mercado Pago / Asaas:</strong> Para cartão com aprovação automática em 12x, crie uma aplicação em <em>mercadopago.com.br/developers</em> e adicione as chaves de API nas variáveis do servidor.
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">
                • <strong>Cielo E-commerce 3.0:</strong> O sistema já possui o módulo Cielo preparado com suporte a MerchantId e MerchantKey.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-3">
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
    </div>
  );
}