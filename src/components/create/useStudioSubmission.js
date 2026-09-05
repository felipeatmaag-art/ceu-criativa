import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import buildProductionSnapshot from '@/components/create/buildProductionSnapshot';
import { getArtworkMetadata } from '@/components/create/artworkMetadata';
export default function useStudioSubmission(options) {
  const [saving, setSaving] = useState(false), [error, setError] = useState('');
  const saved = useRef(null), lock = useRef(false), navigate = useNavigate(), cache = useQueryClient();
  const submit = async action => {
    if (lock.current) return;
    lock.current = true; setSaving(true); setError('');
    try {
      if (!options.approved || !options.size || !options.frontImage || !options.designData.title.trim() || !options.designData.category) throw new Error('Escolha tamanho, nome e categoria e aprove o mockup antes de continuar.');
      if (!await base44.auth.isAuthenticated()) {
        const artwork = Object.fromEntries([options.frontImage, options.backImage].filter(Boolean).map(url => [url, getArtworkMetadata(url)]));
        sessionStorage.setItem('ceu-studio-resume', JSON.stringify({ ...options, artwork }));
        base44.auth.redirectToLogin(window.location.origin + '/Create?resume=1'); return;
      }
      const user = await base44.auth.me();
      const signature = JSON.stringify(options);
      if (!saved.current || saved.current.signature !== signature) {
        const production = await buildProductionSnapshot(options);
        const design = await base44.entities.Design.create({ ...options.designData, image_url: options.frontImage, artist_id: user.id, artist_name: user.artist_name || user.full_name, tags: options.designData.tags.split(',').map(t => t.trim()).filter(Boolean), is_ai_generated: options.mode === 'ai', status: action === 'publish' ? 'pendente' : 'rascunho', commission_rate: 30, production });
        saved.current = { signature, design, production };
      }
      const { design, production } = saved.current;
      if (action === 'cart') {
        const previous = JSON.parse(localStorage.getItem('cart') || '[]');
        if (!Array.isArray(previous)) throw new Error('Não foi possível ler o carrinho atual.');
        const item = { id: crypto.randomUUID(), design_id: design.id, artist_id: user.id, design_image: production.front.file_url, design_title: design.title, product_type: options.productType, catalog_product_id: options.product?.id || '', price: options.price, color: options.color, size: options.size, quantity: 1, mockup_url: production.mockup_front_url || '', production };
        localStorage.setItem('cart', JSON.stringify([...previous, item]));
      } else {
        if (design.status !== 'pendente') await base44.entities.Design.update(design.id, { status: 'pendente' });
        if (options.generatedMockups.length) await base44.entities.Product.create({ name: design.title, type: options.productType, design_id: design.id, design_image: options.frontImage, back_design_image: options.backImage || '', base_price: options.price, final_price: options.price, mockup_url: options.generatedMockups[0].url, mockup_gallery: options.generatedMockups.map(i => i.url), mockup_style: options.mockupStyle, mockup_angles: options.generatedMockups.map(i => i.angle), colors_available: [options.color], sizes_available: [options.size], is_active: true });
      }
      sessionStorage.removeItem('ceu-studio-resume');
      await cache.invalidateQueries({ queryKey: ['my-designs'] });
      navigate(action === 'cart' ? '/Cart' : '/MyDesigns');
    } catch (e) { setError(e.message || 'Não foi possível salvar a estampa. Tente novamente.'); }
    finally { lock.current = false; setSaving(false); }
  };
  return { submit, saving, error };
}