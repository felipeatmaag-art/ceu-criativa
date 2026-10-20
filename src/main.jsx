import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App.jsx';
import '@/index.css';

// Defensive filter for environment-level websocket error noise
const origConsoleError = console.error;
console.error = function (...args) {
  const msg = args
    .map((a) => (typeof a === 'string' ? a : a?.message || String(a || '')))
    .join(' ')
    .toLowerCase();
  if (msg.includes('connect_error') || msg.includes('websocket error') || msg.includes('websocket')) {
    return;
  }
  origConsoleError.apply(console, args);
};

const rootElement = document.getElementById('root');
if (rootElement) {
  try {
    ReactDOM.createRoot(rootElement).render(<App />);
  } catch (err) {
    console.error('[main.jsx] Falha fatal ao montar React:', err);
    rootElement.innerHTML = `
      <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0f;color:#fff;font-family:sans-serif;padding:24px;text-align:center;">
        <div style="max-width:480px;background:#14141e;padding:32px;border-radius:24px;border:1px solid rgba(255,255,255,0.1);">
          <h2 style="font-size:20px;font-weight:bold;margin-bottom:12px;color:#f87171;">Ocorreu uma falha ao iniciar a aplicação</h2>
          <p style="font-size:13px;color:#9ca3af;margin-bottom:20px;">${err?.message || 'Erro inesperado'}</p>
          <button onclick="window.location.reload()" style="background:#10b981;color:#fff;border:none;padding:10px 20px;border-radius:12px;font-weight:bold;cursor:pointer;">
            Recarregar
          </button>
        </div>
      </div>
    `;
  }
}

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:beforeUpdate' }, '*');
  });
  import.meta.hot.on('vite:afterUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:afterUpdate' }, '*');
  });
}

// Desativa qualquer service worker em preview para evitar telas brancas por cache stale
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const reg of registrations) {
      reg.unregister();
    }
  }).catch(() => {});
  if (typeof caches !== 'undefined') {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
      }
    }).catch(() => {});
  }
}
