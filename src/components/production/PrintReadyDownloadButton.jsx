import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { downloadPrintReadyPng } from '@/components/production/exportPrintReadyPng';

export default function PrintReadyDownloadButton({ sourceUrl, fileName, sideLabel }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');
  const download = async () => {
    setDownloading(true);
    setError('');
    try {
      await downloadPrintReadyPng(sourceUrl, fileName);
    } catch (reason) {
      setError(reason.message || 'Não foi possível baixar o arquivo.');
    } finally {
      setDownloading(false);
    }
  };
  return <div className="space-y-1">
    <Button onClick={download} disabled={downloading || !sourceUrl} className="w-full rounded-xl">
      {downloading ? <Loader2 className="animate-spin" /> : <Download />}
      {downloading ? 'Preparando PNG...' : `Baixar estampa ${sideLabel}`}
    </Button>
    {error && <p className="text-xs text-destructive" role="alert">{error}</p>}
  </div>;
}