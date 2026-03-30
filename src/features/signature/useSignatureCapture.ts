import { useCallback, useState, useRef } from 'react';
import { signatureService } from './signature.service';
import { AppError, Result } from '../../core/types/result';
import type { Point } from './signature.types';

interface UseSignatureCaptureOptions {
  readonly onSave?: () => void;
  readonly onClear?: () => void;
}

interface UseSignatureCaptureReturn {
  // Estado
  readonly paths: readonly string[];
  readonly currentPath: string | null;
  readonly isDrawing: boolean;
  readonly isSaving: boolean;
  readonly hasSignature: boolean;
  readonly error: AppError | null;

  // Handlers
  readonly startDrawing: (point: Point) => void;
  readonly moveDrawing: (point: Point) => void;
  readonly endDrawing: () => void;
  readonly clear: () => void;
  readonly save: (ssc: string) => Promise<Result<void, AppError>>;
  readonly clearError: () => void;
}

export function useSignatureCapture(
  options: UseSignatureCaptureOptions = {}
): UseSignatureCaptureReturn {
  const [paths, setPaths] = useState<readonly string[]>([]);
  const [currentPath, setCurrentPath] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<AppError | null>(null);
  const isDrawingRef = useRef(false);

  const startDrawing = useCallback((point: Point) => {
    isDrawingRef.current = true;
    setCurrentPath(`M ${point.x} ${point.y}`);
  }, []);

  const moveDrawing = useCallback((point: Point) => {
    if (!isDrawingRef.current || !currentPath) return;
    setCurrentPath((prev) => `${prev} L ${point.x} ${point.y}`);
  }, [currentPath]);

  const endDrawing = useCallback(() => {
    if (!isDrawingRef.current || !currentPath) return;

    isDrawingRef.current = false;
    setPaths((prev) => [...prev, currentPath]);
    setCurrentPath(null);
  }, [currentPath]);

  const clear = useCallback(() => {
    setPaths([]);
    setCurrentPath(null);
    setError(null);
    options.onClear?.();
  }, [options]);

  const save = useCallback(
    async (ssc: string): Promise<Result<void, AppError>> => {
      setIsSaving(true);
      setError(null);

      try {
        const result = await signatureService.save(paths, ssc);

        if (!result.ok) {
          setError(result.error);
        } else {
          options.onSave?.();
        }

        return result;
      } finally {
        setIsSaving(false);
      }
    },
    [paths, options]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const allPaths = currentPath ? [...paths, currentPath] : paths;

  return {
    paths: allPaths,
    currentPath,
    isDrawing: isDrawingRef.current,
    isSaving,
    hasSignature: paths.length > 0,
    error,
    startDrawing,
    moveDrawing,
    endDrawing,
    clear,
    save,
    clearError,
  };
}
