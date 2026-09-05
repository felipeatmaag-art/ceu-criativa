export function createEntityRepository(entityName, provider) {
  return Object.freeze({
    list: (sort, limit, skip) => provider.list(entityName, { sort, limit, skip }),
    filter: (query, sort, limit, skip) => provider.filter(entityName, query, { sort, limit, skip }),
    get: (id) => provider.get(entityName, id),
    create: (data) => provider.create(entityName, data),
    bulkCreate: (data) => provider.bulkCreate(entityName, data),
    update: (id, data) => provider.update(entityName, id, data),
    bulkUpdate: (data) => provider.bulkUpdate(entityName, data),
    updateMany: (query, changes) => provider.updateMany(entityName, query, changes),
    delete: (id) => provider.delete(entityName, id),
    deleteMany: (query) => provider.deleteMany(entityName, query),
    subscribe: (handler) => provider.subscribe(entityName, handler)
  });
}