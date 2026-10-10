import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';
import { GeminiCore } from './geminiIntegrations';
import { FALLBACK_DESIGNS, FALLBACK_PRODUCTS } from '@/data/catalogFallback';

const { appId, token, functionsVersion } = appParams;

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false
});

import { authService } from '@/services/authService';

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

// Local in-memory entity event emitter replacing failing Socket.IO connections
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

// Override integrations and entities
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

  const originalEntities = base44.entities;
  const wrappedEntities = new Proxy(originalEntities || {}, {
    get(target, entityName) {
      if (typeof entityName !== 'string' || entityName === 'then' || entityName.startsWith('_')) {
        return Reflect.get(target, entityName);
      }
      const originalHandler = target[entityName];
      if (!originalHandler) return originalHandler;

      return new Proxy(originalHandler, {
        get(hTarget, prop) {
          if (prop === 'filter' || prop === 'list') {
            return async (...args) => {
              try {
                const result = await hTarget[prop](...args);
                if (Array.isArray(result)) return result;
                if (Array.isArray(result?.data)) return result.data;
                if (entityName === 'Design') return FALLBACK_DESIGNS;
                if (entityName === 'Product') return FALLBACK_PRODUCTS;
                return [];
              } catch (err) {
                if (entityName === 'Design') return FALLBACK_DESIGNS;
                if (entityName === 'Product') return FALLBACK_PRODUCTS;
                return [];
              }
            };
          }
          if (prop === 'get') {
            return async (...args) => {
              try {
                const result = await hTarget.get(...args);
                if (result && typeof result === 'object' && typeof result !== 'string') return result;
                if (entityName === 'Design') return FALLBACK_DESIGNS.find(d => d.id === args[0]) || null;
                if (entityName === 'Product') return FALLBACK_PRODUCTS.find(p => p.id === args[0]) || null;
                return null;
              } catch {
                if (entityName === 'Design') return FALLBACK_DESIGNS.find(d => d.id === args[0]) || null;
                if (entityName === 'Product') return FALLBACK_PRODUCTS.find(p => p.id === args[0]) || null;
                return null;
              }
            };
          }
          if (prop === 'subscribe') {
            return (callback) => {
              if (!entityListeners.has(entityName)) {
                entityListeners.set(entityName, new Set());
              }
              entityListeners.get(entityName).add(callback);
              return () => {
                entityListeners.get(entityName)?.delete(callback);
              };
            };
          }
          if (prop === 'create') {
            return async (...args) => {
              const result = await hTarget.create(...args);
              emitEntityUpdate(entityName, { type: 'create', data: result });
              return result;
            };
          }
          if (prop === 'update') {
            return async (...args) => {
              const result = await hTarget.update(...args);
              emitEntityUpdate(entityName, { type: 'update', data: result });
              return result;
            };
          }
          if (prop === 'delete') {
            return async (...args) => {
              const result = await hTarget.delete(...args);
              emitEntityUpdate(entityName, { type: 'delete', id: args[0] });
              return result;
            };
          }
          if (prop === 'bulkDelete') {
            return async (ids) => {
              const res = await fetch(`/api/entities/${entityName}/delete-many`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: Array.isArray(ids) ? ids : [ids] })
              });
              const json = await res.json();
              emitEntityUpdate(entityName, { type: 'bulk-delete', ids });
              return json;
            };
          }
          if (prop === 'bulkUpdate') {
            return async (ids, data) => {
              const res = await fetch(`/api/entities/${entityName}/update-many`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, data })
              });
              const json = await res.json();
              emitEntityUpdate(entityName, { type: 'bulk-update', ids, data });
              return json;
            };
          }
          const val = Reflect.get(hTarget, prop);
          if (typeof val === 'function') {
            return val.bind(hTarget);
          }
          return val;
        }
      });
    }
  });

  Object.defineProperty(base44, 'entities', {
    value: wrappedEntities,
    writable: true,
    configurable: true,
    enumerable: true,
  });
}

