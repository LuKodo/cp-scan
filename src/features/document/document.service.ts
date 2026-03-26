import { DocumentScanner } from '@capacitor-mlkit/document-scanner';
import { Capacitor } from '@capacitor/core';
import { CONFIG } from '../../core/config/app.config';
import { http, uploadFile } from '../../core/services/http.service';
import { DocumentMapper } from '../../core/mappers';
import { AppError, Result, ErrorCode, type ServiceResponse } from '../../core/types/result';
import type { Documento, DocumentoResponseDTO } from '../../core/types/domain';
import type { PresignedUrl } from '../../core/types/domain';
import type { ScanResult } from '../../core/types/domain';

export interface DocumentValidationResult {
  readonly canProceed: boolean;
  readonly estado: string;
  readonly message: string;
  readonly hasSignature: boolean; // Indica si ya existe firma en OCI
}

export interface DocumentService {
  create(document: Documento): ServiceResponse<void>;
  getBySSC(ssc: string): ServiceResponse<Documento>;
  validateDocumentStatus(ssc: string): ServiceResponse<DocumentValidationResult>;
  generatePresignedUrl(filename: string): ServiceResponse<string>;
  getPublicUrl(filename: string): ServiceResponse<string>;
  scanDocument(): ServiceResponse<ScanResult>;
  uploadImage(path: string, url: string): ServiceResponse<void>;
  uploadSVG(svg: string, url: string): ServiceResponse<void>;
}

class DocumentServiceImpl implements DocumentService {
  async create(document: Documento): ServiceResponse<void> {
    const result = await http.post('documentos', {
      json: document,
    });

    if (!result.ok) {
      return Result.failure(result.error);
    }

    return Result.success(undefined);
  }

  async getBySSC(ssc: string): ServiceResponse<Documento> {
    const result = await http.get<DocumentoResponseDTO>(`documentos/${ssc}`);

    if (!result.ok) {
      return Result.failure(result.error);
    }

    const documento = DocumentMapper.fromDTO(result.value);
    return Result.success(documento);
  }

  async validateDocumentStatus(ssc: string): ServiceResponse<DocumentValidationResult> {
    const result = await this.getBySSC(ssc);

    // Si no existe (404) o error de red, permitimos continuar (será un documento nuevo)
    if (!result.ok) {
      if (result.error.code === ErrorCode.NOT_FOUND) {
        return Result.success({
          canProceed: true,
          estado: 'NUEVO',
          message: 'Documento nuevo',
          hasSignature: false,
        });
      }
      return Result.failure(result.error);
    }

    const documento = result.value;
    const estado = documento.estado.toUpperCase();

    // Si es ENTREGA TOTAL, no permitir
    if (estado === 'ENTREGA TOTAL') {
      return Result.success({
        canProceed: false,
        estado,
        message: 'El documento ya ha sido entregado completamente',
        hasSignature: true, // Asumimos que si está completo, tiene firma
      });
    }

    // Verificar si ya existe firma en OCI
    const hasSignature = await this.checkSignatureExists(ssc);

    // Si es PARCIAL o PENDIENTE, permitir
    return Result.success({
      canProceed: true,
      estado,
      message: estado === 'PARCIAL'
        ? 'Documento con entrega parcial'
        : 'Documento pendiente',
      hasSignature,
    });
  }

  // Verificar si la firma ya existe en OCI
  // La firma siempre usa el nombre fijo: firma-{ssc}.svg
  private async checkSignatureExists(ssc: string): Promise<boolean> {
    const filename = `firma-${ssc}.svg`;
    console.log(`Verificando si existe firma: ${filename}`);
    
    try {
      // Hacer una petición HEAD al endpoint para verificar existencia sin descargar el archivo
      const result = await http.head(`file/view/${encodeURIComponent(filename)}`);
      
      if (result.ok) {
        console.log(`Firma existe: ${filename}`);
        return true;
      }
      
      console.log(`Firma no encontrada: ${filename}`);
      return false;
    } catch (error) {
      // Si el endpoint no soporta HEAD, intentar con GET pero sin procesar el body
      try {
        const response = await fetch(`${CONFIG.API.BASE_URL}/file/view/${encodeURIComponent(filename)}`, {
          method: 'HEAD',
        });
        
        if (response.ok || response.status === 200) {
          console.log(`Firma existe (fetch): ${filename}`);
          return true;
        }
        
        console.log(`Firma no encontrada (fetch): ${filename}, status: ${response.status}`);
        return false;
      } catch (fetchError) {
        console.error('Error verificando firma:', fetchError);
        return false;
      }
    }
  }

  async generatePresignedUrl(filename: string): ServiceResponse<string> {
    const result = await http.post<PresignedUrl>('file/presigned-url', {
      json: { filename },
    });

    if (!result.ok) {
      return Result.failure(result.error);
    }

    return Result.success(result.value.url);
  }

  async getPublicUrl(filename: string): ServiceResponse<string> {
    // Obtener URL pública desde la API
    const result = await http.get<{ url: string }>(`file/view/${encodeURIComponent(filename)}`);

    if (!result.ok) {
      return Result.failure(result.error);
    }

    return Result.success(result.value.url);
  }

  async scanDocument(): ServiceResponse<ScanResult> {
    if (Capacitor.getPlatform() === 'web') {
      return Result.failure(
        AppError.scanner('Document scanner no disponible en web')
      );
    }

    const isAvailable = DocumentScanner.isGoogleDocumentScannerModuleAvailable();
    if (!isAvailable) {
      return Result.failure(
        AppError.scanner('Document scanner no disponible en este dispositivo')
      );
    }

    try {
      const result = await DocumentScanner.scanDocument({
        resultFormats: CONFIG.SCANNER.DOCUMENT_RESULT_FORMAT,
        scannerMode: CONFIG.SCANNER.DOCUMENT_SCANNER_MODE,
        pageLimit: CONFIG.SCANNER.DOCUMENT_PAGE_LIMIT,
        galleryImportAllowed: false,
      });

      if (!result?.scannedImages?.length) {
        return Result.failure(
          AppError.scanner('No se escaneó ningún documento')
        );
      }

      return Result.success({
        success: true,
        images: result.scannedImages,
        message: 'Documento escaneado correctamente',
      });
    } catch (error) {
      return Result.failure(
        AppError.scanner(
          error instanceof Error ? error.message : 'Error al escanear documento'
        )
      );
    }
  }

  async uploadImage(path: string, url: string): ServiceResponse<void> {
    const fileUrl = Capacitor.convertFileSrc(path);

    const fetchResult = await Result.tryCatch<Response>(() => fetch(fileUrl));
    if (!fetchResult.ok) {
      return Result.failure(
        AppError.network('No se pudo leer el archivo')
      );
    }

    const bufferResult = await Result.tryCatch<ArrayBuffer>(() =>
      fetchResult.value.arrayBuffer()
    );
    if (!bufferResult.ok) {
      return Result.failure(
        AppError.network('Error leyendo el archivo')
      );
    }

    const binary = new Uint8Array(bufferResult.value);
    return uploadFile(url, binary, 'image/jpeg');
  }

  async uploadSVG(svg: string, url: string): ServiceResponse<void> {
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    return uploadFile(url, blob, 'image/svg+xml');
  }
}

export const documentService: DocumentService = new DocumentServiceImpl();
