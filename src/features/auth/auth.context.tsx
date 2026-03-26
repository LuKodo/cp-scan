import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { authService } from './auth.service';
import type { Session, User, LoginCredentials } from '../../core/types/domain';
import type { AppError } from '../../core/types/result';

// ============ Estado del contexto ============
interface AuthState {
  readonly session: Session | null;
  readonly isLoading: boolean;
  readonly error: AppError | null;
}

// ============ Acciones del contexto ============
interface AuthActions {
  readonly login: (credentials: LoginCredentials) => Promise<void>;
  readonly logout: () => Promise<void>;
  readonly clearError: () => void;
}

// ============ Context completo ============
type AuthContextValue = AuthState & AuthActions;

const AuthContext = createContext<AuthContextValue | null>(null);

// ============ Provider ============
interface AuthProviderProps {
  readonly children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AppError | null>(null);

  // Inicialización - verificar sesión existente
  useEffect(() => {
    const initSession = async () => {
      try {
        const result = await authService.getSession();
        if (result.ok) {
          setSession(result.value);
        }
      } catch (e) {
        console.error('Error inicializando sesión:', e);
      } finally {
        setIsLoading(false);
      }
    };

    initSession();
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.login(credentials);

      if (result.ok) {
        setSession(result.value);
      } else {
        setError(result.error);
        throw result.error;
      }
    } catch (err) {
      // Asegurar que el error se propague
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Login error:', errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setSession(null);
      setError(null);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value: AuthContextValue = {
    session,
    isLoading,
    error,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ============ Hook ============
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}

// ============ Selectors (optimización) ============
export const useAuthUser = (): User | null => {
  const { session } = useAuth();
  return session?.user ?? null;
};

export const useIsAuthenticated = (): boolean => {
  const { session } = useAuth();
  return session !== null;
};

export const useSignatureMethod = (): 'FIRMA' | 'FOTO' | null => {
  const user = useAuthUser();
  return user?.metodoFirma ?? null;
};
