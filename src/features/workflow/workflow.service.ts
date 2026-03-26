import { database, type WorkflowRecord } from '../../core/services/database.service';
import { documentService } from '../document/document.service';
import { OCIUtils } from '../../core/utils/oci.utils';
import { AppError, Result } from '../../core/types/result';
import type { QRData, Documento } from '../../core/types/domain';

export type WorkflowStep = 1 | 2 | 3;

export interface WorkflowState {
  readonly ssc: string;
  readonly currentStep: WorkflowStep;
  readonly qrData: QRData;
  readonly documento: Documento;
}

class WorkflowService {
  private currentWorkflow: WorkflowState | null = null;

  async init(): Promise<Result<void, AppError>> {
    return database.init();
  }

  // Iniciar o recuperar un workflow
  async startWorkflow(qrData: QRData, documento: Documento): Promise<Result<WorkflowStep, AppError>> {
    // Verificar si ya existe un workflow en progreso para este SSC
    const existingResult = await database.getWorkflow(qrData.ssc);
    
    if (!existingResult.ok) {
      return Result.failure(existingResult.error);
    }

    const existing = existingResult.value;

    if (existing && existing.status === 'in_progress') {
      // Recuperar workflow existente
      this.currentWorkflow = {
        ssc: existing.ssc,
        currentStep: existing.currentStep as WorkflowStep,
        qrData,
        documento: existing.documento as Documento,
      };

      return Result.success(existing.currentStep as WorkflowStep);
    }

    // Crear nuevo workflow
    const now = Date.now();
    const record: WorkflowRecord = {
      ssc: qrData.ssc,
      currentStep: 1,
      status: 'in_progress',
      documento,
      createdAt: now,
      updatedAt: now,
    };

    const saveResult = await database.saveWorkflow(record);
    if (!saveResult.ok) {
      return Result.failure(saveResult.error);
    }

    this.currentWorkflow = {
      ssc: qrData.ssc,
      currentStep: 1,
      qrData,
      documento,
    };

    return Result.success(1);
  }

  // Avanzar al paso 2 (fórmula capturada y subida a OCI)
  async advanceToStep2(presignedUrl: string): Promise<Result<void, AppError>> {
    if (!this.currentWorkflow) {
      return Result.failure(AppError.validation('No hay workflow activo'));
    }

    // Extraer el nombre del archivo de la URL presignada y construir la URL pública de OCI
    const objectName = OCIUtils.getObjectNameFromUrl(presignedUrl) 
      || `formula-${this.currentWorkflow.ssc}.jpg`;
    const publicUrl = OCIUtils.getObjectUrl(objectName);

    // Actualizar documento con URL pública de la fórmula
    const updatedDocumento = {
      ...this.currentWorkflow.documento,
      url: publicUrl, // URL pública de OCI
    };

    const record: WorkflowRecord = {
      ssc: this.currentWorkflow.ssc,
      currentStep: 2,
      status: 'in_progress',
      documento: updatedDocumento,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const saveResult = await database.saveWorkflow(record);
    if (!saveResult.ok) {
      return Result.failure(saveResult.error);
    }

    this.currentWorkflow = {
      ...this.currentWorkflow,
      currentStep: 2,
      documento: updatedDocumento,
    };

    return Result.success(undefined);
  }

  // Avanzar al paso 3 (firma capturada y subida a OCI, o firma existente)
  async advanceToStep3(presignedUrl: string | 'existing'): Promise<Result<void, AppError>> {
    if (!this.currentWorkflow) {
      return Result.failure(AppError.validation('No hay workflow activo'));
    }

    // Actualizar documento con URL de la firma (si es nueva)
    let publicUrl: string;
    
    if (presignedUrl === 'existing') {
      // Usar la URL existente del documento
      publicUrl = this.currentWorkflow.documento.url || OCIUtils.getObjectUrl(`firma-${this.currentWorkflow.ssc}.svg`);
    } else {
      // Extraer el nombre del archivo de la URL presignada y construir la URL pública
      const objectName = OCIUtils.getObjectNameFromUrl(presignedUrl) 
        || `firma-${this.currentWorkflow.ssc}.svg`;
      publicUrl = OCIUtils.getObjectUrl(objectName);
    }

    const updatedDocumento = {
      ...this.currentWorkflow.documento,
      url: publicUrl, // URL pública de OCI
    };

    const record: WorkflowRecord = {
      ssc: this.currentWorkflow.ssc,
      currentStep: 3,
      status: 'in_progress',
      documento: updatedDocumento,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const saveResult = await database.saveWorkflow(record);
    if (!saveResult.ok) {
      return Result.failure(saveResult.error);
    }

    this.currentWorkflow = {
      ...this.currentWorkflow,
      currentStep: 3,
      documento: updatedDocumento,
    };

    return Result.success(undefined);
  }

  // Completar workflow e insertar nueva línea en la base de datos cloud
  // Esto aplica tanto para documentos nuevos como para entregas parciales
  async completeWorkflow(): Promise<Result<void, AppError>> {
    if (!this.currentWorkflow) {
      return Result.failure(AppError.validation('No hay workflow activo'));
    }

    // Insertar nueva línea del documento en el servidor cloud
    // El backend debe manejar la inserción de la nueva línea
    const createResult = await documentService.create(this.currentWorkflow.documento);
    if (!createResult.ok) {
      return Result.failure(createResult.error);
    }

    // Eliminar workflow de la base local
    await database.deleteWorkflow(this.currentWorkflow.ssc);
    this.currentWorkflow = null;

    return Result.success(undefined);
  }

  // Obtener workflow actual
  getCurrentWorkflow(): WorkflowState | null {
    return this.currentWorkflow;
  }

  // Limpiar workflow actual (cancelar)
  clearCurrentWorkflow(): void {
    this.currentWorkflow = null;
  }

  // Obtener workflows pendientes
  async getPendingWorkflows(): Promise<Result<WorkflowRecord[], AppError>> {
    return database.getInProgressWorkflows();
  }
}

export const workflowService = new WorkflowService();
