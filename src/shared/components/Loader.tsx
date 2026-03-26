import { memo } from 'react';
import { THEME } from '../../core';

interface LoaderProps {
  readonly message?: string;
  readonly fullScreen?: boolean;
  readonly size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
};

export const Loader = memo<LoaderProps>(({ 
  message = 'Cargando...', 
  fullScreen = false,
  size = 'md',
}) => {
  const spinnerSize = sizeMap[size];

  const content = (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: THEME.spacing.md,
    }}>
      <div style={{
        width: spinnerSize,
        height: spinnerSize,
        border: `4px solid rgba(66, 158, 189, 0.2)`,
        borderTopColor: THEME.colors.accent,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      {message && (
        <p style={{
          fontSize: '14px',
          fontWeight: 500,
          color: THEME.colors.text.muted,
        }}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(248, 250, 251, 0.95)',
        backdropFilter: 'blur(4px)',
      }}>
        {content}
      </div>
    );
  }

  return content;
});

Loader.displayName = 'Loader';
