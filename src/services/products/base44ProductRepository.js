import { base44 } from '@/api/base44Client';

export const base44ProductRepository = {
  listCatalog: () => base44.entities.Product.filter({ catalog_product: true }, '-created_date', 100),
  create: (data) => base44.entities.Product.create(data),
  update: (id, data) => base44.entities.Product.update(id, data),
  delete: (id) => base44.entities.Product.delete(id)
};