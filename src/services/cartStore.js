import { useState, useEffect, useCallback } from 'react';

const listeners = new Set();

function readCartFromStorage() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('cart');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn('[cartStore] Error reading cart from localStorage:', e);
    return [];
  }
}

function emitChange(items) {
  listeners.forEach((fn) => {
    try {
      fn(items);
    } catch (e) {
      console.error('[cartStore] Error notifying listener:', e);
    }
  });
}

export const cartStore = {
  read: readCartFromStorage,
  set(items) {
    const safeItems = Array.isArray(items) ? items : [];
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cart', JSON.stringify(safeItems));
      } catch (e) {
        console.warn('[cartStore] Error writing cart to localStorage:', e);
      }
    }
    emitChange(safeItems);
  },
  add(item) {
    if (!item?.base_product_id || !item?.variant_id || !item?.design_id) {
      throw new Error('Escolha o produto base, a cor e o tamanho antes de adicionar.');
    }
    const current = readCartFromStorage();
    const newItem = {
      ...item,
      id: item.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `item_${Date.now()}_${Math.random().toString(36).slice(2)}`),
    };
    cartStore.set([...current, newItem]);
  },
  removePurchased(ids) {
    const current = readCartFromStorage();
    const idSet = new Set((ids || []).map(String));
    cartStore.set(current.filter((item) => !idSet.has(String(item.id))));
  },
};

export default function useCartStore() {
  const [items, setItems] = useState(() => readCartFromStorage());

  useEffect(() => {
    // Sincroniza estado inicial atualizado
    setItems(readCartFromStorage());

    const handleUpdate = (newItems) => {
      setItems(newItems);
    };

    const handleStorageEvent = (e) => {
      if (e.key === 'cart') {
        setItems(readCartFromStorage());
      }
    };

    listeners.add(handleUpdate);
    window.addEventListener('storage', handleStorageEvent);

    return () => {
      listeners.delete(handleUpdate);
      window.removeEventListener('storage', handleStorageEvent);
    };
  }, []);

  const setCartItems = useCallback((newItems) => {
    cartStore.set(newItems);
  }, []);

  return [items, setCartItems];
}

export { useCartStore };