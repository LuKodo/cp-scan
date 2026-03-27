// Types
export { Result, AppError, ErrorCode } from './types/result';
export type { 
  Result as ResultType, 
  Success, 
  Failure, 
  ServiceResponse 
} from './types/result';
export type * from './types/domain';
export type { WorkflowFlags } from './types/domain';

// Config
export { CONFIG, THEME, ROUTES } from './config/app.config';
export type { Route, DocumentType, SignatureMethod } from './config/app.config';

// Services
export { httpClient, http, uploadFile } from './services/http.service';
export type { HttpClient } from './services/http.service';
export { storage } from './services/storage.service';
export type { StorageService } from './services/storage.service';
export { database, StoreNames, type WorkflowRecord } from './services/database.service';

// Mappers
export { AuthMapper, DocumentMapper } from './mappers';

// Utils
export { OCIUtils } from './utils/oci.utils';
export { FileUtils } from './utils/file.utils';
