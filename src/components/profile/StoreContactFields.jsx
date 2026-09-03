import { Instagram, Linkedin, MessageCircle, WalletCards } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const fields = [
  { key: 'pix_key', label: 'Chave PIX', placeholder: 'Chave para receber seus repasses', icon: WalletCards },
  { key: 'whatsapp', label: 'WhatsApp de contato', placeholder: '(00) 00000-0000', icon: MessageCircle },
  { key: 'linkedin', label: 'Link do perfil no LinkedIn', placeholder: 'https://linkedin.com/in/seu-perfil', icon: Linkedin },
  { key: 'instagram', label: 'Instagram do criador', placeholder: '@seu.perfil', icon: Instagram },
];

export default function StoreContactFields({ data, onChange }) {
  return <div className="space-y-4">
    <Label className="text-base font-semibold">Contato e recebimentos</Label>
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map(({ key, label, placeholder, icon: Icon }) => <div key={key}>
        <Label htmlFor={key} className="text-xs uppercase tracking-wide text-ceu-navy/60">{label}</Label>
        <div className="relative mt-2"><Icon className="absolute left-4 top-3.5 h-5 w-5 text-ceu-navy/40" /><Input id={key} value={data[key]} onChange={(e) => onChange(key, e.target.value)} placeholder={placeholder} className="h-12 rounded-xl pl-12" /></div>
      </div>)}
    </div>
  </div>;
}