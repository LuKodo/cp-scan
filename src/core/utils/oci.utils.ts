import { CONFIG } from '../config/app.config';

/**
 * Utilidades para construir URLs de OCI Object Storage
 * Formato: https://{namespace}.objectstorage.{region}.oci.customer-oci.com/n/{namespace}/b/{bucket}/o/{object-name}
 */

export const OCIUtils = {
  /**
   * Construye la URL base de OCI Object Storage
   */
  getBaseUrl(): string {
    const { NAMESPACE, REGION } = CONFIG.OCI;
    return `https://${NAMESPACE}.objectstorage.${REGION}.oci.customer-oci.com`;
  },

  /**
   * Construye la URL completa para un objeto
   * @param objectName - Nombre del archivo (ej: 'formula-ABC123.jpg')
   */
  getObjectUrl(objectName: string): string {
    const { NAMESPACE, BUCKET } = CONFIG.OCI;
    const baseUrl = this.getBaseUrl();
    return `${baseUrl}/n/${NAMESPACE}/b/${BUCKET}/o/${encodeURIComponent(objectName)}`;
  },

  /**
   * Extrae el nombre del objeto de una URL de OCI
   * @param url - URL completa de OCI
   */
  getObjectNameFromUrl(url: string): string | null {
    const { NAMESPACE, BUCKET } = CONFIG.OCI;
    const pattern = new RegExp(`/n/${NAMESPACE}/b/${BUCKET}/o/(.+)$`);
    const match = url.match(pattern);
    return match ? decodeURIComponent(match[1]) : null;
  },

  /**
   * Verifica si una URL es de OCI Object Storage
   * @param url - URL a verificar
   */
  isOCIUrl(url: string): boolean {
    const { NAMESPACE, REGION } = CONFIG.OCI;
    return url.includes(`${NAMESPACE}.objectstorage.${REGION}.oci.customer-oci.com`);
  },
};
