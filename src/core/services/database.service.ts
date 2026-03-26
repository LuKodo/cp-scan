import { AppError, Result } from '../types/result';

/**
 * Servicio de base de datos local usando IndexedDB
 * Solo guarda estado de progreso, no datos de imágenes
 */

const DB_NAME = 'CPScanDB';
const DB_VERSION = 1;

export enum StoreNames {
  WORKFLOW = 'workflows',
}

export interface WorkflowRecord {
  readonly ssc: string; // Primary key
  readonly currentStep: number;
  readonly status: 'in_progress' | 'completed';
  readonly documento: unknown; // Datos del documento para actualizar en cloud al final
  readonly createdAt: number;
  readonly updatedAt: number;
}

class DatabaseService {
  private db: IDBDatabase | null = null;

  async init(): Promise<Result<void, AppError>> {
    return new Promise((resolve) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        resolve(Result.failure(AppError.storage('Error al abrir la base de datos')));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(Result.success(undefined));
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Store para workflows en progreso
        if (!db.objectStoreNames.contains(StoreNames.WORKFLOW)) {
          const store = db.createObjectStore(StoreNames.WORKFLOW, { keyPath: 'ssc' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
      };
    });
  }

  private getStore(storeName: StoreNames, mode: IDBTransactionMode = 'readonly'): IDBObjectStore | null {
    if (!this.db) return null;
    const transaction = this.db.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  async saveWorkflow(record: WorkflowRecord): Promise<Result<void, AppError>> {
    const store = this.getStore(StoreNames.WORKFLOW, 'readwrite');
    if (!store) return Result.failure(AppError.storage('Base de datos no inicializada'));

    return new Promise((resolve) => {
      const request = store.put(record);

      request.onsuccess = () => resolve(Result.success(undefined));
      request.onerror = () => resolve(Result.failure(AppError.storage('Error al guardar workflow')));
    });
  }

  async getWorkflow(ssc: string): Promise<Result<WorkflowRecord | null, AppError>> {
    const store = this.getStore(StoreNames.WORKFLOW);
    if (!store) return Result.failure(AppError.storage('Base de datos no inicializada'));

    return new Promise((resolve) => {
      const request = store.get(ssc);

      request.onsuccess = () => {
        const result = request.result as WorkflowRecord | undefined;
        resolve(Result.success(result ?? null));
      };
      request.onerror = () => resolve(Result.failure(AppError.storage('Error al leer workflow')));
    });
  }

  async getInProgressWorkflows(): Promise<Result<WorkflowRecord[], AppError>> {
    const store = this.getStore(StoreNames.WORKFLOW);
    if (!store) return Result.failure(AppError.storage('Base de datos no inicializada'));

    return new Promise((resolve) => {
      const index = store.index('status');
      const request = index.getAll('in_progress');

      request.onsuccess = () => {
        resolve(Result.success(request.result as WorkflowRecord[]));
      };
      request.onerror = () => resolve(Result.failure(AppError.storage('Error al listar workflows')));
    });
  }

  async deleteWorkflow(ssc: string): Promise<Result<void, AppError>> {
    const store = this.getStore(StoreNames.WORKFLOW, 'readwrite');
    if (!store) return Result.failure(AppError.storage('Base de datos no inicializada'));

    return new Promise((resolve) => {
      const request = store.delete(ssc);

      request.onsuccess = () => resolve(Result.success(undefined));
      request.onerror = () => resolve(Result.failure(AppError.storage('Error al eliminar workflow')));
    });
  }
}

export const database = new DatabaseService();
