import { BarcodeScanner } from '@capacitor-mlkit/barcode-scanning';
import { qrService } from '../services/qr';
import { QrCode } from 'lucide-react';
import { toast } from '../services/alert';
import { useAuth } from '../hooks/useAuth';
import { Redirect } from 'react-router';
import { useIonRouter } from '@ionic/react';
import { useQrScanner } from '../hooks/useQrScanner';

const QrScanner: React.FC = () => {
    const { session } = useAuth();
    const router = useIonRouter();

    if (!session) {
        return <Redirect to="/login" />;
    }
    const sede = session.token.sede;
    const { scan } = useQrScanner({ sede });

    const handleScan = async () => {
        const result = await scan();
        if (result.success) {
            router.push('/step-2');
        }
        toast(result.message);
    };

    return (
        <div className="w-full max-w-md animate-fadeIn">
            <div className="card-modern p-8 text-center space-y-6">
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-800">Escanear QR</h2>
                    <p className="text-gray-600">Presiona el botón para escanear el código QR</p>
                </div>

                <span
                    onClick={handleScan}
                    className="btn-gradient-purple w-full py-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3"
                >
                    <QrCode size={80} />
                    <span className="text-white text-xl">Escanear QR</span>
                </span>

                <div className="pt-4">
                    <p className="text-sm text-gray-500">
                        Asegúrate de que el código QR esté bien iluminado
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QrScanner;
