import { database, type WorkflowRecord } from '../../core/services/database.service';
import { documentService } from '../document/document.service';
import { FileUtils } from '../../core/utils/file.utils';
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

  // Avanzar al paso 2 (fórmula capturada)
  async advanceToStep2(): Promise<Result<void, AppError>> {
    if (!this.currentWorkflow) {
      return Result.failure(AppError.validation('No hay workflow activo'));
    }

    const record: WorkflowRecord = {
      ssc: this.currentWorkflow.ssc,
      currentStep: 2,
      status: 'in_progress',
      documento: this.currentWorkflow.documento,
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
    };

    return Result.success(undefined);
  }

  // Avanzar al paso 3 (firma capturada)
  async advanceToStep3(): Promise<Result<void, AppError>> {
    if (!this.currentWorkflow) {
      return Result.failure(AppError.validation('No hay workflow activo'));
    }

    const record: WorkflowRecord = {
      ssc: this.currentWorkflow.ssc,
      currentStep: 3,
      status: 'in_progress',
      documento: this.currentWorkflow.documento,
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
    };

    return Result.success(undefined);
  }

  // Completar workflow e insertar nueva línea en la base de datos cloud
  async completeWorkflow(): Promise<Result<void, AppError>> {
    if (!this.currentWorkflow) {
      return Result.failure(AppError.validation('No hay workflow activo'));
    }

    // Insertar nueva línea del documento en el servidor cloud
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

  // Generar nombre único para fórmula
  generateFormulaFilename(ssc: string): string {
    return FileUtils.generateUniqueFileName(ssc, 'formula', 'jpg');
  }

  // Generar nombre fijo para firma
  generateSignatureFilename(ssc: string): string {
    return `firma-${ssc}.svg`;
  }
}

export const workflowService = new WorkflowService();
