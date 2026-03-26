import { useCallback, useState, useEffect } from 'react';
import { qrScannerService } from './scanner.service';
import { AppError, Result } from '../../core/types/result';
import type { QRData } from '../../core/types/domain';

interface UseQRScannerReturn {
  readonly scan: () => Promise<Result<QRData, AppError>>;
  readonly isScanning: boolean;
  readonly isAvailable: boolean;
  readonly error: AppError | null;
  readonly clearError: () => void;
}

export function useQRScanner(): UseQRScannerReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  useEffect(() => {
    qrScannerService.isAvailable().then(setIsAvailable);
  }, []);

  const scan = useCallback(async (): Promise<Result<QRData, AppError>> => {
    setIsScanning(true);
    setError(null);

    try {
      const result = await qrScannerService.scan();
      
      if (!result.ok) {
        setError(result.error);
      }
      
      return result;
    } catch (err) {
      const error = AppError.scanner(
        err instanceof Error ? err.message : 'Error desconocido al escanear'
      );
      setError(error);
      return Result.failure(error);
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    scan,
    isScanning,
    isAvailable,
    error,
    clearError,
  };
}
