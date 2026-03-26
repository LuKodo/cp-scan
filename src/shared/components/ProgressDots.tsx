import { memo } from 'react';
import { THEME } from '../../core';

interface ProgressDotsProps {
  readonly total: number;
  readonly current: number;
}

export const ProgressDots = memo<ProgressDotsProps>(({ total, current }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      gap: THEME.spacing.sm,
    }}>
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === current - 1;
        const isCompleted = i < current - 1;

        return (
          <div
            key={i}
            style={{
              width: isActive ? '32px' : '8px',
              height: '8px',
              backgroundColor: isActive 
                ? THEME.colors.accent 
                : isCompleted 
                  ? THEME.colors.secondary 
                  : 'rgba(5, 63, 92, 0.15)',
              borderRadius: isActive ? '4px' : '50%',
              transition: `all ${THEME.transitions.normal}`,
            }}
          />
        );
      })}
    </div>
  );
});

ProgressDots.displayName = 'ProgressDots';
