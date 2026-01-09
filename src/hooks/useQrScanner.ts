import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { qrService } from '../services/scanner.service';
import { Camera } from '@capacitor/camera';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { toast } from '../utils/alert.utils';

export const useQrScanner = () => {
    useEffect(() => {
        const checkAvailability = async () => {
            if (Capacitor.getPlatform() === 'web') {
                toast('BarcodeScanner no está disponible en web');
                return;
            }

            try {
                await import('@capacitor-mlkit/barcode-scanning');
            } catch {
                toast('Plugin BarcodeScanner no está instalado');
            }
        };

        checkAvailability();
    }, []);
    const scan = async (): Promise<{ message: string, success: boolean }> => {
        try {
            const permissionCamera = await Camera.checkPermissions();
            if (permissionCamera.camera !== 'granted') {
                await Camera.requestPermissions();
            }

            const permissionBarcode = await BarcodeScanner.requestPermissions();

            if (permissionBarcode.camera !== 'granted') {
                await BarcodeScanner.requestPermissions();
            }

            const result = await BarcodeScanner.scan();

            if (!result.barcodes.length) {
                return { message: 'No se detectó ningún código QR', success: false };
            }

            const value = result.barcodes[0].rawValue;

            if (!value) {
                return { message: 'QR inválido', success: false };
            }

            return await processQr(value);
        } catch (error) {
            if (error instanceof Error) {
                return { message: error.message, success: false };
            }
            return { message: 'Ocurrió un error al escanear el QR', success: false };
        }
    };

    const processQr = async (value: string): Promise<{ message: string, success: boolean }> => {
        try {
            const res = await qrService.process(value)

            if (res instanceof Error) {
                return { message: res.message, success: false };
            }
            return { message: 'QR escaneado correctamente', success: true };
        } catch {
            return { message: 'Ocurrió un error al procesar el QR', success: false };
        }
    };

    return {
        scan
    };
};
