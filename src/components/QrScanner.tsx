import { QrCode } from 'lucide-react';
import { toast } from '../utils/alert.utils';
import { useAuth } from '../hooks/useAuth';
import { Redirect } from 'react-router';
import { useIonRouter } from '@ionic/react';
import { useQrScanner } from '../hooks/useQrScanner';
import Loader from './Loader';

const QrScanner: React.FC = () => {
    const { session } = useAuth();
    const router = useIonRouter();

    if (!session) {
        return <Redirect to="/login" />;
    }
    const { scan, loading } = useQrScanner();

    const handleScan = async () => {
        const result = await scan();
        if (result.success) {
            router.push('/step-2');
        }
        toast(result.message);
    };

    return (
        <div className="w-full max-w-md animate-pop">
            {loading && <Loader fullScreen message="Escaneando QR..." />}
            <div className="card-fancy p-10 sm:p-12 text-center space-y-8">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-neutral-text tracking-tight">Escanear QR</h2>
                    </div>
                </div>

                <button
                    onClick={handleScan}
                    className="btn-solid w-full py-12 rounded-[40px] flex-col gap-4 shadow-2xl group"
                >
                    <div className="bg-white/20 p-5 rounded-full group-hover:bg-white/30 transition-colors">
                        <QrCode size={64} className="text-white" />
                    </div>
                    <span className="text-2xl font-black uppercase tracking-widest">Activar Escáner</span>
                </button>

                <div className="pt-4 px-6">
                    <p className="text-[10px] font-black text-neutral-muted uppercase tracking-[0.2em] leading-relaxed opacity-60">
                        Asegura una iluminación óptima para una captura rápida
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QrScanner;
