import ky, { type KyInstance, type Options, HTTPError } from 'ky';
import { CONFIG } from '../config/app.config';
import { Result, AppError, ErrorCode } from '../types/result';

/**
 * Servicio HTTP con inyección de dependencias
 * Fácil de mockear en tests
 */
export interface HttpClient {
  get<T>(url: string, options?: Options): Promise<T>;
  post<T>(url: string, options?: Options): Promise<T>;
  put<T>(url: string, options?: Options): Promise<T>;
  delete<T>(url: string, options?: Options): Promise<T>;
  head(url: string, options?: Options): Promise<void>;
}

// Helper para mapear errores HTTP a AppError
function mapHttpError(error: unknown): AppError {
  if (error instanceof HTTPError) {
    const status = error.response.status;
    
    switch (status) {
      case 401:
      case 403:
        return AppError.auth('Sesión no válida');
      case 404:
        return AppError.notFound('Recurso');
      case 400:
        return AppError.validation('Error en los datos enviados');
      case 500:
      case 502:
      case 503:
        return AppError.network('Error del servidor');
      default:
        return AppError.network(`Error HTTP ${status}`);
    }
  }
  
  if (error instanceof Error) {
    return new AppError(error.message, ErrorCode.NETWORK_ERROR);
  }
  
  return AppError.network('Error desconocido');
}

// Implementación con Ky
class KyHttpClient implements HttpClient {
  private readonly client: KyInstance;

  constructor() {
    this.client = ky.create({
      prefixUrl: CONFIG.API.BASE_URL,
      retry: {
        limit: 2,
      },
      timeout: CONFIG.API.TIMEOUT,
    });
  }

  async get<T>(url: string, options?: Options): Promise<T> {
    return this.client.get(url, options).json<T>();
  }

  async post<T>(url: string, options?: Options): Promise<T> {
    return this.client.post(url, options).json<T>();
  }

  async put<T>(url: string, options?: Options): Promise<T> {
    return this.client.put(url, options).json<T>();
  }

  async delete<T>(url: string, options?: Options): Promise<T> {
    return this.client.delete(url, options).json<T>();
  }

  async head(url: string, options?: Options): Promise<void> {
    return this.client.head(url, options).json<void>();
  }
}

// Singleton instance
export const httpClient: HttpClient = new KyHttpClient();

// Wrapper con Result type para manejo de errores
export const http = {
  get: async <T>(url: string, options?: Options) => 
    Result.tryCatch<T>(() => httpClient.get<T>(url, options), mapHttpError),

  post: async <T>(url: string, options?: Options) => 
    Result.tryCatch<T>(() => httpClient.post<T>(url, options), mapHttpError),

  put: async <T>(url: string, options?: Options) => 
    Result.tryCatch<T>(() => httpClient.put<T>(url, options), mapHttpError),

  delete: async <T>(url: string, options?: Options) => 
    Result.tryCatch<T>(() => httpClient.delete<T>(url, options), mapHttpError),

  head: async (url: string, options?: Options) => 
    Result.tryCatch<void>(() => httpClient.head(url, options), mapHttpError),
};

// Helper para subir archivos con Result
export const uploadFile = async (
  url: string,
  body: BodyInit,
  contentType: string
): Promise<Result<void, AppError>> => {
  return Result.tryCatch(async () => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body,
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
  });
};
