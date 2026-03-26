import { database } from './database.service';
import { AppError, Result } from '../types/result';

/**
 * Interfaz para almacenamiento - ahora usa IndexedDB en lugar de localStorage
 * Permite mockear en tests y soporta datos más complejos
 */
export interface StorageService {
  getItem<T>(key: string): Promise<Result<T | null, AppError>>;
  setItem<T>(key: string, value: T): Promise<Result<void, AppError>>;
  removeItem(key: string): Promise<Result<void, AppError>>;
  clear(): Promise<Result<void, AppError>>;
}

// Implementación con IndexedDB (usando el database service existente)
// Para datos simples de sesión, usamos un store separado en la misma BD
class IndexedDBStorageService implements StorageService {
  private STORE_NAME = 'app_storage';

  async getItem<T>(key: string): Promise<Result<T | null, AppError>> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      
      return new Promise((resolve) => {
        const request = store.get(key);
        request.onsuccess = () => {
          const result = request.result;
          resolve(Result.success(result?.value ?? null));
        };
        request.onerror = () => {
          resolve(Result.failure(AppError.storage('Error al leer de storage')));
        };
      });
    } catch (error) {
      return Result.failure(AppError.storage('Storage no disponible'));
    }
  }

  async setItem<T>(key: string, value: T): Promise<Result<void, AppError>> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      return new Promise((resolve) => {
        const request = store.put({ key, value });
        request.onsuccess = () => resolve(Result.success(undefined));
        request.onerror = () => resolve(Result.failure(AppError.storage('Error al guardar en storage')));
      });
    } catch (error) {
      return Result.failure(AppError.storage('Storage no disponible'));
    }
  }

  async removeItem(key: string): Promise<Result<void, AppError>> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      return new Promise((resolve) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve(Result.success(undefined));
        request.onerror = () => resolve(Result.failure(AppError.storage('Error al eliminar de storage')));
      });
    } catch (error) {
      return Result.failure(AppError.storage('Storage no disponible'));
    }
  }

  async clear(): Promise<Result<void, AppError>> {
    try {
      const db = await this.getDB();
      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      return new Promise((resolve) => {
        const request = store.clear();
        request.onsuccess = () => resolve(Result.success(undefined));
        request.onerror = () => resolve(Result.failure(AppError.storage('Error al limpiar storage')));
      });
    } catch (error) {
      return Result.failure(AppError.storage('Storage no disponible'));
    }
  }

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('CPScanDB', 2); // Versión 2 para agregar store
      
      request.onerror = () => reject(new Error('No se pudo abrir la base de datos'));
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
        }
      };
    });
  }
}

// Singleton
export const storage: StorageService = new IndexedDBStorageService();
