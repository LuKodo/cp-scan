/**
 * Utilidades para generar nombres de archivo únicos
 */

export const FileUtils = {
  /**
   * Genera un nombre de archivo único con fecha
   * Formato: {tipo}-{ssc}-{AAAAMMDD}.{extension}
   * Ejemplo: formula-ABC123-20240326.jpg
   */
  generateUniqueFileName(
    ssc: string,
    type: 'formula' | 'firma',
    extension: 'jpg' | 'svg' = 'jpg'
  ): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    return `${type}-${ssc}-${dateStr}.${extension}`;
  },

  /**
   * Extrae información de un nombre de archivo
   * Formato esperado: {tipo}-{ssc}-{fecha}.{extension}
   */
  parseFileName(filename: string): {
    type: string;
    ssc: string;
    date: string;
    extension: string;
  } | null {
    const match = filename.match(/^(.+)-(.+)-(\d{8})\.(\w+)$/);
    if (!match) return null;

    return {
      type: match[1],
      ssc: match[2],
      date: match[3],
      extension: match[4],
    };
  },
};
