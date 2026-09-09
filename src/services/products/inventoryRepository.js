import { base44 } from '@/api/base44Client';
const inventoryRepository = {
  list: (baseProductId) => base44.entities.BaseProductVariant.filter({ base_product_id: baseProductId }, 'color', 500),
  save: async (product, color, size, stock, current) => {
    if (!Number.isSafeInteger(stock) || stock < 0) throw new Error('Informe um estoque inteiro, a partir de zero.');
    if (!(product.sizes_available || []).includes(size) || !(product.colors_available || []).includes(color)) throw new Error('Escolha uma cor e um tamanho cadastrados no produto.');
    if (current) {
      // Compare-and-set: never overwrite a purchase that changed stock while editing.
      const result = await base44.entities.BaseProductVariant.updateMany({ id: current.id, stock_quantity: current.stock_quantity }, { $set: { stock_quantity: stock } });
      if (!result.updated && stock !== current.stock_quantity) throw new Error('O estoque mudou durante a edição. Recarregue antes de ajustar.');
      return base44.entities.BaseProductVariant.get(current.id);
    }
    const existing = await inventoryRepository.list(product.id);
    if (existing.some(v => v.color === color && v.size === size)) throw new Error('Essa variação já está cadastrada.');
    return base44.entities.BaseProductVariant.create({ base_product_id: product.id, color, size, stock_quantity: stock, is_active: true, debited_order_ids: [], released_order_ids: [] });
  },
  pause: (variant) => base44.entities.BaseProductVariant.update(variant.id, { is_active: !variant.is_active }),
};
export default inventoryRepository;