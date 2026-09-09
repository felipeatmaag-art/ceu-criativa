import React from 'react';
import { CreditCard, Smartphone, FileText, Check } from 'lucide-react';
import { motion } from 'framer-motion';

const METHODS = [
  {
    id: 'pix',
    label: 'Pix',
    description: 'Aprovação imediata',
    icon: Smartphone,
    badge: '5% off',
    discount: 0.05
  },
  {
    id: 'credit',
    label: 'Cartão de Crédito',
    description: 'Até 12x sem juros',
    icon: CreditCard,
    badge: null,
    discount: 0
  },
  {
    id: 'boleto',
    label: 'Boleto',
    description: 'Vencimento em 3 dias',
    icon: FileText,
    badge: null,
    discount: 0
  }
];

export default function PaymentMethodSelector({ value, onChange }) {
  return (
    <div className="space-y-2">
      {METHODS.map(m => {
        const Icon = m.icon;
        const active = value === m.id;
        return (
          <button
            key={m.id}
            type="button"
            disabled={m.id !== 'credit'}
            title={m.id !== 'credit' ? 'Aguardando integração sem redirecionamento' : undefined}
            onClick={() => onChange(m.id)}
            className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${
              active
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
              active ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-500'
            }`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">{m.label}</span>
                {m.badge && m.id === 'credit' && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                    {m.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">{m.id === 'credit' ? 'Cartão e Google Pay, aqui mesmo' : 'Em preparação para pagamento integrado'}</p>
            </div>
            {active && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"
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

export const PAYMENT_METHODS = METHODS;