import { base44DataProvider } from '@/services/api/base44DataProvider';
import { createRestDataProvider } from '@/services/api/restDataProvider';
import { viteRuntimeConfig } from '@/services/api/viteRuntimeConfig';

export const dataProvider = viteRuntimeConfig.dataProvider === 'rest'
  ? createRestDataProvider({ baseUrl: viteRuntimeConfig.apiBaseUrl })
  : base44DataProvider;