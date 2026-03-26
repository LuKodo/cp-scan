import { memo, type ReactNode } from 'react';
import { THEME } from '../../core';

interface ActionButtonProps {
  readonly icon: ReactNode;
  readonly label: string;
  readonly onClick: () => void;
  readonly disabled?: boolean;
  readonly variant?: 'primary' | 'secondary';
}

export const ActionButton = memo<ActionButtonProps>(({
  icon,
  label,
  onClick,
  disabled = false,
  variant = 'primary',
}) => {
  const isPrimary = variant === 'primary';

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '40px 24px',
    backgroundColor: isPrimary ? THEME.colors.accent : THEME.colors.white,
    border: 'none',
    borderRadius: THEME.borderRadius['2xl'],
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.8 : 1,
    boxShadow: isPrimary ? THEME.shadows.lg : THEME.shadows.card,
    transition: `all ${THEME.transitions.normal}`,
    marginBottom: '16px',
  };

  const iconContainerStyle: React.CSSProperties = {
    padding: '20px',
    backgroundColor: isPrimary ? 'rgba(255,255,255,0.2)' : 'rgba(159, 231, 245, 0.3)',
    borderRadius: '20px',
  };

  const labelStyle: React.CSSProperties = {
    color: isPrimary ? THEME.colors.white : THEME.colors.primary,
    fontSize: '18px',
    fontWeight: 700,
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      style={buttonStyle}
    >
      <div style={iconContainerStyle}>{icon}</div>
      <span style={labelStyle}>{label}</span>
    </button>
  );
});

ActionButton.displayName = 'ActionButton';
