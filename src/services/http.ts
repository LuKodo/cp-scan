import ky, { type Options } from 'ky';
import { Capacitor } from '@capacitor/core';
import { CapacitorHttp } from '@capacitor/core';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Fetch nativo para móvil (sin CORS)
 */
async function mobileFetch(
  url: string,
  options: Options
) {
  const response = await CapacitorHttp.request({
    url: `${API_URL}/${url}`,
    method: options.method?.toUpperCase() || 'GET',
    headers: options.headers as any,
    data: options.json,
    params: options.searchParams as any,
    connectTimeout: 10000,
    readTimeout: 10000,
  });

  if (response.status >= 400) {
    throw response;
  }

  return {
    json: async () => response.data,
    text: async () => JSON.stringify(response.data),
  };
}

/**
 * Cliente HTTP único
 */
export const http = ky.create({
  prefixUrl: API_URL,
  timeout: 10000,
  fetch: Capacitor.isNativePlatform()
    ? (mobileFetch as any)
    : undefined,
});
