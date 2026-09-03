import { useState } from 'react';
import { base44 } from '@/api/base44Client';

export default function useBatchUpload(user, onComplete) {
  const [files, setFiles] = useState([]);
  const [category, setCategory] = useState('ilustracao');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const upload = async () => {
    if (!files.length) return;
    setUploading(true);
    setMessage('');
    try {
      const uploaded = await Promise.all(files.map(async (file) => ({
        file,
        result: await base44.integrations.Core.UploadFile({ file })
      })));
      await base44.entities.Design.bulkCreate(uploaded.map(({ file, result }) => ({
        title: file.name.replace(/\.[^/.]+$/, ''),
        image_url: result.file_url,
        artist_id: user.id,
        artist_name: user.artist_name || user.full_name,
        category,
        price_base: 49.9,
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

  return { files, setFiles, category, setCategory, uploading, message, upload };
}