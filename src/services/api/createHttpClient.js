export function createHttpClient({ baseUrl, fetcher = globalThis.fetch, credentials = 'include' }) {
  if (!baseUrl) throw new Error('A URL base da API não foi configurada.');
  const root = baseUrl.replace(/\/$/, '');

  return async function request(path, options = {}) {
    const response = await fetcher(`${root}${path}`, {
      credentials,
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Falha na API (${response.status}).`);
    }

    return response.status === 204 ? null : response.json();
  };
}