const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(path, options = {}) {
  if (!apiBaseUrl) throw new Error('VITE_API_BASE_URL não configurada.');
  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}${path}`, {
    credentials: 'include',
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers }
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Falha na API (${response.status}).`);
  }
  return response.status === 204 ? null : response.json();
}