import { useState } from 'react';
import { Button } from '@/components/ui/button';
export default function GooglePayPreview({ reason }) {
  const [explain, setExplain] = useState(false);
  return <div className="space-y-2"><Button type="button" variant="default" className="h-12 w-full rounded-xl" onClick={() => setExplain(true)}>Pagar rápido e decolar</Button><p className="text-center text-xs text-muted-foreground">Google Pay · Prévia visual, sem cobrança</p>{explain && <p role="status" className="text-sm text-muted-foreground">{reason || 'O Google Pay ainda não está disponível neste navegador. Use o cartão abaixo ou uma carteira compatível.'}</p>}</div>;
}