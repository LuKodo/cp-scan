import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { Camera } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { AppError, Result } from '../../core/types/result';
import type { ServiceResponse } from '../../core/types/result';
import type { QRData, Documento } from '../../core/types/domain';

export interface QRScannerService {
  initialize(): Promise<void>;
  scan(): ServiceResponse<QRData>;
  isAvailable(): Promise<boolean>;
}

// Parser de QR puro - fácil de testear
export function parseQRCode(qr: string): Result<QRData, AppError> {
  const parts = qr.split('|');
  
  if (parts.length < 6) {
    return Result.failure(
      AppError.validation('Formato de QR inválido')
    );
  }

  const getValue = (index: number): Result<string, AppError> => {
    const part = parts[index];
    if (!part?.includes(':')) {
      return Result.failure(AppError.validation(`Campo ${index} inválido`));
    }
    return Result.success(part.split(':')[1]?.trim() ?? '');
  };

  const sscResult = getValue(0);
  if (!sscResult.ok) return sscResult;

  const tipoResult = getValue(1);
  if (!tipoResult.ok) return tipoResult;

  const numResult = getValue(2);
  if (!numResult.ok) return numResult;

  const facturaResult = getValue(3);
  if (!facturaResult.ok) return facturaResult;

  const cuotaResult = getValue(4);
  if (!cuotaResult.ok) return cuotaResult;

  const fechaPart = parts[5];
  if (!fechaPart?.includes(':')) {
    return Result.failure(AppError.validation('Fecha inválida'));
  }
  const fechaDisp = fechaPart.split(': ')[1]?.split(' ')[0] ?? '';

  const estado = parts[6]?.split(':')[1]?.trim();

  return Result.success({
    ssc: sscResult.value,
    tipoDocumento: tipoResult.value,
    numeroDocumento: numResult.value,
    factura: facturaResult.value,
    facturaCuota: cuotaResult.value,
    fechaDispensacion: fechaDisp,
    estado,
  });
}

// Implementación del servicio
class QRScannerServiceImpl implements QRScannerService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (Capacitor.getPlatform() === 'web') {
      throw new Error('Scanner no disponible en web');
    }

    const isAvailable = BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    if (!isAvailable) {
      throw new Error('Scanner no disponible en este dispositivo');
    }

    await BarcodeScanner.installGoogleBarcodeScannerModule();
    this.initialized = true;
  }

  async isAvailable(): Promise<boolean> {
    if (Capacitor.getPlatform() === 'web') return false;
    const result = await BarcodeScanner.isGoogleBarcodeScannerModuleAvailable();
    return result.available;
  }

  async scan(): ServiceResponse<QRData> {
    // Verificar permisos de cámara
    const cameraPerm = await Camera.checkPermissions();
    if (cameraPerm.camera !== 'granted') {
      const requestResult = await Camera.requestPermissions();
      if (requestResult.camera !== 'granted') {
        return Result.failure(
          AppError.permissionDenied('Se requiere permiso de cámara')
        );
      }
    }

    // Verificar permisos del scanner
    const scannerPerm = await BarcodeScanner.requestPermissions();
    if (scannerPerm.camera !== 'granted') {
      return Result.failure(
        AppError.permissionDenied('Se requiere permiso de cámara para el scanner')
      );
    }

    // Escanear
    const result = await BarcodeScanner.scan();

    if (!result.barcodes.length) {
      return Result.failure(
        AppError.scanner('No se detectó ningún código QR')
      );
    }

    const rawValue = result.barcodes[0].rawValue;
    if (!rawValue) {
      return Result.failure(AppError.scanner('QR inválido'));
    }

    return parseQRCode(rawValue);
  }
}

export const qrScannerService: QRScannerService = new QRScannerServiceImpl();
