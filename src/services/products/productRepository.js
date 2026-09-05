import { base44ProductRepository } from '@/services/products/base44ProductRepository';
import { restProductRepository } from '@/services/products/restProductRepository';

const productRepository = import.meta.env.VITE_DATA_PROVIDER === 'rest'
  ? restProductRepository
  : base44ProductRepository;

export default productRepository;