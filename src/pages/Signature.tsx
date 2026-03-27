import { useCallback, useState, useEffect, useRef } from 'react';
import { Save, Eraser, Signature as SignatureIcon } from 'lucide-react';
import { useIonRouter, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { useSignatureCapture, workflowService, documentService } from '../features';
import { Layout, Loader, StepHeader, Button, ProgressDots } from '../shared';
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
  const [totalSteps, setTotalSteps] = useState<2 | 3>(3);
  const [isReady, setIsReady] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Verificar workflow al montar
  useEffect(() => {
    const workflow = workflowService.getCurrentWorkflow();
    if (!workflow) {
      // Redirigir si no hay workflow
      const timeout = setTimeout(() => {
        router.push(ROUTES.STEP_1_QR, 'back');
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setTotalSteps(workflow.flags.totalSteps);

      // Si debemos saltar firma, redirigir
      if (workflow.flags.skipSignature) {
        router.push(ROUTES.STEP_1_QR, 'back');
      } else {
        setIsReady(true);
      }
    }
  }, [router]);

  // Actualizar tamaño del canvas según el contenedor
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCanvasSize({
          width: Math.max(rect.width, 600),
          height: Math.max(rect.height, 300),
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

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
      router.push(ROUTES.STEP_1_QR, 'back');
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Nombre fijo para la firma (para poder verificar si existe)
      const filename = `firma-${workflow.ssc}.svg`;

      // 2. Generar SVG con las dimensiones actuales
      const svgString = generateSVG(paths, canvasSize.width, canvasSize.height);

      // 3. Obtener URL presignada para subir el SVG
      const urlResult = await documentService.generatePresignedUrl(filename);
      if (!urlResult.ok) {
        return;
      }

      // 4. Subir SVG a OCI
      const uploadResult = await documentService.uploadSVG(svgString, urlResult.value);
      if (!uploadResult.ok) {
        return;
      }

      // 5. Avanzar a paso 3
      await workflowService.advanceToStep3();

      // 6. Completar workflow
      const result = await workflowService.completeWorkflow();

      if (!result.ok) {
        return;
      }

      clear();
      router.push(ROUTES.STEP_1_QR);
    } finally {
      setIsProcessing(false);
    }
  }, [paths, clear, router, canvasSize]);

  // Handlers para el canvas
  const handleTouchStart = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    const point = getTouchPoint(e, canvasSize);
    startDrawing(point);
  }, [startDrawing, canvasSize]);

  const handleTouchMove = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    const point = getTouchPoint(e, canvasSize);
    moveDrawing(point);
  }, [moveDrawing, canvasSize]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<SVGSVGElement>) => {
    e.preventDefault();
    endDrawing();
  }, [endDrawing]);

  const isLoading = isSaving || isProcessing;

  return (
    <Layout>
      {isLoading && <Loader fullScreen message="Guardando..." />}

      <div
        ref={containerRef}
        style={{
          flex: 1,
          backgroundColor: '#F8FAFB',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          border: '2px dashed rgba(66, 158, 189, 0.25)',
          minHeight: 0, // Importante para flex
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
          preserveAspectRatio="xMidYMid meet"
          style={{
            touchAction: 'none',
            cursor: 'crosshair',
            display: 'block',
          }}
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

          {/* Guide line - Línea base para firmar */}
          <line
            x1={canvasSize.width * 0.05}
            y1={canvasSize.height * 0.75}
            x2={canvasSize.width * 0.95}
            y2={canvasSize.height * 0.75}
            stroke={THEME.colors.secondary}
            strokeWidth="2"
            strokeDasharray="8 4"
            opacity="0.4"
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

        {!hasSignature && <Placeholder />}
      </div>

      {/* Footer con botones - Compacto */}
      <div style={{
        padding: '0 16px 12px 16px',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        {/* Action Buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
        }}>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!hasSignature || isLoading}
            leftIcon={<Save size={20} />}
            size="lg"
          >
            Guardar
          </Button>

          <Button
            variant="secondary"
            onClick={clear}
            disabled={!hasSignature}
            leftIcon={<Eraser size={20} />}
            size="lg"
          >
            Borrar
          </Button>
        </div>

        {/* Info + Progress */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 0',
        }}>
          <p style={{
            fontSize: '12px',
            color: THEME.colors.text.muted,
            margin: 0,
          }}>
            Usa tu dedo o un stylus para firmar
          </p>

          <ProgressDots total={totalSteps} current={3} />
        </div>
      </div>
    </Layout>
  );
};

// Helper para obtener punto del touch escalado al viewBox
function getTouchPoint(
  e: React.TouchEvent,
  canvasSize: { width: number; height: number }
): { x: number; y: number } {
  const svg = (e.target as Element).closest('svg');
  const rect = svg?.getBoundingClientRect();
  const touch = e.touches[0];

  if (!rect) return { x: 0, y: 0 };

  // Calcular escala entre el tamaño real y el viewBox
  const scaleX = canvasSize.width / rect.width;
  const scaleY = canvasSize.height / rect.height;

  return {
    x: (touch.clientX - rect.left) * scaleX,
    y: (touch.clientY - rect.top) * scaleY,
  };
}

// Helper para generar SVG con dimensiones dinámicas
function generateSVG(
  paths: readonly string[],
  width: number,
  height: number
): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg"
     width="${width}"
     height="${height}"
     viewBox="0 0 ${width} ${height}">
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
      color: 'rgba(66, 158, 189, 0.5)',
      fontSize: '18px',
      fontWeight: 500,
    }}>
      Dibuja tu firma aquí
    </p>
  </div>
);
