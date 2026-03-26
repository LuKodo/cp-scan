import { useCallback, useState } from 'react';
import { documentService } from './document.service';
import { AppError, Result } from '../../core/types/result';
import type { ScanResult } from '../../core/types/domain';

interface UploadResult {
  readonly url: string;
}

interface UseDocumentCaptureReturn {
  readonly scan: () => Promise<Result<ScanResult, AppError>>;
  readonly upload: (ssc: string, type: string) => Promise<Result<UploadResult, AppError>>;
  readonly isScanning: boolean;
  readonly isUploading: boolean;
  readonly error: AppError | null;
  readonly clearError: () => void;
}

export function useDocumentCapture(): UseDocumentCaptureReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<AppError | null>(null);

  const scan = useCallback(async (): Promise<Result<ScanResult, AppError>> => {
    setIsScanning(true);
    setError(null);

    try {
      const result = await documentService.scanDocument();

      if (!result.ok) {
        setError(result.error);
      }

      return result;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const upload = useCallback(
    async (ssc: string, type: string): Promise<Result<UploadResult, AppError>> => {
      setIsUploading(true);
      setError(null);

      try {
        // Generar URL presignada
        const urlResult = await documentService.generatePresignedUrl(
          `${type}-${ssc}.jpg`
        );
        if (!urlResult.ok) {
          setError(urlResult.error);
          return urlResult;
        }

        // Escanear documento
        const scanResult = await documentService.scanDocument();
        if (!scanResult.ok) {
          setError(scanResult.error);
          return scanResult;
        }

        const imagePath = scanResult.value.images[0];
        if (!imagePath) {
          const err = AppError.validation('No se obtuvo imagen del escaneo');
          setError(err);
          return Result.failure(err);
        }

        // Subir imagen
        const uploadResult = await documentService.uploadImage(
          imagePath,
          urlResult.value
        );

        if (!uploadResult.ok) {
          setError(uploadResult.error);
          return uploadResult;
        }

        // Retornar la URL de la imagen subida
        return Result.success({ url: urlResult.value });
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    scan,
    upload,
    isScanning,
    isUploading,
    error,
    clearError,
  };
}
