import { CONFIG } from '../../core/config/app.config';
import { AuthMapper } from '../../core/mappers';
import { http } from '../../core/services/http.service';
import { storage } from '../../core/services/storage.service';
import { AppError, Result, type ServiceResponse } from '../../core/types/result';
import type { LoginCredentials, Session, User, LoginResponseDTO } from '../../core/types/domain';

export interface AuthService {
  login(credentials: LoginCredentials): ServiceResponse<Session>;
  getSession(): Promise<Result<Session | null, AppError>>;
  logout(): Promise<Result<void, AppError>>;
  isSessionValid(session: Session): boolean;
}

// Implementación con dependencias inyectables (para testing)
class AuthServiceImpl implements AuthService {
  constructor(
    private readonly httpClient = http,
    private readonly storageService = storage
  ) {}

  async login(credentials: LoginCredentials): ServiceResponse<Session> {
    const result = await this.httpClient.post<LoginResponseDTO>('users/login', {
      json: {
        name: credentials.username,
        password: credentials.password,
      },
    });

    if (!result.ok) {
      return Result.failure(result.error);
    }

    const dto = result.value;

    // Validaciones de negocio
    if (!dto.metodo_firma) {
      return Result.failure(
        AppError.validation('No tienes un método de firma asociado')
      );
    }

    if (!dto.sede) {
      return Result.failure(
        AppError.validation('No tienes una sede asociada')
      );
    }

    const user = AuthMapper.toUser(dto);
    const expiresAt = Date.now() + CONFIG.AUTH.SESSION_DURATION_MS;
    const session = AuthMapper.toSession(user, expiresAt);

    // Guardar sesión
    const saveResult = await this.storageService.setItem(CONFIG.AUTH.STORAGE_KEY, session);
    if (!saveResult.ok) {
      return saveResult;
    }

    return Result.success(session);
  }

  async getSession(): Promise<Result<Session | null, AppError>> {
    const result = await this.storageService.getItem<Session>(CONFIG.AUTH.STORAGE_KEY);
    
    if (!result.ok) {
      return result;
    }

    const session = result.value;

    if (!session) {
      return Result.success(null);
    }

    if (Date.now() > session.expiresAt) {
      await this.logout();
      return Result.success(null);
    }

    return Result.success(session);
  }

  async logout(): Promise<Result<void, AppError>> {
    return this.storageService.removeItem(CONFIG.AUTH.STORAGE_KEY);
  }

  isSessionValid(session: Session): boolean {
    return Date.now() < session.expiresAt;
  }
}

// Singleton
export const authService: AuthService = new AuthServiceImpl();
