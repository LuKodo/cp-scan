import { memo, forwardRef, type InputHTMLAttributes, useCallback, useState } from 'react';
import { THEME } from '../../core';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label?: string;
  readonly error?: string;
  readonly leftIcon?: React.ReactNode;
  readonly rightIcon?: React.ReactNode;
}

export const Input = memo(forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightIcon, onChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = useCallback(() => setIsFocused(true), []);
    const handleBlur = useCallback(() => setIsFocused(false), []);

    const containerStyle: React.CSSProperties = {
      backgroundColor: THEME.colors.white,
      borderRadius: THEME.borderRadius.lg,
      padding: '16px 18px',
      boxShadow: error 
        ? '0 2px 12px rgba(239, 68, 68, 0.15)' 
        : THEME.shadows.card,
      border: isFocused 
        ? `2px solid ${THEME.colors.secondary}` 
        : error 
          ? '2px solid #ef4444' 
          : '2px solid transparent',
      transition: `all ${THEME.transitions.normal}`,
    };

    const labelStyle: React.CSSProperties = {
      fontSize: '13px',
      fontWeight: 600,
      color: THEME.colors.primary,
      marginBottom: '8px',
      display: 'block',
    };

    const inputWrapperStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    };

    const inputStyle: React.CSSProperties = {
      flex: 1,
      background: 'transparent',
      border: 'none',
      outline: 'none',
      fontSize: '15px',
      color: THEME.colors.primary,
      fontWeight: 500,
    };

    const errorStyle: React.CSSProperties = {
      fontSize: '12px',
      color: '#ef4444',
      marginTop: '6px',
      marginLeft: '4px',
      fontWeight: 500,
    };

    return (
      <div style={containerStyle}>
        {label && <label style={labelStyle}>{label}</label>}
        <div style={inputWrapperStyle}>
          {leftIcon && (
            <span style={{ color: THEME.colors.secondary, flexShrink: 0 }}>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            style={inputStyle}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={onChange}
            {...props}
          />
          {rightIcon}
        </div>
        {error && <p style={errorStyle}>{error}</p>}
      </div>
    );
  }
));

Input.displayName = 'Input';
