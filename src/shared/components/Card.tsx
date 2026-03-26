import { memo, type ReactNode } from 'react';
import { THEME } from '../../core';

interface CardProps {
  readonly children: ReactNode;
  readonly style?: React.CSSProperties;
  readonly padding?: 'sm' | 'md' | 'lg';
}

const paddingMap = {
  sm: '16px',
  md: '20px',
  lg: '24px',
};

export const Card = memo<CardProps>(({ children, style, padding = 'md' }) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: THEME.colors.white,
    borderRadius: THEME.borderRadius['2xl'],
    padding: paddingMap[padding],
    boxShadow: THEME.shadows.card,
    ...style,
  };

  return <div style={cardStyle}>{children}</div>;
});

Card.displayName = 'Card';
