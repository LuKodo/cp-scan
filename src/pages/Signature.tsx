import { useCallback, useState } from 'react';
import { Save, Eraser, Signature as SignatureIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useIonRouter, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { useSignatureCapture, workflowService, documentService } from '../features';
import { Layout, Loader, StepHeader, Button, ProgressDots, Card } from '../shared';
import { THEME, ROUTES } from '../core';

export const SignaturePage = () => {
  const router = useIonRouter();
  const { 
    paths, 
    hasSignature, 
    isSaving, 
    startDrawing, 
    moveDrawing, 
    endDrawing, 
    clear 
  } = useSignatureCapture();

  const [isProcessing, setIsProcessing] = useState(false);

  // Bloquear orientación en landscape para firma
  useIonViewWillEnter(() => {
    ScreenOrientation.lock({ orientation: 'landscape' });
  });

  useIonViewWillLeave(() => {
    ScreenOrientation.unlock();
  });

  const handleSave = useCallback(async () => {
    const workflow = workflowService.getCurrentWorkflow();
    if (!workflow) {
      toast.error('No hay sesión de escaneo activa');
      router.push(ROUTES.STEP_1_QR);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Nombre fijo para la firma (para poder verificar si existe)
      const filename = `firma-${workflow.ssc}.svg`;

      // 2. Generar SVG
      const svgString = generateSVG(paths);

      // 3. Obtener URL presignada para subir el SVG
      const urlResult = await documentService.generatePresignedUrl(filename);
      if (!urlResult.ok) {
        toast.error('Error al generar URL para la firma');
        return;
      }

      // 4. Subir SVG a OCI
      const uploadResult = await documentService.uploadSVG(svgString, urlResult.value);
      if (!uploadResult.ok) {
        toast.error('Error al subir la firma');
        return;
      }

      // 5. Guardar URL y avanzar a paso 3
      await workflowService.advanceToStep3(filename);

      // 5. Completar workflow (insertar nueva línea en la base cloud)
      const result = await workflowService.completeWorkflow();

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      toast.success('Firma guardada y documento sincronizado');
      clear();
      router.push(ROUTES.STEP_1_QR);
    } finally {
      setIsProcessing(false);
    }
  }, [paths, clear, router]);

  // Handlers para el canvas
  const handleTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    const point = getTouchPoint(e);
    startDrawing(point);
  }, [startDrawing]);

  const handleTouchMove = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    const point = getTouchPoint(e);
    moveDrawing(point);
  }, [moveDrawing]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    endDrawing();
  }, [endDrawing]);

  const isLoading = isSaving || isProcessing;

  return (
    <Layout>
      {isLoading && <Loader fullScreen message="Guardando..." />}

      <div style={{ width: '100%' }}>
        <StepHeader
          icon={SignatureIcon}
          title="Firma Digital"
          step={3}
          totalSteps={3}
        />

        {/* Signature Canvas */}
        <Card style={{ marginBottom: '20px' }}>
          <div style={{
            backgroundColor: '#F8FAFB',
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            border: '2px dashed rgba(66, 158, 189, 0.25)',
          }}>
            <svg
              width="100%"
              height="180"
              viewBox="0 0 800 180"
              preserveAspectRatio="xMidYMid meet"
              style={{ touchAction: 'none', cursor: 'crosshair', display: 'block' }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#9FE7F5" strokeWidth="1" opacity="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Guide line */}
              <line
                x1="40"
                y1="130"
                x2="760"
                y2="130"
                stroke={THEME.colors.secondary}
                strokeWidth="2"
                strokeDasharray="8 4"
                opacity="0.3"
              />

              {/* Render paths */}
              {paths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  stroke={THEME.colors.primary}
                  strokeWidth="3"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
            </svg>

            {!hasSignature && (
              <Placeholder />
            )}
          </div>
        </Card>

        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px',
        }}>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasSignature || isLoading}
            leftIcon={<Save size={20} />}
          >
            Guardar
          </Button>

          <Button
            variant="secondary"
            onClick={clear}
            disabled={!hasSignature}
            leftIcon={<Eraser size={20} />}
          >
            Borrar
          </Button>
        </div>

        {/* Info */}
        <p style={{
          textAlign: 'center',
          fontSize: '13px',
          color: THEME.colors.text.muted,
          marginBottom: '24px',
        }}>
          Usa tu dedo o un stylus para firmar
        </p>

        {/* Progress */}
        <ProgressDots total={3} current={3} />
      </div>
    </Layout>
  );
};

// Helper para obtener punto del touch
function getTouchPoint(e: React.TouchEvent): { x: number; y: number } {
  const rect = (e.target as Element).closest('svg')?.getBoundingClientRect();
  const touch = e.touches[0];
  
  return {
    x: touch.clientX - (rect?.left ?? 0),
    y: touch.clientY - (rect?.top ?? 0),
  };
}

// Helper para generar SVG
function generateSVG(paths: readonly string[]): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="800"
     height="300"
     viewBox="0 0 800 300">
  ${paths.map(d => `
    <path
      d="${d}"
      stroke="black"
      stroke-width="2"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />`).join('')}
</svg>
`.trim();
}

// Placeholder cuando no hay firma
const Placeholder = () => (
  <div style={{
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  }}>
    <p style={{ 
      color: 'rgba(66, 158, 189, 0.4)', 
      fontSize: '15px', 
      fontWeight: 500,
    }}>
      Dibuja tu firma aquí
    </p>
  </div>
);
