import { useSyncExternalStore } from 'react';
let snapshot = null, previous = null;
const listeners = new Set();
function read() {
  const raw = localStorage.getItem('cart') || '[]';
  if (raw !== previous) { previous = raw; snapshot = JSON.parse(raw); }
  return snapshot;
}
function emit() { listeners.forEach(fn => fn()); }
function subscribe(fn) { listeners.add(fn); window.addEventListener('storage', fn); return () => { listeners.delete(fn); window.removeEventListener('storage', fn); }; }
export const cartStore = {
  read,
  set(items) { localStorage.setItem('cart', JSON.stringify(items)); emit(); },
  add(item) {
    if (!item.base_product_id || !item.variant_id || !item.design_id) throw new Error('Escolha o produto base, a cor e o tamanho antes de adicionar.');
    cartStore.set([...read(), { ...item, id: item.id || crypto.randomUUID() }]);
  },
  removePurchased(ids) { cartStore.set(read().filter(item => !ids.includes(String(item.id)))); },
};
export default function useCartStore() { return [useSyncExternalStore(subscribe, read), cartStore.set]; }