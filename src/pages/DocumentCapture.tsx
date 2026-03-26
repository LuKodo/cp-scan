import { useCallback, useState, useEffect } from 'react';
import { Camera, ArrowLeft, FileText, Signature } from 'lucide-react';
import { toast } from 'sonner';
import { useIonRouter, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { useDocumentCapture, useSignatureMethod, workflowService, documentService } from '../features';
import { Layout, Loader, StepHeader, ActionButton, ProgressDots, Button } from '../shared';
import { ROUTES, THEME, FileUtils } from '../core';

interface DocumentCapturePageProps {
  readonly mode?: 'document' | 'signature';
}

export const DocumentCapturePage = ({ mode = 'document' }: DocumentCapturePageProps) => {
  const router = useIonRouter();
  const signatureMethod = useSignatureMethod();
  const { upload, isScanning, isUploading } = useDocumentCapture();
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasExistingSignature, setHasExistingSignature] = useState(false);

  const isFormulaMode = mode === 'document';

  // Verificar si ya existe firma al cargar
  useEffect(() => {
    const checkExistingSignature = async () => {
      const workflow = workflowService.getCurrentWorkflow();
      if (workflow && isFormulaMode) {
        console.log('Verificando firma existente para SSC:', workflow.ssc);
        const validation = await documentService.validateDocumentStatus(workflow.ssc);
        console.log('Resultado validación firma:', validation);
        if (validation.ok && validation.value.hasSignature) {
          console.log('Firma existente detectada');
          setHasExistingSignature(true);
        } else {
          console.log('No se detectó firma existente');
        }
      }
    };
    checkExistingSignature();
  }, [isFormulaMode]);
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
    const workflow = workflowService.getCurrentWorkflow();
    if (!workflow) {
      toast.error('No hay sesión de escaneo activa');
      router.push(ROUTES.STEP_1_QR);
      return;
    }

    setIsProcessing(true);

    try {
      // Generar nombre de archivo único con fecha
      const fileType = isFormulaMode ? 'formula' : 'firma';
      const filename = FileUtils.generateUniqueFileName(workflow.ssc, fileType, 'jpg');
      
      const result = await upload(workflow.ssc, filename);

      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }

      // Avanzar paso en el workflow (las imágenes ya están en OCI)
      if (isFormulaMode) {
        // Avanzar al paso 2
        await workflowService.advanceToStep2();
        toast.success('Fórmula guardada');
        
        // Si ya existe firma, completar directamente sin pedir firma
        console.log('handleCapture: hasExistingSignature =', hasExistingSignature);
        if (hasExistingSignature) {
          console.log('Completando sin pedir firma...');
          toast.info('Documento ya tiene firma registrada - Completando');
          await workflowService.advanceToStep3();
          
          const completeResult = await workflowService.completeWorkflow();
          if (!completeResult.ok) {
            toast.error(completeResult.error.message);
            return;
          }
          
          toast.success('Documento sincronizado correctamente');
          router.push(ROUTES.STEP_1_QR);
          return;
        }
        
        // Navegar según el método de firma del usuario
        const nextRoute = signatureMethod === 'FIRMA' 
          ? ROUTES.STEP_3_SIGNATURE 
          : ROUTES.STEP_3_PICTURE;
        router.push(nextRoute);
      } else {
        // Es foto de firma - avanzar al paso 3
        await workflowService.advanceToStep3();
        
        // Completar workflow (insertar nueva línea en la base cloud)
        const completeResult = await workflowService.completeWorkflow();
        if (!completeResult.ok) {
          toast.error(completeResult.error.message);
          return;
        }
        
        toast.success('Escaneo completado y sincronizado');
        router.push(ROUTES.STEP_1_QR);
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isFormulaMode, upload, signatureMethod, router]);

  const handleBack = useCallback(() => {
    router.push(ROUTES.STEP_1_QR);
  }, [router]);

  const isLoading = isScanning || isUploading || isProcessing;

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
          totalSteps={3}
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
          <ProgressDots total={3} current={step} />
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
