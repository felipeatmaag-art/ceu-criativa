import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Trophy, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PointsDisplay() {
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: loyaltyData } = useQuery({
    queryKey: ['loyalty', user?.email],
    queryFn: async () => {
      const records = await base44.entities.LoyaltyPoint.filter({ user_email: user.email });
      return records[0] || { points: 0 };
    },
    enabled: !!user,
  });

  if (!user || !loyaltyData) return null;

  return (
    <Link to={createPageUrl('Brindes')}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="glass-card rounded-2xl p-4 hover-glow cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl ceu-gradient flex items-center justify-center">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-400">Seus Pontos</p>
            <p className="text-2xl font-bold text-white">{loyaltyData.points || 0}</p>
          </div>
          <ArrowRight className="w-5 h-5 text-emerald-400" />
        </div>
      </motion.div>
    </Link>
  );
}