import { CreditCard, Smartphone, Check } from 'lucide-react';
import { motion } from 'framer-motion';

export const PAYMENT_METHODS = [
  {
    id: 'pix',
    label: 'Pix Instantâneo',
    description: 'Aprovação imediata via QR Code ou Copia e Cola',
    icon: Smartphone,
    badge: '5% OFF',
    discount: 0.05
  },
  {
    id: 'credit',
    label: 'Cartão de Crédito',
    description: 'Até 12x no cartão com processamento seguro',
    icon: CreditCard,
    badge: '12x',
    discount: 0
  }
];

export default function PaymentMethodSelector({ value, onChange }) {
  return (
    <div className="space-y-2.5">
      {PAYMENT_METHODS.map((m) => {
        const Icon = m.icon;
        const active = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={`w-full flex items-center gap-3.5 p-3.5 rounded-2xl border-2 transition-all text-left ${
              active
                ? 'border-emerald-500 bg-emerald-50/80 shadow-sm'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
              active ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'bg-gray-100 text-gray-600'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-gray-900 text-sm">{m.label}</span>
                {m.badge && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                    m.id === 'pix' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {m.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{m.description}</p>
            </div>
            {active && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0 shadow-sm"
              >
                <Check className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </button>
        );
      })}
    </div>
  );
}