import { useEffect, useState, useCallback } from "react";
import { IonPage } from "@ionic/react";
import { App } from "@capacitor/app";
import { 
  RefreshCw, 
  Download, 
  AlertCircle, 
  Sparkles,
  ShieldCheck,
  XCircle,
  WifiOff
} from "lucide-react";
import { http, THEME } from "../core";
import { Button, Loader, Card } from "../shared";
import type { Version } from "../features/checker";

type CheckState = 'checking' | 'updating' | 'error' | 'success';

interface UpdateState {
  status: CheckState;
  currentVersion: string;
  serverVersion: Version | null;
  error: string | null;
}

export const UpdateChecker: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UpdateState>({
    status: 'checking',
    currentVersion: '',
    serverVersion: null,
    error: null,
  });

  const checkVersion = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'checking', error: null }));
    
    try {
      const info = await App.getInfo();
      
      const response = await http.get('version');
      if (!response.ok) {
        throw new Error('No se pudo verificar la versión');
      }
      
      const serverVersion = response.value as Version;
      
      setState({
        status: 'checking',
        currentVersion: info.version,
        serverVersion,
        error: null,
      });

      const needsUpdate = isUpdateRequired(info.version, serverVersion);
      
      if (needsUpdate) {
        setState(prev => ({ ...prev, status: 'updating' }));
      } else {
        setState(prev => ({ ...prev, status: 'success' }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Error desconocido',
      }));
    }
  }, []);

  useEffect(() => {
    checkVersion();
  }, [checkVersion]);

  const isUpdateRequired = (current: string, server: Version): boolean => {
    if (server.forceUpdate) {
      return compareVersions(current, server.minVersion) < 0;
    }
    return compareVersions(current, server.version) < 0;
  };

  const compareVersions = (v1: string, v2: string): number => {
    const parts1 = v1.split('.').map(Number);
    const parts2 = v2.split('.').map(Number);

    for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
      const p1 = parts1[i] || 0;
      const p2 = parts2[i] || 0;
      if (p1 < p2) return -1;
      if (p1 > p2) return 1;
    }
    return 0;
  };

  const handleDownload = useCallback(() => {
    if (state.serverVersion?.downloadUrl) {
      window.open(state.serverVersion.downloadUrl, '_system');
    }
  }, [state.serverVersion]);

  // Pantalla de verificación inicial
  if (state.status === 'checking') {
    return (
      <IonPage>
        <div style={{
          minHeight: '100vh',
          width: '100%',
          background: `linear-gradient(135deg, ${THEME.colors.background} 0%, ${THEME.colors.backgroundGradient} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative shapes */}
          <DecorativeShape top="-80px" right="-60px" size={240} color={THEME.colors.accent} rotation={20} />
          <DecorativeShape top="60px" right="120px" size={100} color={THEME.colors.secondary} rotation={-15} />
          <DecorativeShape bottom="100px" left="-40px" size={120} color={THEME.colors.light} rotation={30} />

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            zIndex: 1,
          }}>
            {/* Logo Icon */}
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '24px',
              background: `linear-gradient(135deg, ${THEME.colors.accent} 0%, ${THEME.colors.primary} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: `0 8px 32px rgba(66, 158, 189, 0.4)`,
              animation: 'popIn 0.5s ease-out',
            }}>
              <ShieldCheck size={40} style={{ color: THEME.colors.white }} />
            </div>

            <div style={{ textAlign: 'center', animation: 'slideUp 0.5s ease-out 0.1s both' }}>
              <h1 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: THEME.colors.primary,
                marginBottom: '8px',
              }}>
                Verificando versión
              </h1>
              <p style={{
                fontSize: '14px',
                color: THEME.colors.text.secondary,
              }}>
                Estamos comprobando que tengas la última versión
              </p>
            </div>

            <div style={{ animation: 'fadeIn 0.5s ease-out 0.2s both' }}>
              <Loader size="md" message="" />
            </div>

            {state.currentVersion && (
              <p style={{
                fontSize: '13px',
                color: THEME.colors.text.muted,
                animation: 'fadeIn 0.5s ease-out 0.3s both',
              }}>
                Versión instalada: <strong>{state.currentVersion}</strong>
              </p>
            )}
          </div>
        </div>
      </IonPage>
    );
  }

  // Pantalla de error
  if (state.status === 'error') {
    const isNetworkError = state.error?.toLowerCase().includes('network') || 
                          state.error?.toLowerCase().includes('fetch') ||
                          state.error?.toLowerCase().includes('conexión');
    
    return (
      <IonPage>
        <div style={{
          minHeight: '100vh',
          width: '100%',
          background: `linear-gradient(135deg, ${THEME.colors.background} 0%, ${THEME.colors.backgroundGradient} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative shapes */}
          <DecorativeShape top="-80px" right="-60px" size={240} color="rgba(239, 68, 68, 0.2)" rotation={20} />
          <DecorativeShape bottom="100px" left="-40px" size={120} color={THEME.colors.light} rotation={30} />

          <Card style={{
            width: '100%',
            maxWidth: '380px',
            textAlign: 'center',
            animation: 'slideUp 0.4s ease-out',
          }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '24px',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
            }}>
              {isNetworkError ? (
                <WifiOff size={36} style={{ color: '#ef4444' }} />
              ) : (
                <XCircle size={36} style={{ color: '#ef4444' }} />
              )}
            </div>

            <h2 style={{
              fontSize: '22px',
              fontWeight: 700,
              color: THEME.colors.primary,
              marginBottom: '12px',
            }}>
              {isNetworkError ? 'Sin conexión' : 'Error de verificación'}
            </h2>

            <p style={{
              fontSize: '14px',
              color: THEME.colors.text.secondary,
              lineHeight: 1.6,
              marginBottom: '24px',
            }}>
              {isNetworkError 
                ? 'No pudimos conectar con el servidor para verificar la versión. Por favor, verifica tu conexión a internet.'
                : state.error || 'Ocurrió un error al verificar la versión de la aplicación.'}
            </p>

            <Button
              onClick={checkVersion}
              fullWidth
              leftIcon={<RefreshCw size={18} />}
            >
              Intentar de nuevo
            </Button>
          </Card>
        </div>
      </IonPage>
    );
  }

  // Pantalla de actualización disponible
  if (state.status === 'updating' && state.serverVersion) {
    const isForced = state.serverVersion.forceUpdate && 
                     compareVersions(state.currentVersion, state.serverVersion.minVersion) < 0;

    return (
      <IonPage>
        <div style={{
          minHeight: '100vh',
          width: '100%',
          background: `linear-gradient(135deg, ${THEME.colors.background} 0%, ${THEME.colors.backgroundGradient} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative shapes */}
          <DecorativeShape top="-80px" right="-60px" size={240} color={THEME.colors.accent} rotation={20} />
          <DecorativeShape top="100px" right="80px" size={60} color={THEME.colors.secondary} rotation={-10} />
          <DecorativeShape bottom="150px" left="-30px" size={100} color={THEME.colors.light} rotation={25} />

          <Card style={{
            width: '100%',
            maxWidth: '400px',
            animation: 'slideUp 0.4s ease-out',
          }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '24px',
                background: `linear-gradient(135deg, ${THEME.colors.secondary} 0%, #f59e0b 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                boxShadow: `0 8px 24px rgba(251, 171, 67, 0.35)`,
              }}>
                <Sparkles size={36} style={{ color: THEME.colors.white }} />
              </div>

              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: THEME.colors.primary,
                marginBottom: '8px',
              }}>
                {isForced ? 'Actualización requerida' : 'Nueva versión disponible'}
              </h2>

              <p style={{
                fontSize: '14px',
                color: THEME.colors.text.secondary,
              }}>
                {isForced 
                  ? 'Es necesario actualizar para continuar usando la aplicación'
                  : 'Hay mejoras y correcciones esperando por ti'}
              </p>
            </div>

            {/* Version Info */}
            <div style={{
              backgroundColor: 'rgba(159, 231, 245, 0.15)',
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '24px',
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px',
              }}>
                <span style={{ fontSize: '13px', color: THEME.colors.text.muted }}>Versión actual</span>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: THEME.colors.text.secondary,
                  fontFamily: 'monospace',
                }}>
                  v{state.currentVersion}
                </span>
              </div>
              
              <div style={{
                width: '100%',
                height: '2px',
                backgroundColor: 'rgba(5, 63, 92, 0.1)',
                marginBottom: '12px',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: THEME.colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Download size={12} style={{ color: THEME.colors.white }} />
                </div>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ fontSize: '13px', color: THEME.colors.text.muted }}>Nueva versión</span>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 700, 
                  color: THEME.colors.accent,
                  fontFamily: 'monospace',
                }}>
                  v{state.serverVersion.version}
                </span>
              </div>
            </div>

            {/* Changelog */}
            {state.serverVersion.changelog && (
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: THEME.colors.text.muted,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '12px',
                }}>
                  Novedades
                </h3>
                <div style={{
                  backgroundColor: THEME.colors.background,
                  borderRadius: '12px',
                  padding: '16px',
                  maxHeight: '120px',
                  overflowY: 'auto',
                }}>
                  <p style={{
                    fontSize: '14px',
                    color: THEME.colors.text.primary,
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                    margin: 0,
                  }}>
                    {state.serverVersion.changelog}
                  </p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button
                onClick={handleDownload}
                fullWidth
                size="lg"
                leftIcon={<Download size={20} />}
              >
                Descargar actualización
              </Button>

              {!isForced && (
                <Button
                  variant="outline"
                  onClick={() => setState(prev => ({ ...prev, status: 'success' }))}
                  fullWidth
                >
                  Recordarme más tarde
                </Button>
              )}
            </div>

            {isForced && (
              <p style={{
                fontSize: '12px',
                color: THEME.colors.text.muted,
                textAlign: 'center',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}>
                <AlertCircle size={14} />
                Esta actualización es obligatoria por seguridad
              </p>
            )}
          </Card>
        </div>
      </IonPage>
    );
  }

  // Éxito - permitir acceso a la app
  return <>{children}</>;
};

// Subcomponente para formas decorativas
interface DecorativeShapeProps {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  size: number;
  color: string;
  rotation: number;
}

const DecorativeShape = ({ top, right, bottom, left, size, color, rotation }: DecorativeShapeProps) => (
  <div style={{
    position: 'absolute',
    top,
    right,
    bottom,
    left,
    width: size,
    height: size,
    backgroundColor: color,
    borderRadius: '40px',
    transform: `rotate(${rotation}deg)`,
    opacity: 0.9,
    pointerEvents: 'none',
  }} />
);
