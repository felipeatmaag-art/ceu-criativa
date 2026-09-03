import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  User, 
  Camera, 
  Instagram, 
  Twitter, 
  Globe,
  Save,
  Loader2,
  BadgeCheck,
  Palette,
  DollarSign,
  Heart
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FinancialDashboard from '@/components/financial/FinancialDashboard';

export default function Profile() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    artist_name: '',
    bio: '',
    social_instagram: '',
    social_twitter: '',
    social_portfolio: '',
    artist_commission_rate: 25
  });
  const [isUploading, setIsUploading] = useState(false);

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  useEffect(() => {
    if (user) {
      setFormData({
        artist_name: user.artist_name || '',
        bio: user.bio || '',
        social_instagram: user.social_instagram || '',
        social_twitter: user.social_twitter || '',
        social_portfolio: user.social_portfolio || '',
        artist_commission_rate: user.artist_commission_rate || 25
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.auth.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      if (result?.file_url) {
        await base44.auth.updateMe({ avatar_url: result.file_url });
        queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
    setIsUploading(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 to-white py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Meu Perfil
          </h1>
          <p className="text-gray-500">
            Personalize seu perfil de artista
          </p>
        </motion.div>

        <FinancialDashboard />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      R$ {(user?.total_earnings || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Ganhos Totais</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Palette className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {user?.total_sales || 0}
                    </p>
                    <p className="text-sm text-gray-500">Vendas</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {user?.followers_count || 0}
                    </p>
                    <p className="text-sm text-gray-500">Seguidores</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {user?.is_verified_artist && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <BadgeCheck className="w-6 h-6 text-blue-600" />
                    <span className="font-medium text-blue-700">Artista Verificado</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-2xl ceu-gradient flex items-center justify-center overflow-hidden">
                        {user?.avatar_url ? (
                          <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-white" />
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors">
                        {isUploading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Camera className="w-5 h-5 text-gray-600" />
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarUpload}
                          className="hidden"
                          disabled={isUploading}
                        />
                      </label>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{user?.full_name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>

                  {/* Artist Name */}
                  <div>
                    <Label className="text-base font-medium">Nome Artístico</Label>
                    <Input
                      placeholder="Como você quer ser conhecido?"
                      value={formData.artist_name}
                      onChange={(e) => setFormData({...formData, artist_name: e.target.value})}
                      className="mt-2 h-12 rounded-xl"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <Label className="text-base font-medium">Biografia</Label>
                    <Textarea
                      placeholder="Conte sua história como artista..."
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="mt-2 h-32 rounded-xl resize-none"
                    />
                  </div>

                  {/* Social Links */}
                  <div className="space-y-4">
                    <Label className="text-base font-medium">Redes Sociais</Label>
                    
                    <div className="relative">
                      <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        placeholder="Link do Instagram"
                        value={formData.social_instagram}
                        onChange={(e) => setFormData({...formData, social_instagram: e.target.value})}
                        className="pl-12 h-12 rounded-xl"
                      />
                    </div>

                    <div className="relative">
                      <Twitter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        placeholder="Link do Twitter/X"
                        value={formData.social_twitter}
                        onChange={(e) => setFormData({...formData, social_twitter: e.target.value})}
                        className="pl-12 h-12 rounded-xl"
                      />
                    </div>

                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        placeholder="Link do seu portfólio"
                        value={formData.social_portfolio}
                        onChange={(e) => setFormData({...formData, social_portfolio: e.target.value})}
                        className="pl-12 h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Commission Rate */}
                  <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
                    <Label className="text-base font-medium mb-2 block">
                      Taxa de Comissão (%)
                    </Label>
                    <p className="text-sm text-gray-600 mb-4">
                      Percentual que você receberá de cada venda dos seus designs
                    </p>
                    <div className="flex items-center gap-4">
                      <Input
                        type="number"
                        min="10"
                        max="50"
                        value={formData.artist_commission_rate}
                        onChange={(e) => setFormData({...formData, artist_commission_rate: Number(e.target.value)})}
                        className="rounded-xl w-24 text-center text-lg font-bold"
                      />
                      <span className="text-2xl font-bold ceu-text-gradient">{formData.artist_commission_rate}%</span>
                    </div>
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <p className="text-xs text-gray-500 mb-2">Seus ganhos estimados por venda:</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Camiseta (R$ 79,90):</span>
                          <span className="font-medium text-green-600">R$ {(79.90 * (formData.artist_commission_rate / 100)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Caneca (R$ 49,90):</span>
                          <span className="font-medium text-green-600">R$ {(49.90 * (formData.artist_commission_rate / 100)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quadro (R$ 129,90):</span>
                          <span className="font-medium text-green-600">R$ {(129.90 * (formData.artist_commission_rate / 100)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Boné (R$ 59,90):</span>
                          <span className="font-medium text-green-600">R$ {(59.90 * (formData.artist_commission_rate / 100)).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="w-full h-14 rounded-xl ceu-gradient text-white text-lg"
                  >
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>

                  {updateMutation.isSuccess && (
                    <p className="text-center text-green-600 font-medium">
                      ✓ Perfil atualizado com sucesso!
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}