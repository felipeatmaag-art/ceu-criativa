import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import buildProductionSnapshot from '@/components/create/buildProductionSnapshot';
import { getArtworkMetadata } from '@/components/create/artworkMetadata';
import inventoryRepository from '@/services/products/inventoryRepository';
import { cartStore } from '@/services/cartStore';
import { mockupSourceKey } from '@/components/create/studioMockups';
export default function useStudioSubmission(options) {
  const [saving, setSaving] = useState(false), [error, setError] = useState('');
  const saved = useRef(null), lock = useRef(false), navigate = useNavigate(), cache = useQueryClient();
  const submit = async action => {
    if (lock.current) return;
    lock.current = true; setSaving(true); setError('');
    try {
      const hasArtwork = Boolean(options.frontImage || options.backImage);
      if (!options.approved || !options.size || !hasArtwork || !options.designData.title.trim() || !options.designData.category) {
        throw new Error('Escolha tamanho, nome e categoria e aprove o mockup antes de continuar.');
      }
      if (!await base44.auth.isAuthenticated()) {
        const artwork = Object.fromEntries([options.frontImage, options.backImage].filter(Boolean).map(url => [url, getArtworkMetadata(url)]));
        sessionStorage.setItem('ceu-studio-resume', JSON.stringify({ ...options, artwork }));
        base44.auth.redirectToLogin(window.location.origin + '/Create?resume=1'); return;
      }
      let variant;
      if (action === 'cart') {
        if (!options.product?.id) throw new Error('Para comprar, escolha um produto base cadastrado. Sua arte pode ser publicada sem estoque.');
        const variants = await inventoryRepository.list(options.product.id);
        const matching = variants.filter(v => v.color === options.color && v.size === options.size && v.is_active);
        if (matching.length !== 1 || matching[0].stock_quantity < 1) throw new Error('Esta cor e tamanho estão sem estoque físico. Escolha outra variação; sua arte continua disponível.');
        variant = matching[0];
      }
      const user = await base44.auth.me();
      const signature = JSON.stringify({ source: mockupSourceKey(options), size: options.size, designData: options.designData, mode: options.mode });
      if (!saved.current || saved.current.signature !== signature) {
        const production = await buildProductionSnapshot(options);
        const commission = (await base44.entities.ArtistCommission.filter({ artist_id: user.id }, '-updated_date', 1))[0]?.rate ?? 25;
        const primaryImage = options.frontImage || options.backImage;
        const isActivatedArtist = Boolean(user.has_purchased_first_print);
        const designStatus = (action === 'publish' && isActivatedArtist) ? 'aprovado' : (action === 'publish' ? 'pendente' : 'rascunho');
        const design = await base44.entities.Design.create({
          ...options.designData,
          narration: options.designData?.narration || '',
          image_url: primaryImage,
          front_image_url: options.frontImage || '',
          back_image_url: options.backImage || '',
          artist_id: user.id,
          artist_name: user.artist_name || user.full_name,
          tags: options.designData.tags.split(',').map(t => t.trim()).filter(Boolean),
          is_ai_generated: options.mode === 'ai',
          status: designStatus,
          commission_rate: commission,
          production
        });
        saved.current = { signature, design, production };
      }
      const { design, production } = saved.current;
      if (action === 'cart') {
        const cartDesignImage = production.front?.file_url || production.back?.file_url || options.frontImage || options.backImage;
        const cartMockup = production.mockup_human_url || production.mockup_front_url || production.mockup_back_url || '';
        const item = { id: crypto.randomUUID(), design_id: design.id, artist_id: user.id, design_image: cartDesignImage, design_title: design.title, product_type: options.productType, catalog_product_id: options.product?.id || '', price: options.price, color: options.color, size: options.size, quantity: 1, mockup_url: cartMockup, production };
        cartStore.add({ ...item, base_product_id: options.product.id, variant_id: variant.id });
      } else {
        const primaryMockup = production.mockup_human_url || production.mockup_front_url || production.mockup_back_url || '';
        const isActivatedArtist = Boolean(user.has_purchased_first_print);
        await base44.entities.Design.update(design.id, {
          status: isActivatedArtist ? 'aprovado' : 'pendente',
          mockup_url: primaryMockup,
          production
        });
        const proofs = ['front', 'back', 'human'].filter(side => production[`mockup_${side}_url`]).map(angle => ({
          angle,
          label: angle === 'human' ? 'Modelo Humanizado (Em Uso)' : (angle === 'back' ? 'Costas' : 'Frente'),
          url: production[`mockup_${angle}_url`]
        }));
        const gallery = [...proofs, ...options.generatedMockups.filter(item => item.sourceKey === mockupSourceKey(options))];
        const artistMargin = Number(design.artist_margin || (design.price_base * design.commission_rate / 100) || 0);
        const platformFee = Math.max(0, Number(design.price_base || 0) - artistMargin);
        await base44.entities.Product.create({
          name: design.title,
          type: options.productType,
          design_id: design.id,
          narration: options.designData?.narration || design.narration || '',
          design_image: options.frontImage || options.backImage,
          back_design_image: options.backImage || '',
          category_id: design.category_id || '',
          collection_id: design.collection_id || '',
          tags: design.tags || [],
          base_price: options.price,
          base_cost: options.price,
          artist_margin: artistMargin,
          platform_fee: platformFee,
          final_price: Number(options.price) + artistMargin + platformFee,
          mockup_url: primaryMockup,
          mockup_gallery: gallery.map(i => i.url),
          mockup_style: options.mockupStyle || 'human_street',
          mockup_angles: gallery.map(i => i.angle),
          colors_available: [options.color],
          sizes_available: [options.size],
          is_active: true
        });
      }
      sessionStorage.removeItem('ceu-studio-resume');
      await cache.invalidateQueries({ queryKey: ['my-designs'] });
      navigate(action === 'cart' ? '/Cart' : '/MyDesigns');
    } catch (e) { setError(e.message || 'Não foi possível salvar a estampa. Tente novamente.'); }
    finally { lock.current = false; setSaving(false); }
  };
  return { submit, saving, error };
}