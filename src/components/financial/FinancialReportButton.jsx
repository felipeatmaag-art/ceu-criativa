import React, { useState } from 'react';
import { CheckCircle2, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import createFinancialReport from '@/components/financial/createFinancialReport';

export default function FinancialReportButton({ summary }) {
  const [status, setStatus] = useState('idle');

  const handleDownload = async () => {
    setStatus('loading');
    try {
      await Promise.resolve();
      createFinancialReport(summary);
      setStatus('success');
      window.setTimeout(() => setStatus('idle'), 2500);
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="sm:text-right">
      <Button onClick={handleDownload} disabled={status === 'loading'} className="rounded-xl">
        {status === 'loading' ? <Loader2 className="animate-spin" /> : status === 'success' ? <CheckCircle2 /> : <Download />}
        {status === 'loading' ? 'Gerando PDF...' : status === 'success' ? 'PDF baixado' : 'Baixar relatório PDF'}
      </Button>
      {status === 'error' && <p className="mt-2 text-xs text-destructive">Não foi possível gerar o relatório.</p>}
    </div>
  );
}