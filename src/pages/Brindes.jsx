import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Gift, Sparkles, Trophy, ShoppingBag, CheckCircle, Zap } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Brindes() {
  const queryClient = useQueryClient();
  const [selectedReward, setSelectedReward] = useState(null);
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);
  const [address, setAddress] = useState({
    street: '', number: '', city: '', state: '', zipcode: ''
  });

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: loyaltyData } = useQuery({
    queryKey: ['loyalty', user?.email],
    queryFn: async () => {
      const records = await base44.entities.LoyaltyPoint.filter({ user_email: user.email });
      return records[0] || { points: 0, user_email: user.email };
    },
    enabled: !!user,
  });

  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => base44.entities.Reward.filter({ is_active: true }, '-points_cost'),
  });

  const redeemMutation = useMutation({
    mutationFn: async ({ reward, address }) => {
      await base44.entities.RewardRedemption.create({
        user_email: user.email,
        reward_id: reward.id,
        reward_title: reward.title,
        points_spent: reward.points_cost,
        shipping_address: address
      });
      
      const newPoints = (loyaltyData?.points || 0) - reward.points_cost;
      if (loyaltyData?.id) {
        await base44.entities.LoyaltyPoint.update(loyaltyData.id, {
          points: newPoints,
          points_spent_total: (loyaltyData.points_spent_total || 0) + reward.points_cost
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['loyalty']);
      setShowRedeemDialog(false);
      setSelectedReward(null);
    },
  });

  const handleRedeem = () => {
    if (!address.street || !address.city || !address.state || !address.zipcode) {
      alert('Preencha todos os campos do endereço');
      return;
    }
    redeemMutation.mutate({ reward: selectedReward, address });
  };

  const categories = [
    { value: 'todos', label: 'Todos', icon: Gift },
    { value: 'adesivos', label: 'Adesivos', icon: Sparkles },
    { value: 'chaveiros', label: 'Chaveiros', icon: Trophy },
    { value: 'camisetas', label: 'Camisetas', icon: ShoppingBag },
    { value: 'exclusivos', label: 'Exclusivos', icon: Zap },
  ];

  const [selectedCategory, setSelectedCategory] = useState('todos');
  const filteredRewards = selectedCategory === 'todos' 
    ? rewards 
    : rewards.filter(r => r.category === selectedCategory);

  const userPoints = loyaltyData?.points || 0;

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-emerald-400 text-sm font-medium mb-4 hover-glow">
            <Gift className="w-4 h-4" />
            Programa de Fidelidade
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
            Brindes Exclusivos
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Use seus pontos para resgatar produtos exclusivos da Céu
          </p>

          {/* Points Balance */}
          <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl ceu-gradient text-white shadow-xl hover-glow">
            <Trophy className="w-6 h-6" />
            <div className="text-left">
              <p className="text-sm opacity-90">Seus Pontos</p>
              <p className="text-3xl font-bold">{userPoints}</p>
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-6 py-3 rounded-xl font-medium transition-all hover-glow ${
                  selectedCategory === cat.value
                    ? 'ceu-gradient text-white'
                    : 'glass-card text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 inline mr-2" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Rewards Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-3xl p-6">
                <Skeleton className="aspect-square rounded-2xl mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRewards.map((reward, index) => {
              const canAfford = userPoints >= reward.points_cost;
              return (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-3xl overflow-hidden hover-glow group"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={reward.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400'}
                      alt={reward.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-1">{reward.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {reward.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-400">{reward.points_cost}</p>
                        <p className="text-xs text-gray-500">pontos</p>
                      </div>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{reward.description}</p>
                    <Button
                      onClick={() => {
                        setSelectedReward(reward);
                        setShowRedeemDialog(true);
                      }}
                      disabled={!canAfford || reward.stock === 0}
                      className={`w-full rounded-xl ${
                        canAfford && reward.stock > 0
                          ? 'ceu-gradient text-white hover-glow'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {reward.stock === 0 ? (
                        'Esgotado'
                      ) : !canAfford ? (
                        `Faltam ${reward.points_cost - userPoints} pontos`
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Resgatar
                        </>
                      )}
                    </Button>
                    {reward.stock > 0 && reward.stock <= 10 && (
                      <p className="text-xs text-yellow-500 mt-2 text-center">
                        Apenas {reward.stock} restantes!
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Redeem Dialog */}
        <Dialog open={showRedeemDialog} onOpenChange={setShowRedeemDialog}>
          <DialogContent className="glass-card border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-2xl">Resgatar {selectedReward?.title}</DialogTitle>
              <DialogDescription className="text-gray-400">
                Confirme seu endereço de entrega para continuar
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="text-white mb-2 block">Rua</Label>
                  <Input
                    value={address.street}
                    onChange={(e) => setAddress({...address, street: e.target.value})}
                    className="glass-card border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">Número</Label>
                  <Input
                    value={address.number}
                    onChange={(e) => setAddress({...address, number: e.target.value})}
                    className="glass-card border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">CEP</Label>
                  <Input
                    value={address.zipcode}
                    onChange={(e) => setAddress({...address, zipcode: e.target.value})}
                    className="glass-card border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">Cidade</Label>
                  <Input
                    value={address.city}
                    onChange={(e) => setAddress({...address, city: e.target.value})}
                    className="glass-card border-white/10 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white mb-2 block">Estado</Label>
                  <Input
                    value={address.state}
                    onChange={(e) => setAddress({...address, state: e.target.value})}
                    className="glass-card border-white/10 text-white"
                  />
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 bg-emerald-500/10 border-emerald-500/20">
                <p className="text-sm text-emerald-400">
                  Você gastará <span className="font-bold">{selectedReward?.points_cost} pontos</span>.
                  Saldo após resgate: <span className="font-bold">{userPoints - (selectedReward?.points_cost || 0)} pontos</span>
                </p>
              </div>
              <Button
                onClick={handleRedeem}
                disabled={redeemMutation.isPending}
                className="w-full ceu-gradient text-white rounded-xl h-12 hover-glow"
              >
                {redeemMutation.isPending ? 'Processando...' : 'Confirmar Resgate'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}