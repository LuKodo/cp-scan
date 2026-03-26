import { memo, type ComponentType } from 'react';
import { THEME } from '../../core';
import type { LucideProps } from 'lucide-react';

interface StepHeaderProps {
  readonly icon: ComponentType<LucideProps>;
  readonly title: string;
  readonly step: number;
  readonly totalSteps: number;
}

export const StepHeader = memo<StepHeaderProps>(({ 
  icon: Icon, 
  title, 
  step, 
  totalSteps 
}) => {
  return (
    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: '24px',
        backgroundColor: 'rgba(159, 231, 245, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 20px',
      }}>
        <Icon size={40} style={{ color: THEME.colors.secondary }} />
      </div>
      <h1 style={{
        fontSize: '26px',
        fontWeight: 700,
        color: THEME.colors.primary,
        marginBottom: '6px',
      }}>
        {title}
      </h1>
      <p style={{ color: THEME.colors.text.muted, fontSize: '15px' }}>
        Paso {step} de {totalSteps}
      </p>
    </div>
  );
});

StepHeader.displayName = 'StepHeader';
