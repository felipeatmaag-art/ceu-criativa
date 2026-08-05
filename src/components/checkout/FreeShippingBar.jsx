import React from 'react';
import { Truck } from 'lucide-react';
import { motion } from 'framer-motion';

const THRESHOLD = 100;

export default function FreeShippingBar({ subtotal }) {
  if (subtotal <= 0) return null;
  const remaining = Math.max(0, THRESHOLD - subtotal);
  const progress = Math.min(100, (subtotal / THRESHOLD) * 100);
  const isFree = remaining === 0;

  return (
    <div className={`rounded-2xl p-4 border ${isFree ? 'bg-emerald-50 border-emerald-100' : 'bg-blue-50/60 border-blue-100'}`}>
      <div className="flex items-center gap-2 mb-2">
        <Truck className={`w-4 h-4 ${isFree ? 'text-emerald-600' : 'text-blue-600'}`} />
        <p className="text-sm font-medium text-gray-900">
          {isFree ? (
            <>Você ganhou <span className="text-emerald-700 font-semibold">frete grátis!</span> 🎉</>
          ) : (
            <>
              Faltam <span className="text-blue-700 font-semibold">R$ {remaining.toFixed(2)}</span> para frete grátis
            </>
          )}
        </p>
      </div>
      <div className="h-2 bg-white rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isFree ? 'bg-emerald-500' : 'bg-blue-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export const FREE_SHIPPING_THRESHOLD = THRESHOLD;