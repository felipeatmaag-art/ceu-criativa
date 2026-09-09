const prices = { camiseta: 4990, baby_look: 4990, quadro: 8990, caneca: 3990 };
export default async function checkoutItems(base44, items) {
  const designs = new Map(), products = new Map();
  const read = (map, entity, id) => {
    if (!map.has(id)) map.set(id, base44.entities[entity].get(id));
    return map.get(id);
  };
  return Promise.all(items.map(async item => {
    const baseProductId = item.base_product_id || item.catalog_product_id || item.production?.catalog_product_id;
    if (!baseProductId || !item.variant_id || !item.design_id) throw new Error('Este item precisa ser atualizado: escolha novamente o produto base, a cor e o tamanho.');
    const product = await read(products, 'Product', baseProductId);
    const variant = await base44.entities.BaseProductVariant.get(item.variant_id);
    if (!product?.is_active || !product.catalog_product || product.type !== item.product_type || !variant?.is_active || variant.base_product_id !== product.id || variant.color !== item.color || variant.size !== item.size) throw new Error('Variação física indisponível. Escolha novamente.');
    let unitPrice = Math.round(Number(product.base_price) * 100);
    if (!Number.isSafeInteger(unitPrice) || unitPrice <= 0) throw new Error('Preço inválido para o produto base.');
    const quantity = Number(item.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw new Error('A quantidade deve ser um inteiro entre 1 e 10.');
    if (variant.stock_quantity < quantity) throw new Error(`Estoque insuficiente: ${product.name} · ${variant.color} · ${variant.size}.`);
    const design = await read(designs, 'Design', item.design_id);
    if (!design) throw new Error('Estampa indisponível.');
    const production = item.production?.version ? design?.production : null;
    if (item.production?.version && !production) throw new Error('O arquivo aprovado não está mais disponível. Volte ao estúdio.');
    if (production) {
      if (!production.front?.alpha_validated || !production.front?.file_url || !production.front?.sha256 || !production.approved_at) throw new Error('A estampa precisa ser preparada e aprovada novamente.');
      if (production.back && (!production.back.alpha_validated || !production.back.file_url || !production.back.sha256)) throw new Error('A arte das costas não foi validada.');
      if (production.color !== item.color || production.size !== item.size || production.product_type !== item.product_type) throw new Error('O produto difere do mockup aprovado. Volte ao estúdio para revisar.');
      if (production.catalog_product_id) {
        if (production.catalog_product_id !== baseProductId) throw new Error('O produto base difere do mockup aprovado.');
        const product = await read(products, 'Product', production.catalog_product_id);
        if (!product?.is_active || !product.catalog_product || product.type !== item.product_type) throw new Error('Modelo indisponível. Escolha outro produto.');
        unitPrice = Math.round(Number(product.base_price) * 100);
        if (!Number.isFinite(unitPrice) || unitPrice <= 0) throw new Error('Preço inválido para este produto.');
        if (product.sizes_available?.length && !product.sizes_available.includes(item.size)) throw new Error('Tamanho indisponível.');
        if (product.product_color_variants?.length && !product.product_color_variants.some(v => v.name === item.color)) throw new Error('Cor indisponível.');
      }
    }
    return {
      base_product_id: product.id, variant_id: variant.id,
      product_type: product.type, design_id: design.id, design_title: String(design?.title || item.design_title || 'Arte personalizada').slice(0, 100), artist_id: design?.artist_id || '',
      quantity, size: String(item.size || '').slice(0, 30), color: String(item.color || '').slice(0, 30), price: unitPrice / 100,
      cart_item_id: String(item.id || '').slice(0, 80), design_image: production?.front?.file_url || design?.image_url || '', mockup_url: production?.mockup_front_url || '',
      ...(production ? { production: JSON.parse(JSON.stringify(production)) } : {}),
    };
  }));
}