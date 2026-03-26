import { useCallback, useState } from 'react';
import { QrCode, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useIonRouter, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { useQRScanner, useAuth, useSignatureMethod, workflowService, documentService, type WorkflowStep } from '../features';
import { Layout, Loader, StepHeader, ActionButton, ProgressDots, Card, ConfirmModal } from '../shared';
import { ROUTES, THEME } from '../core';
import type { QRData } from '../core/types/domain';

export const QRScannerPage = () => {
  const router = useIonRouter();
  const { session } = useAuth();
  const { scan, isScanning, isAvailable } = useQRScanner();
  const signatureMethod = useSignatureMethod();
  
  // Estado para recuperar workflow existente
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [existingStep, setExistingStep] = useState<WorkflowStep | null>(null);
  const [pendingQRData, setPendingQRData] = useState<QRData | null>(null);

  // Bloquear orientación en portrait
  useIonViewWillEnter(() => {
    ScreenOrientation.lock({ orientation: 'portrait' });
  });

  useIonViewWillLeave(() => {
    ScreenOrientation.unlock();
  });
  
  const navigateToStep = useCallback((step: WorkflowStep) => {
    switch (step) {
      case 1:
        // Ya estamos en el paso 1, no hacer nada
        break;
      case 2:
        router.push(ROUTES.STEP_2_DOCUMENT);
        break;
      case 3:
        // Según el método de firma del usuario
        if (signatureMethod === 'FOTO') {
          router.push(ROUTES.STEP_3_PICTURE);
        } else {
          router.push(ROUTES.STEP_3_SIGNATURE);
        }
        break;
    }
  }, [router, signatureMethod]);

  const handleScan = useCallback(async () => {
    if (!isAvailable) {
      toast.error('Scanner no disponible');
      return;
    }

    const result = await scan();
    
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }

    const qrData = result.value;

    // Validar estado del documento en la API
    const validationResult = await documentService.validateDocumentStatus(qrData.ssc);
    if (!validationResult.ok) {
      toast.error('Error al verificar el estado del documento');
      return;
    }

    const validation = validationResult.value;
    console.log('Validación documento:', validation);

    // Si es ENTREGA TOTAL, no permitir continuar
    if (!validation.canProceed) {
      toast.error(validation.message, {
        icon: <AlertCircle size={20} style={{ color: '#ef4444' }} />,
        style: {
          background: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
        },
      });
      return;
    }

    // Si ya tiene firma, solo capturar fórmula y completar
    if (validation.hasSignature) {
      console.log('Documento ya tiene firma, se omitirá paso de firma');
      toast.info('Este documento ya tiene firma registrada. Solo se requiere la fórmula.');
    } else if (validation.estado === 'PARCIAL') {
      toast.info('Documento con entrega parcial - Continuando escaneo');
    }

    // Verificar si ya existe un workflow local para este SSC
    const workflowResult = await workflowService.startWorkflow(
      qrData,
      createDocumentoFromQR(qrData, session?.user.sede ?? '')
    );

    if (!workflowResult.ok) {
      toast.error(workflowResult.error.message);
      return;
    }

    const step = workflowResult.value;

    if (step === 1) {
      // Es nuevo o recuperado en paso 1
      if (validation.hasSignature) {
        // Ya tiene firma, saltar directo al paso 2 (fórmula)
        toast.success('Documento verificado - Proceda a capturar la fórmula');
      }
      router.push(ROUTES.STEP_2_DOCUMENT);
    } else {
      // Ya existe en local, mostrar modal de recuperación
      setExistingStep(step);
      setPendingQRData(qrData);
      setShowResumeModal(true);
    }
  }, [scan, isAvailable, router, session]);

  const handleResumeWorkflow = useCallback(() => {
    setShowResumeModal(false);
    if (existingStep) {
      toast.success(`Continuando desde el paso ${existingStep}`);
      navigateToStep(existingStep);
    }
  }, [existingStep, navigateToStep]);

  const handleStartNew = useCallback(async () => {
    setShowResumeModal(false);
    if (pendingQRData) {
      // Forzar nuevo workflow sobrescribiendo el existente
      await workflowService.startWorkflow(
        pendingQRData,
        createDocumentoFromQR(pendingQRData, session?.user.sede ?? '')
      );
      toast.success('Iniciando nuevo escaneo');
      router.push(ROUTES.STEP_2_DOCUMENT);
    }
  }, [pendingQRData, router, session]);

  return (
    <Layout>
      {isScanning && <Loader fullScreen message="Escaneando..." />}

      <div style={{ 
        width: '100%',
        animation: 'popIn 0.4s ease-out',
      }}>
        <StepHeader
          icon={QrCode}
          title="Escanear QR"
          step={1}
          totalSteps={3}
        />

        <ActionButton
          icon={<QrCode size={48} color={THEME.colors.white} />}
          label="Activar Cámara"
          onClick={handleScan}
          disabled={isScanning || !isAvailable}
          variant="primary"
        />

        {/* Tips */}
        <Card>
          <p style={{
            fontSize: '13px',
            fontWeight: 600,
            color: THEME.colors.primary,
            marginBottom: '12px',
          }}>
            Consejos:
          </p>
          <TipsList />
        </Card>

        {/* Progress */}
        <div style={{ marginTop: '32px' }}>
          <ProgressDots total={3} current={1} />
        </div>
      </div>

      {/* Modal de recuperación */}
      <ConfirmModal
        isOpen={showResumeModal}
        title="Escaneo en progreso"
        message={`Ya existe un escaneo para este documento que quedó en el paso ${existingStep}. ¿Deseas continuar desde donde quedaste o iniciar uno nuevo?`}
        confirmLabel="Continuar"
        cancelLabel="Nuevo escaneo"
        confirmVariant="primary"
        onConfirm={handleResumeWorkflow}
        onCancel={handleStartNew}
      />
    </Layout>
  );
};

// Helper para crear documento desde QR
function createDocumentoFromQR(qrData: QRData, sede: string) {
  const now = new Date();
  return {
    fechaescaneo: now.toISOString().split('T')[0],
    horaescaneo: now.toTimeString().split(' ')[0],
    url: '',
    centrocosto: sede,
    ssc: qrData.ssc,
    tipodocumento: qrData.tipoDocumento,
    numerodocumento: qrData.numeroDocumento,
    factura: qrData.factura,
    facturacuota: qrData.facturaCuota,
    fechadispensacion: qrData.fechaDispensacion,
    origen: 'APP',
    estado: qrData.estado ?? 'PENDIENTE',
  };
}

// Subcomponente para la lista de tips
const TipsList = () => {
  const tips = [
    'Asegura una buena iluminación',
    'Centra el código en la pantalla',
  ];

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
