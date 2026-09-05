import { products } from '@/services/api/repositories';

const productRepository = {
  listCatalog: () => products.filter({ catalog_product: true }, '-created_date', 100),
  create: (data) => products.create(data),
  update: (id, data) => products.update(id, data),
  delete: (id) => products.delete(id)
};

export default productRepository;