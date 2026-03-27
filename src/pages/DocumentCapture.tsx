import { useCallback, useState, useEffect } from 'react';
import { Camera, ArrowLeft, FileText, Signature, CheckCircle } from 'lucide-react';
import { useIonRouter, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { useDocumentCapture, workflowService, documentService } from '../features';
import { Layout, Loader, StepHeader, ActionButton, ProgressDots, Button } from '../shared';
import { ROUTES, THEME, FileUtils } from '../core';

interface DocumentCapturePageProps {
  readonly mode?: 'document' | 'signature';
}

export const DocumentCapturePage = ({ mode = 'document' }: DocumentCapturePageProps) => {
  const router = useIonRouter();
  const { upload, isScanning, isUploading } = useDocumentCapture();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const isFormulaMode = mode === 'document';

  // Verificar workflow al montar el componente
  useEffect(() => {
    const workflow = workflowService.getCurrentWorkflow();
    if (!workflow) {
      // Si no hay workflow, redirigir al inicio después de un breve delay
      // para evitar problemas de navegación durante el montaje
      const timeout = setTimeout(() => {
        router.push(ROUTES.STEP_1_QR, 'back');
      }, 100);
      return () => clearTimeout(timeout);
    } else {
      setIsReady(true);
    }
  }, [router]);

  // Obtener datos del workflow
  const workflow = workflowService.getCurrentWorkflow();
  const flags = workflow?.flags;
  const signatureMethod = workflow?.signatureMethod;
  
  // Determinar si debemos saltar la firma
  const skipSignature = flags?.skipSignature ?? false;
  const totalSteps = flags?.totalSteps ?? 3;
  
  const title = isFormulaMode ? 'Capturar Fórmula' : 'Capturar Firma';
  const Icon = isFormulaMode ? FileText : Signature;
  const step = isFormulaMode ? 2 : 3;

  // Bloquear orientación en portrait
  useIonViewWillEnter(() => {
    ScreenOrientation.lock({ orientation: 'portrait' });
  });

  useIonViewWillLeave(() => {
    ScreenOrientation.unlock();
  });

  const handleCapture = useCallback(async () => {
    const currentWorkflow = workflowService.getCurrentWorkflow();
    if (!currentWorkflow) {
      router.push(ROUTES.STEP_1_QR, 'back');
      return;
    }

    setIsProcessing(true);

    try {
      // Generar nombre de archivo único con fecha
      const fileType = isFormulaMode ? 'formula' : 'firma';
      const filename = FileUtils.generateUniqueFileName(currentWorkflow.ssc, fileType, 'jpg');
      
      const result = await upload(currentWorkflow.ssc, filename);

      if (!result.ok) {
        return;
      }

      if (isFormulaMode) {
        // Avanzar al paso 2
        await workflowService.advanceToStep2();
        
        // Si debemos saltar la firma (SOLOFORMULA o hasSignature), completar directamente
        if (skipSignature) {
          // Avanzar al paso 3 (lógicamente, aunque no mostramos UI)
          await workflowService.advanceToStep3();
          
          // Completar workflow
          const completeResult = await workflowService.completeWorkflow();
          if (!completeResult.ok) {
            return;
          }
          
          router.push(ROUTES.STEP_1_QR);
          return;
        }
        
        // Navegar según el método de firma del usuario
        const nextRoute = signatureMethod === 'FOTO' 
          ? ROUTES.STEP_3_PICTURE 
          : ROUTES.STEP_3_SIGNATURE;
        router.push(nextRoute);
      } else {
        // Es foto de firma - avanzar al paso 3
        await workflowService.advanceToStep3();
        
        // Completar workflow
        const completeResult = await workflowService.completeWorkflow();
        if (!completeResult.ok) {
          return;
        }
        
        router.push(ROUTES.STEP_1_QR);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isFormulaMode, upload, signatureMethod, router, skipSignature]);

  const handleBack = useCallback(() => {
    router.push(ROUTES.STEP_1_QR, 'back');
  }, [router]);

  const isLoading = isScanning || isUploading || isProcessing;

  // Mostrar loader mientras verificamos el workflow
  if (!isReady || !workflow) {
    return (
      <Layout>
        <Loader fullScreen message="Cargando..." />
      </Layout>
    );
  }

  return (
    <Layout>
      {isLoading && <Loader fullScreen message="Procesando..." />}

      <div style={{ 
        width: '100%',
        animation: 'popIn 0.4s ease-out',
      }}>
        <StepHeader
          icon={Icon}
          title={title}
          step={step}
          totalSteps={totalSteps}
        />

        <ActionButton
          icon={<Camera size={48} color={THEME.colors.white} />}
          label="Iniciar Cámara"
          onClick={handleCapture}
          disabled={isLoading}
          variant="primary"
        />

        {/* Back Button */}
        <Button
          variant="secondary"
          onClick={handleBack}
          fullWidth
          leftIcon={<ArrowLeft size={20} />}
          style={{ marginBottom: '24px' }}
        >
          Volver
        </Button>

        {/* Info banner para modo sin firma */}
        {isFormulaMode && skipSignature && (
          <div style={{
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <CheckCircle size={20} color={THEME.colors.success} />
            <span style={{
              fontSize: '14px',
              color: THEME.colors.success,
              fontWeight: 500,
            }}>
              {signatureMethod === 'SOLOFORMULA' 
                ? 'Modo Solo Fórmula: Se completará al guardar' 
                : 'Este documento ya tiene firma: Se completará al guardar'}
            </span>
          </div>
        )}

        {/* Tips */}
        <div style={{
          backgroundColor: THEME.colors.white,
          borderRadius: '20px',
          padding: '20px 24px',
          boxShadow: THEME.shadows.card,
        }}>
          <p style={{
            fontSize: '13px',
            fontWeight: 600,
            color: THEME.colors.primary,
            marginBottom: '12px',
          }}>
            Consejos:
          </p>
          <TipsList isFormulaMode={isFormulaMode} />
        </div>

        {/* Progress */}
        <div style={{ marginTop: '32px' }}>
          <ProgressDots total={totalSteps} current={step} />
        </div>
      </div>
    </Layout>
  );
};

// Subcomponente para tips
interface TipsListProps {
  readonly isFormulaMode: boolean;
}

const TipsList = ({ isFormulaMode }: TipsListProps) => {
  const tips = isFormulaMode 
    ? ['Sobre una superficie plana', 'Buena iluminación natural']
    : ['Sujeta el teléfono firmemente', 'Captura la firma completa'];

  return (
    <ul style={{
      margin: 0,
      padding: 0,
      listStyle: 'none',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
    }}>
      {tips.map((tip, index) => (
        <li key={index} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          color: THEME.colors.text.secondary,
        }}>
          <span style={{
            width: '6px',
            height: '6px',
            backgroundColor: THEME.colors.secondary,
            borderRadius: '50%',
          }} />
          {tip}
        </li>
      ))}
    </ul>
  );
};
