import { useState, useCallback } from 'react';
import { IonPage } from '@ionic/react';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useIonRouter } from '@ionic/react';
import { toast } from 'sonner';
import { useAuth } from '../features';
import { Loader, Input, Button } from '../shared';
import { THEME, ROUTES } from '../core';

interface FormErrors {
  username?: string;
  password?: string;
}

export const LoginPage = () => {
  const router = useIonRouter();
  const { login, isLoading } = useAuth();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!username.trim()) {
      newErrors.username = 'El usuario es requerido';
    }
    if (!password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [username, password]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login({ username, password });
      toast.success('Bienvenido');
      // Navegar explícitamente después del login exitoso
      router.push(ROUTES.STEP_1_QR, 'forward');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al iniciar sesión');
    }
  }, [username, password, validateForm, login, router]);

  const handleUsernameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    if (errors.username) {
      setErrors(prev => ({ ...prev, username: undefined }));
    }
  }, [errors.username]);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  }, [errors.password]);

  return (
    <IonPage>
      {isLoading && (
        <Loader fullScreen message={isLoading ? "Verificando credenciales..." : "Cargando..."} />
      )}

      <div style={{
        minHeight: '100vh',
        width: '100%',
        background: `linear-gradient(135deg, ${THEME.colors.background} 0%, ${THEME.colors.backgroundGradient} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative shapes */}
        <DecorativeShape top="-60px" right="-40px" size={200} color={THEME.colors.accent} rotation={15} />
        <DecorativeShape top="40px" right="100px" size={80} color={THEME.colors.secondary} rotation={-10} />

        {/* Main Content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '40px 32px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Logo */}
          <div style={{ marginBottom: '48px' }}>
            <h1 style={{
              fontSize: '40px',
              fontWeight: 700,
              color: THEME.colors.primary,
            }}>CP Scan</h1>
          </div>

          {/* Header */}
          <div style={{ marginBottom: '40px' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: THEME.colors.primary,
              marginBottom: '8px',
              letterSpacing: '-0.5px',
            }}>
              Bienvenido
            </h1>
            <p style={{
              fontSize: '16px',
              color: THEME.colors.text.secondary,
              lineHeight: 1.5,
            }}>
              Ingresa tus credenciales para continuar
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Input
              label="Usuario"
              type="text"
              placeholder="Ingresa tu usuario"
              value={username}
              onChange={handleUsernameChange}
              leftIcon={<User size={20} />}
              error={errors.username}
              disabled={isLoading}
            />

            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={handlePasswordChange}
              leftIcon={<Lock size={20} />}
              error={errors.password}
              disabled={isLoading}
            />

            <Button
              type="submit"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={20} />}
              style={{ marginTop: '12px' }}
            >
              Ingresar
            </Button>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          padding: '24px 32px',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '12px',
            color: 'rgba(5, 63, 92, 0.35)',
            fontWeight: 500,
          }}>
            Distribuciones Pharmaser LTDA © 2026
          </p>
        </div>
      </div>
    </IonPage>
  );
};

// Subcomponente para formas decorativas
interface DecorativeShapeProps {
  top: string;
  right: string;
  size: number;
  color: string;
  rotation: number;
}

const DecorativeShape = ({ top, right, size, color, rotation }: DecorativeShapeProps) => (
  <div style={{
    position: 'absolute',
    top,
    right,
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: '40px',
    transform: `rotate(${rotation}deg)`,
    opacity: 0.9,
  }} />
);
