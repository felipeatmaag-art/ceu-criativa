import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { validateArtworkFile } from '@/components/create/artworkMetadata';

export default function useBatchUpload(user, onComplete) {
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState('ilustracao');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const chooseFiles = async (selected) => {
    try {
      const quality = await Promise.all(selected.map(validateArtworkFile));
      setFiles(selected);
      const warnings = quality.map((item, index) => item.warning ? `${selected[index].name}: ${item.warning}` : '').filter(Boolean);
      setMessage(warnings.join(' '));
    } catch (error) { setFiles([]); setMessage(error.message); }
  };

  const upload = async () => {
    if (!files.length) return;
    setUploading(true);
    setMessage('');
    try {
      const uploaded = await Promise.all(files.map(async (file) => ({
        file,
        result: await base44.integrations.Core.UploadFile({ file })
      })));
      const commissionRate = (await base44.entities.ArtistCommission.filter({ artist_id: user.id }, '-updated_date', 1))[0]?.rate ?? 25;
      await base44.entities.Design.bulkCreate(uploaded.map(({ file, result }) => ({
        title: file.name.replace(/\.[^/.]+$/, ''),
        image_url: result.file_url,
        artist_id: user.id,
        artist_name: user.artist_name || user.full_name,
        category,
        price_base: 49.9,
        commission_rate: commissionRate,
        status: 'pendente',
        is_ai_generated: false
      })));
      setFiles([]);
      setMessage('Estampas enviadas para aprovação.');
      onComplete();
    } catch (error) {
      setMessage(error.message || 'Não foi possível enviar as estampas.');
    } finally {
      setUploading(false);
    }
  };

  return { files, chooseFiles, category, setCategory, uploading, message, upload };
}