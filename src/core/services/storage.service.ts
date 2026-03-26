import { AppError, Result } from '../types/result';

/**
 * Interfaz para almacenamiento
 * Usa localStorage como fallback si IndexedDB falla
 */
export interface StorageService {
  getItem<T>(key: string): Promise<Result<T | null, AppError>>;
  setItem<T>(key: string, value: T): Promise<Result<void, AppError>>;
  removeItem(key: string): Promise<Result<void, AppError>>;
  clear(): Promise<Result<void, AppError>>;
}

// Implementación híbrida: Intenta IndexedDB primero, fallback a localStorage
class HybridStorageService implements StorageService {
  private DB_NAME = 'CPScanDB';
  private STORE_NAME = 'app_storage';
  private DB_VERSION = 2;
  private useLocalStorage = false;

  async getItem<T>(key: string): Promise<Result<T | null, AppError>> {
    // Si localStorage falló antes, usarlo directamente
    if (this.useLocalStorage) {
      return this.getFromLocalStorage<T>(key);
    }

    try {
      const db = await this.getDBWithTimeout(2000);
      if (!db) {
        this.useLocalStorage = true;
        return this.getFromLocalStorage<T>(key);
      }

      const transaction = db.transaction([this.STORE_NAME], 'readonly');
      const store = transaction.objectStore(this.STORE_NAME);
      
      return new Promise((resolve) => {
        const request = store.get(key);
        request.onsuccess = () => {
          const result = request.result;
          resolve(Result.success(result?.value ?? null));
        };
        request.onerror = () => {
          resolve(Result.success(null));
        };
      });
    } catch {
      this.useLocalStorage = true;
      return this.getFromLocalStorage<T>(key);
    }
  }

  async setItem<T>(key: string, value: T): Promise<Result<void, AppError>> {
    if (this.useLocalStorage) {
      return this.setToLocalStorage(key, value);
    }

    try {
      const db = await this.getDBWithTimeout(2000);
      if (!db) {
        this.useLocalStorage = true;
        return this.setToLocalStorage(key, value);
      }

      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      return new Promise((resolve) => {
        const request = store.put({ key, value });
        request.onsuccess = () => resolve(Result.success(undefined));
        request.onerror = () => {
          this.useLocalStorage = true;
          resolve(this.setToLocalStorage(key, value));
        };
      });
    } catch {
      this.useLocalStorage = true;
      return this.setToLocalStorage(key, value);
    }
  }

  async removeItem(key: string): Promise<Result<void, AppError>> {
    if (this.useLocalStorage) {
      return this.removeFromLocalStorage(key);
    }

    try {
      const db = await this.getDBWithTimeout(2000);
      if (!db) {
        return this.removeFromLocalStorage(key);
      }

      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      return new Promise((resolve) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve(Result.success(undefined));
        request.onerror = () => resolve(this.removeFromLocalStorage(key));
      });
    } catch {
      return this.removeFromLocalStorage(key);
    }
  }

  async clear(): Promise<Result<void, AppError>> {
    localStorage.clear();
    
    try {
      const db = await this.getDBWithTimeout(2000);
      if (!db) return Result.success(undefined);

      const transaction = db.transaction([this.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(this.STORE_NAME);
      
      return new Promise((resolve) => {
        const request = store.clear();
        request.onsuccess = () => resolve(Result.success(undefined));
        request.onerror = () => resolve(Result.success(undefined));
      });
    } catch {
      return Result.success(undefined);
    }
  }

  // localStorage fallback methods
  private getFromLocalStorage<T>(key: string): Result<T | null, AppError> {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return Result.success(null);
      return Result.success(JSON.parse(raw) as T);
    } catch {
      return Result.success(null);
    }
  }

  private setToLocalStorage<T>(key: string, value: T): Result<void, AppError> {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return Result.success(undefined);
    } catch (e) {
      return Result.failure(AppError.storage('No se pudo guardar'));
    }
  }

  private removeFromLocalStorage(key: string): Result<void, AppError> {
    try {
      localStorage.removeItem(key);
      return Result.success(undefined);
    } catch {
      return Result.success(undefined);
    }
  }

  // IndexedDB with timeout
  private async getDBWithTimeout(timeoutMs: number): Promise<IDBDatabase | null> {
    return Promise.race([
      this.getDB(),
      new Promise<null>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeoutMs)
      ).catch(() => null)
    ]);
  }

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);
        
        request.onerror = () => reject(new Error('No se pudo abrir la base de datos'));
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(this.STORE_NAME)) {
            db.createObjectStore(this.STORE_NAME, { keyPath: 'key' });
          }
        };
      } catch (e) {
        reject(e);
      }
    });
  }
}

// Singleton
export const storage: StorageService = new HybridStorageService();
