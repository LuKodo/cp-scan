import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { DocumentScanner } from '@capacitor-mlkit/document-scanner';
import { documentService } from '../services/document.service';

type ScannerStatus =
    | 'idle'
    | 'checking'
    | 'ready'
    | 'scanning'
    | 'processing'
    | 'error';

export function useDocumentScanner() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkAvailability = async () => {
            if (Capacitor.getPlatform() === 'web') {
                setError('DocumentScanner no está disponible en web');
                return;
            }

            if (!DocumentScanner.isGoogleDocumentScannerModuleAvailable()) {
                setError('DocumentScanner no está disponible en este dispositivo');
                return;
            } else {
                await DocumentScanner.installGoogleDocumentScannerModule();
            }

            try {
                await import('@capacitor-mlkit/document-scanner');
            } catch {
                setError('Plugin DocumentScanner no está instalado');
            }
        };

        checkAvailability();
    }, []);

    const scanDocument = async (): Promise<{ success: boolean; images?: string[]; message: string }> => {
        try {
            setLoading(true);
            const result = await DocumentScanner.scanDocument({
                resultFormats: 'JPEG',
                scannerMode: 'FULL',
                pageLimit: 1,
                galleryImportAllowed: false,
            });

            if (!result?.scannedImages?.length) {
                return { success: false, message: 'No se escaneó ningún documento' };
            }

            return {
                success: true,
                images: result.scannedImages,
                message: 'Documento escaneado correctamente',
            };
        } catch (err) {
            return {
                success: false,
                message: err instanceof Error ? err.message : 'Error al escanear documento',
            };
        } finally {
            setLoading(false);
        }
    };

    const takePhoto = async (ssc: string, type: string): Promise<{ message: string; success: boolean }> => {
        try {
            setLoading(true);
            const presigned = await documentService.generateUrl(`${type}-${ssc}.jpg`);
            if (!presigned.success) return presigned;

            const scanResult = await scanDocument();
            if (!scanResult.success || !scanResult.images) {
                return { success: false, message: scanResult.message };
            }

            const uploadResult = await documentService.uploadToOCI(scanResult.images[0], presigned.message);
            if (!uploadResult.success) return uploadResult;

            return { success: true, message: 'Foto subida correctamente' };
        } catch (err) {
            return {
                success: false,
                message: err instanceof Error ? err.message : 'Error al subir la foto',
            };
        } finally {
            setLoading(false);
        }
    };

    return {
        takePhoto,
        error,
        loading,
    };
}
