import React from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  User,
  Bell,
  CreditCard,
  Shield,
  LogOut,
  ChevronRight,
  Palette,
  Mail
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function Settings() {
  const menuItems = [
    {
      title: 'Meu Perfil',
      description: 'Edite suas informações e redes sociais',
      icon: User,
      page: 'Profile',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Minhas Estampas',
      description: 'Gerencie seus designs e vendas',
      icon: Palette,
      page: 'MyDesigns',
      color: 'bg-pink-100 text-pink-600'
    },
    {
      title: 'Pagamentos',
      description: 'Configure sua conta para receber comissões',
      icon: CreditCard,
      page: null,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Privacidade',
      description: 'Configurações de privacidade e dados',
      icon: Shield,
      page: null,
      color: 'bg-blue-100 text-blue-600'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-500 mt-1">Gerencie sua conta e preferências</p>
        </motion.div>

        <div className="space-y-4">
          {/* Menu Items */}
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const content = (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </CardContent>
                </Card>
              </motion.div>
            );

            return item.page ? (
              <Link key={index} to={createPageUrl(item.page)}>
                {content}
              </Link>
            ) : (
              <div key={index}>{content}</div>
            );
          })}

          {/* Notifications Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                    <Bell className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Notificações</CardTitle>
                    <CardDescription>Configure como deseja ser notificado</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <Label>Notificações por email</Label>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <Label>Novas vendas</Label>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-gray-400" />
                    <Label>Competições</Label>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Logout */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Button
              variant="outline"
              onClick={() => base44.auth.logout()}
              className="w-full h-14 rounded-xl text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Sair da Conta
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}