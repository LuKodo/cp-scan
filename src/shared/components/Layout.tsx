import { memo, useState, useRef, useEffect, useCallback, type ReactNode } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { User, LogOut, LogOutIcon } from 'lucide-react';
import { THEME, ROUTES } from '../../core';
import { useAuth } from '../../features';
import { Redirect } from 'react-router';
import { ConfirmModal } from './ConfirmModal';

interface LayoutProps {
  readonly children: ReactNode;
}

export const Layout = memo<LayoutProps>(({ children }) => {
  const { session, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click outside para cerrar menú
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  // Handlers para el modal de logout
  const handleLogoutClick = useCallback(() => {
    setShowUserMenu(false);
    setShowLogoutConfirm(true);
  }, []);

  const handleConfirmLogout = useCallback(async () => {
    await logout();
    setShowLogoutConfirm(false);
  }, [logout]);

  const handleCancelLogout = useCallback(() => {
    setShowLogoutConfirm(false);
  }, []);

  if (!session) {
    return <Redirect to={ROUTES.LOGIN} />;
  }

  const username = session.user.name;
  const sede = session.user.sede;

  return (
    <IonPage>
      <IonContent fullscreen>
        <div style={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${THEME.colors.background} 0%, ${THEME.colors.backgroundGradient} 100%)`,
          position: 'relative',
        }}>
          {/* User Menu Button */}
          <div 
            ref={menuRef}
            style={{ 
              position: 'absolute', 
              top: '24px', 
              right: '24px', 
              zIndex: 50 
            }}
          >
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: THEME.colors.white,
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                cursor: 'pointer',
                transition: `all ${THEME.transitions.normal}`,
              }}
            >
              <User size={22} style={{ color: THEME.colors.secondary }} />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div style={{
                position: 'absolute',
                top: '60px',
                right: 0,
                backgroundColor: THEME.colors.white,
                borderRadius: '20px',
                boxShadow: THEME.shadows.menu,
                minWidth: '240px',
                padding: '8px',
                animation: 'popIn 0.2s ease-out',
              }}>
                {/* User Info */}
                <div style={{
                  padding: '16px',
                  backgroundColor: 'rgba(159, 231, 245, 0.2)',
                  borderRadius: '16px',
                  marginBottom: '8px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '14px',
                      backgroundColor: THEME.colors.secondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <User size={22} style={{ color: THEME.colors.white }} />
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <p style={{
                        color: THEME.colors.primary,
                        fontWeight: 600,
                        fontSize: '15px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {username}
                      </p>
                      <p style={{
                        color: THEME.colors.secondary,
                        fontSize: '12px',
                        fontWeight: 500,
                      }}>
                        {sede}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogoutClick}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    backgroundColor: 'rgba(239, 68, 68, 0.06)',
                    borderRadius: '14px',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: `background-color ${THEME.transitions.normal}`,
                  }}
                >
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <LogOut size={18} style={{ color: '#dc2626' }} />
                  </div>
                  <span style={{ color: '#dc2626', fontWeight: 600, fontSize: '14px' }}>
                    Cerrar sesión
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '100px 24px 40px',
          }}>
            <div style={{ width: '100%', maxWidth: '380px' }}>
              {children}
            </div>
          </div>
        </div>

        {/* Logout Confirmation Modal */}
        <ConfirmModal
          isOpen={showLogoutConfirm}
          title="¿Cerrar sesión?"
          message="¿Estás seguro de que deseas cerrar sesión? Deberás volver a ingresar tus credenciales."
          confirmLabel="Sí, cerrar sesión"
          cancelLabel="Cancelar"
          confirmVariant="danger"
          icon={<LogOutIcon size={32} style={{ color: '#ef4444' }} />}
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      </IonContent>
    </IonPage>
  );
});

Layout.displayName = 'Layout';
