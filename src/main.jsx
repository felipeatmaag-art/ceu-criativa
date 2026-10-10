import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

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

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)

if (import.meta.hot) {
  import.meta.hot.on('vite:beforeUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:beforeUpdate' }, '*');
  });
  import.meta.hot.on('vite:afterUpdate', () => {
    window.parent?.postMessage({ type: 'sandbox:afterUpdate' }, '*');
  });
}



