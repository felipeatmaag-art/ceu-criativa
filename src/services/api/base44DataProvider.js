import { base44 } from '@/api/base44Client';

const entity = (name) => {
  const resource = base44.entities[name];
  if (!resource) throw new Error(`Entidade não disponível: ${name}`);
  return resource;
};

export const base44DataProvider = {
  list: (name, options) => entity(name).list(options.sort, options.limit, options.skip),
  filter: (name, query, options) => entity(name).filter(query, options.sort, options.limit, options.skip),
  get: (name, id) => entity(name).get(id),
  create: (name, data) => entity(name).create(data),
  bulkCreate: (name, data) => entity(name).bulkCreate(data),
  update: (name, id, data) => entity(name).update(id, data),
  bulkUpdate: (name, data) => entity(name).bulkUpdate(data),
  updateMany: (name, query, changes) => entity(name).updateMany(query, changes),
  delete: (name, id) => entity(name).delete(id),
  deleteMany: (name, query) => entity(name).deleteMany(query),
  subscribe: (name, handler) => entity(name).subscribe(handler)
};