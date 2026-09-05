import { apiRequest } from '@/services/httpClient';

export const restProductRepository = {
  listCatalog: () => apiRequest('/products?catalog_product=true&sort=-created_date&limit=100'),
  create: (data) => apiRequest('/products', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiRequest(`/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id) => apiRequest(`/products/${encodeURIComponent(id)}`, { method: 'DELETE' })
};