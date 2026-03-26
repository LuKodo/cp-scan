import { memo, forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { THEME } from '../../core';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly isLoading?: boolean;
  readonly leftIcon?: ReactNode;
  readonly rightIcon?: ReactNode;
  readonly fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: THEME.colors.accent,
    color: THEME.colors.white,
    border: 'none',
  },
  secondary: {
    backgroundColor: THEME.colors.white,
    color: THEME.colors.primary,
    border: 'none',
  },
  outline: {
    backgroundColor: 'transparent',
    color: THEME.colors.primary,
    border: `2px solid ${THEME.colors.secondary}`,
  },
  danger: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    color: '#dc2626',
    border: 'none',
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { padding: '10px 16px', fontSize: '14px' },
  md: { padding: '14px 24px', fontSize: '15px' },
  lg: { padding: '18px 32px', fontSize: '16px' },
};

export const Button = memo(forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    isLoading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    style,
    ...props 
  }, ref) => {
    const isDisabled = disabled || isLoading;

    const buttonStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: THEME.spacing.sm,
      borderRadius: '50px',
      fontWeight: 600,
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? 0.7 : 1,
      transition: `all ${THEME.transitions.normal}`,
      width: fullWidth ? '100%' : 'auto',
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };

    return (
      <button 
        ref={ref}
        disabled={isDisabled}
        style={buttonStyle}
        {...props}
      >
        {isLoading ? (
          <LoadingSpinner size={size === 'sm' ? 16 : 20} />
        ) : (
          <>
            {leftIcon}
            {children}
            {rightIcon}
          </>
        )}
      </button>
    );
  }
));

Button.displayName = 'Button';

// Subcomponente para el spinner de carga
function LoadingSpinner({ size }: { readonly size: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: '2px solid rgba(255,255,255,0.3)',
      borderTopColor: 'white',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
  );
}
