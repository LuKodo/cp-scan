import { memo } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { THEME } from '../../core';
import { Button } from './Button';

interface ConfirmModalProps {
  readonly isOpen: boolean;
  readonly title: string;
  readonly message: string;
  readonly confirmLabel?: string;
  readonly cancelLabel?: string;
  readonly confirmVariant?: 'primary' | 'danger';
  readonly icon?: React.ReactNode;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
}

export const ConfirmModal = memo<ConfirmModalProps>(({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  confirmVariant = 'danger',
  icon,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 63, 92, 0.5)',
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.2s ease-out',
    padding: '24px',
  };

  const modalStyle: React.CSSProperties = {
    backgroundColor: THEME.colors.white,
    borderRadius: '24px',
    padding: '24px',
    width: '100%',
    maxWidth: '360px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    animation: 'slideUp 0.3s ease-out',
  };

  const iconContainerStyle: React.CSSProperties = {
    width: '64px',
    height: '64px',
    borderRadius: '20px',
    backgroundColor: confirmVariant === 'danger' 
      ? 'rgba(239, 68, 68, 0.1)' 
      : 'rgba(247, 173, 25, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 700,
    color: THEME.colors.primary,
    textAlign: 'center',
    marginBottom: '12px',
  };

  const messageStyle: React.CSSProperties = {
    fontSize: '15px',
    color: THEME.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 1.5,
    marginBottom: '24px',
  };

  const buttonsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  };

  return (
    <div style={overlayStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Icon */}
        <div style={iconContainerStyle}>
          {icon || (
            <AlertTriangle 
              size={32} 
              style={{ color: confirmVariant === 'danger' ? '#ef4444' : THEME.colors.accent }} 
            />
          )}
        </div>

        {/* Content */}
        <h2 style={titleStyle}>{title}</h2>
        <p style={messageStyle}>{message}</p>

        {/* Buttons */}
        <div style={buttonsStyle}>
          <Button
            variant="secondary"
            onClick={onCancel}
            fullWidth
          >
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            onClick={onConfirm}
            fullWidth
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
});

ConfirmModal.displayName = 'ConfirmModal';
