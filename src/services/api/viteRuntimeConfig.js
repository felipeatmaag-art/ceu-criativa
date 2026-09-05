export const viteRuntimeConfig = Object.freeze({
  dataProvider: import.meta.env.VITE_DATA_PROVIDER || 'base44',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || ''
});