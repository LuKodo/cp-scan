import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { qrService } from '../services/scanner.service';
import { useLocalStorage } from './useLocalStorage';
import { Camera } from '@capacitor/camera';

interface UseQrScannerProps {
    sede: string;
}

export const useQrScanner = ({ sede }: UseQrScannerProps) => {
    const { setItem } = useLocalStorage();

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
            const res = await qrService.process(value, sede);

            if (res instanceof Error) {
                return { message: res.message, success: false };
            }

            setItem('ssc', res.ssc);
            return { message: 'QR escaneado correctamente', success: true };
        } catch {
            return { message: 'Ocurrió un error al procesar el QR', success: false };
        }
    };

    return {
        scan
    };
};
