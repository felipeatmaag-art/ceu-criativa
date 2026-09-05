import { createRestDataProvider } from '@/services/api/restDataProvider';

export function createNextDataProvider(baseUrl) {
  return createRestDataProvider({ baseUrl });
}