import { Instagram, Linkedin, MessageCircle, Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const contactFields = [
  { key: 'whatsapp', label: 'WhatsApp Profissional', placeholder: '(00) 00000-0000', icon: MessageCircle },
  { key: 'instagram', label: 'Instagram do Criador', placeholder: '@seu.perfil', icon: Instagram },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/in/seu-perfil', icon: Linkedin },
  { key: 'website', label: 'Site / Portfólio Externo', placeholder: 'https://seusite.com.br', icon: Globe },
];

export default function StoreContactFields({ data, onChange }) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-base font-semibold text-slate-900">Redes Sociais & Contato</Label>
        <p className="text-xs text-slate-500 mt-0.5">
          Canais para divulgação pública na vitrine da sua loja.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {contactFields.map(({ key, label, placeholder, icon: Icon }) => (
          <div key={key}>
            <Label htmlFor={key} className="text-xs uppercase tracking-wide text-ceu-navy/70 font-bold">
              {label}
            </Label>
            <div className="relative mt-1.5">
              <Icon className="absolute left-4 top-3.5 h-4 w-4 text-ceu-navy/40" />
              <Input
                id={key}
                value={data[key] || ''}
                onChange={(e) => onChange(key, e.target.value)}
                placeholder={placeholder}
                className="h-11 rounded-xl pl-11 text-xs"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
