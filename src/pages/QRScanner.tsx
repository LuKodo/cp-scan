import { useCallback, useState } from 'react';
import { QrCode, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useIonRouter, useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { 
  useQRScanner, 
  useAuth, 
  useSignatureMethod, 
  workflowService, 
  documentService, 
  type WorkflowStep 
} from '../features';
import { Layout, Loader, StepHeader, ActionButton, ProgressDots, Card, ConfirmModal } from '../shared';
import { ROUTES, THEME } from '../core';
import type { QRData, WorkflowFlags } from '../core/types/domain';

export const QRScannerPage = () => {
  const router = useIonRouter();
  const { session } = useAuth();
  const { scan, isScanning, isAvailable } = useQRScanner();
  const signatureMethod = useSignatureMethod();
  
  // Estado para recuperar workflow existente
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [existingStep, setExistingStep] = useState<WorkflowStep | null>(null);
  const [pendingQRData, setPendingQRData] = useState<QRData | null>(null);
  const [pendingFlags, setPendingFlags] = useState<WorkflowFlags | null>(null);

  // Bloquear orientación en portrait
  useIonViewWillEnter(() => {
    ScreenOrientation.lock({ orientation: 'portrait' });
  });

  useIonViewWillLeave(() => {
    ScreenOrientation.unlock();
  });
  
  // Determinar el total de pasos según el modo
  const getTotalSteps = useCallback((): number => {
    const workflow = workflowService.getCurrentWorkflow();
    if (workflow) {
      return workflow.flags.totalSteps;
    }
    // Si no hay workflow activo, asumimos 3 para el UI inicial
    return 3;
  }, []);

  const navigateToStep = useCallback((step: WorkflowStep, flags?: WorkflowFlags) => {
    const currentFlags = flags ?? workflowService.getCurrentWorkflow()?.flags;
    
    switch (step) {
      case 1:
        // Ya estamos en el paso 1, no hacer nada
        break;
      case 2:
        router.push(ROUTES.STEP_2_DOCUMENT);
        break;
      case 3:
        // Solo navegar a paso 3 si NO se salta la firma
        if (currentFlags?.skipSignature) {
          // No debería pasar, pero por seguridad redirigimos al inicio
          router.push(ROUTES.STEP_1_QR);
        } else {
          // Según el método de firma del usuario
          const method = workflowService.getCurrentWorkflow()?.signatureMethod;
          if (method === 'FOTO') {
            router.push(ROUTES.STEP_3_PICTURE);
          } else {
            router.push(ROUTES.STEP_3_SIGNATURE);
          }
        }
        break;
    }
  }, [router]);

  const handleScan = useCallback(async () => {
    if (!isAvailable) {
      return;
    }

    if (!signatureMethod) {
      return;
    }

    const result = await scan();
    
    if (!result.ok) {
      return;
    }

    const qrData = result.value;

    // Validar estado del documento en la API
    const validationResult = await documentService.validateDocumentStatus(qrData.ssc);
    if (!validationResult.ok) {
      return;
    }

    const validation = validationResult.value;

    // Si es ENTREGA TOTAL, no permitir continuar - ESTE ES EL ÚNICO TOAST QUE PERMANECE
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

    // Calcular flags del workflow
    const isSoloFormula = signatureMethod === 'SOLOFORMULA';
    const skipSignature = isSoloFormula || validation.hasSignature;
    const totalSteps = skipSignature ? 2 : 3;
    
    const flags: WorkflowFlags = {
      skipSignature,
      totalSteps: totalSteps as 2 | 3,
    };

    // Verificar si ya existe un workflow local para este SSC
    const workflowResult = await workflowService.startWorkflow(
      qrData,
      createDocumentoFromQR(qrData, session?.user.sede ?? ''),
      signatureMethod,
      validation.hasSignature
    );

    if (!workflowResult.ok) {
      return;
    }

    const step = workflowResult.value;

    if (step === 1) {
      // Es nuevo workflow - navegar a captura de documento
      router.push(ROUTES.STEP_2_DOCUMENT);
    } else {
      // Ya existe en local, mostrar modal de recuperación
      setExistingStep(step);
      setPendingQRData(qrData);
      setPendingFlags(flags);
      setShowResumeModal(true);
    }
  }, [scan, isAvailable, router, session, signatureMethod]);

  const handleResumeWorkflow = useCallback(() => {
    setShowResumeModal(false);
    if (existingStep) {
      navigateToStep(existingStep, pendingFlags ?? undefined);
    }
  }, [existingStep, navigateToStep, pendingFlags]);

  const handleStartNew = useCallback(async () => {
    setShowResumeModal(false);
    if (pendingQRData && signatureMethod) {
      // Forzar nuevo workflow sobrescribiendo el existente
      await workflowService.startWorkflow(
        pendingQRData,
        createDocumentoFromQR(pendingQRData, session?.user.sede ?? ''),
        signatureMethod,
        pendingFlags?.skipSignature ?? false
      );
      router.push(ROUTES.STEP_2_DOCUMENT);
    }
  }, [pendingQRData, router, session, signatureMethod, pendingFlags]);

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
          totalSteps={getTotalSteps()}
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
          <ProgressDots total={getTotalSteps()} current={1} />
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
