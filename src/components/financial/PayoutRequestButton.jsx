import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { HandCoins, Loader2 } from 'lucide-react';
export default function PayoutRequestButton({ available }) {
  const [busy, setBusy] = useState(false), [message, setMessage] = useState('');
  const cache = useQueryClient();
  const request = async () => {
    setBusy(true); setMessage('');
    try {
      const { data } = await base44.functions.invoke('requestArtistPayout', {});
      setMessage(`Solicitação de R$ ${Number(data.amount).toFixed(2)} enviada.`);
      await cache.invalidateQueries({ queryKey: ['artist-financial-summary'] });
    } catch (error) { setMessage(error.response?.data?.error || 'Não foi possível solicitar o pagamento.'); }
    finally { setBusy(false); }
  };
  return <div className="text-right"><Button onClick={request} disabled={busy || available < 1} className="rounded-full bg-ceu-navy text-ceu-cloud">{busy ? <Loader2 className="animate-spin" /> : <HandCoins />}Solicitar pagamento</Button>{message && <p role="status" className="mt-2 text-xs text-muted-foreground">{message}</p>}</div>;
}