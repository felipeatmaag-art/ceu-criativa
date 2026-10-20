import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { GeminiCore } from './geminiIntegrations';
import { FALLBACK_PRODUCTS } from '@/data/catalogFallback';
import { authService } from '@/services/authService';

const { appId, token, functionsVersion } = appParams;

// Create a client instance
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false
});

// Safeguard auth.me against HTML responses or errors in standalone environments
if (base44?.auth) {
  const originalMe = base44.auth.me?.bind(base44.auth);
  base44.auth.me = async () => {
    try {
      const local = authService.getCurrentUser();
      if (local) return local;
      const u = await originalMe();
      if (!u || typeof u !== 'object' || typeof u === 'string' || !u.id) {
        return null;
      }
      return u;
    } catch {
      return authService.getCurrentUser() || null;
    }
  };

  base44.auth.logout = async (redirectUrl) => {
    authService.logout();
    if (redirectUrl) {
      window.location.href = redirectUrl;
    } else {
      window.location.reload();
    }
  };

  base44.auth.redirectToLogin = (nextPath) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-ceu-login', { detail: { nextPath } }));
    }
  };
}

// Local in-memory entity event emitter
const entityListeners = new Map();

export function emitEntityUpdate(entityName, event) {
  const listeners = entityListeners.get(entityName);
  if (listeners) {
    listeners.forEach((cb) => {
      try {
        cb(event);
      } catch (err) {
        console.warn('Listener error:', err);
      }
    });
  }
}

// Universal Entity REST Client connected to local server & HostGator
async function requestEntityApi(entityName, method = 'GET', subPath = '', body = null, queryObj = null) {
  try {
    let url = `/api/entities/${entityName}${subPath}`;
    if (queryObj) {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(queryObj)) {
        if (v !== undefined && v !== null) {
          sp.set(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
        }
      }
      const qs = sp.toString();
      if (qs) url += `?${qs}`;
    }

    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
      opts.body = JSON.stringify(body);
    }

    const response = await fetch(url, opts);
    if (!response.ok) {
      console.warn(`[EntityApi] ${method} ${url} status ${response.status}`);
      return null;
    }
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }
    return null;
  } catch (err) {
    console.warn(`[EntityApi] Falha na requisição ${method} ${entityName}:`, err);
    return null;
  }
}

// Override integrations and entities with robust direct implementation
if (base44) {
  const originalIntegrations = base44.integrations;
  const overriddenIntegrations = {
    get custom() {
      return originalIntegrations?.custom;
    },
    Core: GeminiCore,
  };

  Object.defineProperty(base44, 'integrations', {
    value: overriddenIntegrations,
    writable: true,
    configurable: true,
    enumerable: true,
  });

  const wrappedEntities = new Proxy({}, {
    get(_target, entityName) {
      if (typeof entityName !== 'string' || entityName === 'then' || entityName.startsWith('_')) {
        return undefined;
      }

      return {
        // List entities
        async list(sort = '-created_date', limit = 250, skip = 0) {
          const result = await requestEntityApi(entityName, 'GET', '', null, { sort, limit, skip });
          if (Array.isArray(result)) return result;
          if (entityName === 'Product') return FALLBACK_PRODUCTS;
          return [];
        },

        // Filter entities by criteria
        async filter(query = {}, sort = '-created_date', limit = 250, skip = 0) {
          const result = await requestEntityApi(entityName, 'GET', '', null, { q: query, sort, limit, skip });
          if (Array.isArray(result)) return result;
          if (entityName === 'Product') return FALLBACK_PRODUCTS;
          return [];
        },

        // Get single entity by ID
        async get(id) {
          if (!id) return null;
          const result = await requestEntityApi(entityName, 'GET', `/${id}`);
          if (result && typeof result === 'object') return result;
          if (entityName === 'Product') return FALLBACK_PRODUCTS.find(p => p.id === id) || null;
          return null;
        },

        // Create new entity
        async create(data) {
          const result = await requestEntityApi(entityName, 'POST', '', data) || data;
          emitEntityUpdate(entityName, { type: 'create', data: result });
          return result;
        },

        // Bulk create multiple entities
        async bulkCreate(items) {
          const list = Array.isArray(items) ? items : [items];
          const result = await requestEntityApi(entityName, 'POST', '/bulk', list);
          emitEntityUpdate(entityName, { type: 'bulk-create', data: result });
          return result || list;
        },

        // Update entity by ID
        async update(id, data) {
          const result = await requestEntityApi(entityName, 'PUT', `/${id}`, data) || { ...data, id };
          emitEntityUpdate(entityName, { type: 'update', id, data: result });
          return result;
        },

        // Delete entity by ID
        async delete(id) {
          const result = await requestEntityApi(entityName, 'DELETE', `/${id}`);
          emitEntityUpdate(entityName, { type: 'delete', id });
          return result || { success: true };
        },

        // Bulk delete multiple entities
        async bulkDelete(ids) {
          const idList = Array.isArray(ids) ? ids : [ids];
          const result = await requestEntityApi(entityName, 'POST', '/delete-many', { ids: idList });
          emitEntityUpdate(entityName, { type: 'bulk-delete', ids: idList });
          return result || { success: true, count: idList.length };
        },

        // Delete many by query or ids
        async deleteMany(queryOrIds) {
          const ids = Array.isArray(queryOrIds) ? queryOrIds : [queryOrIds];
          return this.bulkDelete(ids);
        },

        // Bulk update multiple entities
        async bulkUpdate(ids, data) {
          const result = await requestEntityApi(entityName, 'POST', '/update-many', { ids, data });
          emitEntityUpdate(entityName, { type: 'bulk-update', ids, data });
          return result || { success: true };
        },

        // Update many
        async updateMany(queryOrIds, data) {
          if (Array.isArray(queryOrIds)) {
            return this.bulkUpdate(queryOrIds, data);
          }
          const result = await requestEntityApi(entityName, 'POST', '/update-many', { query: queryOrIds, data });
          emitEntityUpdate(entityName, { type: 'bulk-update', data });
          return result || { success: true };
        },

        // Realtime event subscription
        subscribe(callback) {
          if (!entityListeners.has(entityName)) {
            entityListeners.set(entityName, new Set());
          }
          entityListeners.get(entityName).add(callback);
          return () => {
            entityListeners.get(entityName)?.delete(callback);
          };
        }
      };
    }
  });

  Object.defineProperty(base44, 'entities', {
    value: wrappedEntities,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}
