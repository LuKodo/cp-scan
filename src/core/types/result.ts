/**
 * Result type - Pattern para manejo de errores explícito
 * Basado en Rust/Elm, mejor que try-catch para lógica de negocio
 */

export type Success<T> = {
  readonly ok: true;
  readonly value: T;
};

export type Failure<E> = {
  readonly ok: false;
  readonly error: E;
};

export type Result<T, E = AppError> = Success<T> | Failure<E>;

export const Result = {
  success: <T>(value: T): Success<T> => ({ ok: true, value }),
  
  failure: <E>(error: E): Failure<E> => ({ ok: false, error }),
  
  // Helper para convertir try-catch a Result
  tryCatch: async <T>(
    fn: () => Promise<T>,
    errorMapper?: (error: unknown) => AppError
  ): Promise<Result<T, AppError>> => {
    try {
      const value = await fn();
      return Result.success(value);
    } catch (error) {
      const mappedError = errorMapper?.(error) ?? AppError.from(error);
      return Result.failure(mappedError);
    }
  },

  // Helper para sincrónico
  tryCatchSync: <T>(
    fn: () => T,
    errorMapper?: (error: unknown) => AppError
  ): Result<T, AppError> => {
    try {
      return Result.success(fn());
    } catch (error) {
      return Result.failure(errorMapper?.(error) ?? AppError.from(error));
    }
  },

  // Map sobre un Result exitoso
  map: <T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> => {
    if (result.ok) {
      return Result.success(fn(result.value));
    }
    return result;
  },

  // FlatMap/Chain para encadenar operaciones que pueden fallar
  flatMap: <T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> => {
    if (result.ok) {
      return fn(result.value);
    }
    return result;
  },

  // Recuperarse de un error con valor por defecto
  getOrElse: <T, E>(result: Result<T, E>, defaultValue: T): T => {
    return result.ok ? result.value : defaultValue;
  },

  // Extraer valor o lanzar error
  unwrap: <T, E>(result: Result<T, E>): T => {
    if (result.ok) return result.value;
    throw result.error;
  },
};

// Error base de la aplicación
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  static from(error: unknown): AppError {
    if (error instanceof AppError) return error;
    if (error instanceof Error) {
      return new AppError(error.message, ErrorCode.UNKNOWN);
    }
    return new AppError('Unknown error', ErrorCode.UNKNOWN);
  }

  static network(message = 'Error de conexión'): AppError {
    return new AppError(message, ErrorCode.NETWORK_ERROR);
  }

  static auth(message = 'Sesión expirada'): AppError {
    return new AppError(message, ErrorCode.AUTH_ERROR);
  }

  static validation(message: string, field?: string): AppError {
    return new AppError(message, ErrorCode.VALIDATION_ERROR, field ? { field } : undefined);
  }

  static notFound(resource: string): AppError {
    return new AppError(`${resource} no encontrado`, ErrorCode.NOT_FOUND);
  }

  static scanner(message: string): AppError {
    return new AppError(message, ErrorCode.SCANNER_ERROR);
  }

  static storage(message: string): AppError {
    return new AppError(message, ErrorCode.STORAGE_ERROR);
  }

  static permissionDenied(message: string): AppError {
    return new AppError(message, ErrorCode.PERMISSION_DENIED);
  }
}

export enum ErrorCode {
  UNKNOWN = 'UNKNOWN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTH_ERROR = 'AUTH_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  SCANNER_ERROR = 'SCANNER_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
}

// Tipo para respuestas de servicios
export type ServiceResponse<T> = Promise<Result<T, AppError>>;
