/**
 * Tipos del dominio de la aplicación
 * Solo tipos puros, sin implementaciones
 */

// ============ Auth Domain ============
export interface User {
  readonly id: number;
  readonly name: string;
  readonly sede: string;
  readonly metodoFirma: SignatureMethod;
}

export interface Session {
  readonly user: User;
  readonly expiresAt: number;
}

export type SignatureMethod = 'FIRMA' | 'FOTO';

export interface LoginCredentials {
  readonly username: string;
  readonly password: string;
}

// ============ Document Domain ============
export interface Documento {
  readonly fechaescaneo: string;
  readonly horaescaneo: string;
  readonly url: string;
  readonly centrocosto: string;
  readonly ssc: string;
  readonly tipodocumento: string;
  readonly numerodocumento: string;
  readonly factura: string;
  readonly facturacuota: string;
  readonly fechadispensacion: string;
  readonly origen: string;
  readonly estado: DocumentState;
}

export type DocumentState = 'PENDIENTE' | 'PARCIAL' | 'ENTREGA TOTAL' | string;

export interface PresignedUrl {
  readonly url: string;
  readonly objectName: string;
}

export type DocumentType = 'formula' | 'firma';

// ============ QR Domain ============
export interface QRData {
  readonly ssc: string;
  readonly tipoDocumento: string;
  readonly numeroDocumento: string;
  readonly factura: string;
  readonly facturaCuota: string;
  readonly fechaDispensacion: string;
  readonly estado?: string;
}

// ============ Scanner Domain ============
export interface ScanResult {
  readonly success: boolean;
  readonly images: readonly string[];
  readonly message: string;
}

export interface QRScanResult {
  readonly rawValue: string;
  readonly format: string;
}

// ============ API Response Types ============
export interface APIResponse<T = unknown> {
  readonly data: T;
  readonly message?: string;
}

// DTOs para mapear respuestas del backend
export interface LoginResponseDTO {
  readonly id: number;
  readonly name: string;
  readonly sede: string;
  readonly metodo_firma: string;
}

export interface DocumentoResponseDTO {
  readonly fechaescaneo: string;
  readonly horaescaneo: string;
  readonly url: string;
  readonly centrocosto: string;
  readonly ssc: string;
  readonly tipodocumento: string;
  readonly numerodocumento: string;
  readonly factura: string;
  readonly facturacuota: string;
  readonly fechadispensacion: string;
  readonly origen: string;
  readonly estado: string;
}
