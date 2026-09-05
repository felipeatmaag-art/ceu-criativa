import { createHttpClient } from '@/services/api/createHttpClient';

const encode = (value) => encodeURIComponent(value);
const queryString = (values) => {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.set(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : '';
};

export function createRestDataProvider(config) {
  const request = createHttpClient(config);
  const collection = (name) => `/api/entities/${encode(name)}`;

  return {
    list: (name, options) => request(`${collection(name)}${queryString(options)}`),
    filter: (name, query, options) => request(`${collection(name)}${queryString({ filter: query, ...options })}`),
    get: (name, id) => request(`${collection(name)}/${encode(id)}`),
    create: (name, data) => request(collection(name), { method: 'POST', body: JSON.stringify(data) }),
    bulkCreate: (name, data) => request(`${collection(name)}/bulk`, { method: 'POST', body: JSON.stringify(data) }),
    update: (name, id, data) => request(`${collection(name)}/${encode(id)}`, { method: 'PATCH', body: JSON.stringify(data) }),
    bulkUpdate: (name, data) => request(`${collection(name)}/bulk`, { method: 'PATCH', body: JSON.stringify(data) }),
    updateMany: (name, query, changes) => request(`${collection(name)}/update-many`, { method: 'PATCH', body: JSON.stringify({ query, changes }) }),
    delete: (name, id) => request(`${collection(name)}/${encode(id)}`, { method: 'DELETE' }),
    deleteMany: (name, query) => request(`${collection(name)}/delete-many`, { method: 'POST', body: JSON.stringify({ query }) }),
    subscribe: () => {
      throw new Error('Assinaturas em tempo real exigem um adaptador próprio no provedor REST.');
    }
  };
}