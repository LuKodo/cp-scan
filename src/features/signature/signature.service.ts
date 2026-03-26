import { CONFIG } from '../../core/config/app.config';
import { documentService } from '../document/document.service';
import { AppError, Result } from '../../core/types/result';
import type { ServiceResponse } from '../../core/types/result';

export interface SignatureService {
  save(paths: readonly string[], ssc: string): ServiceResponse<void>;
  generateSVG(paths: readonly string[]): string;
  validatePaths(paths: readonly string[]): Result<void, AppError>;
}

class SignatureServiceImpl implements SignatureService {
  validatePaths(paths: readonly string[]): Result<void, AppError> {
    if (paths.length === 0) {
      return Result.failure(
        AppError.validation('No hay una firma para guardar')
      );
    }
    return Result.success(undefined);
  }

  generateSVG(paths: readonly string[]): string {
    const { SVG_WIDTH, SVG_HEIGHT, EXPORT_STROKE_COLOR, EXPORT_STROKE_WIDTH } =
      CONFIG.SIGNATURE;

    const pathsSVG = paths
      .map(
        (d) => `
    <path
      d="${d}"
      stroke="${EXPORT_STROKE_COLOR}"
      stroke-width="${EXPORT_STROKE_WIDTH}"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />`
      )
      .join('');

    return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="${SVG_WIDTH}"
     height="${SVG_HEIGHT}"
     viewBox="0 0 ${SVG_WIDTH} ${SVG_HEIGHT}">
  ${pathsSVG}
</svg>
`.trim();
  }

  async save(paths: readonly string[], ssc: string): ServiceResponse<void> {
    // Validar
    const validation = this.validatePaths(paths);
    if (!validation.ok) {
      return validation;
    }

    // Generar SVG
    const svg = this.generateSVG(paths);

    // Obtener URL presignada
    const urlResult = await documentService.generatePresignedUrl(
      `firma-${ssc}.svg`
    );
    if (!urlResult.ok) {
      return urlResult;
    }

    // Subir
    return documentService.uploadSVG(svg, urlResult.value);
  }
}

export const signatureService: SignatureService = new SignatureServiceImpl();
