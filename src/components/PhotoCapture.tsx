import { IonLoading, useIonRouter } from '@ionic/react';
import { Camera, ArrowLeft } from 'lucide-react';
import { useDocumentScanner } from '../hooks/useDocumentScanner';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { toast } from '../utils/alert.utils';

const PhotoCapture: React.FC = () => {
    const router = useIonRouter();
    const { getItem } = useLocalStorage();
    const ssc = getItem('ssc');

    const { takePhoto, loading } = useDocumentScanner();

    const handleTakePhoto = async () => {
        if (!ssc) {
            toast('No se encontro el SSC');
            return;
        }
        const result = await takePhoto(ssc);

        if (!result.success) {
            toast(result.message);
            return;
        }
        //router.push('/step-3');
    };

    const handleBack = () => {
        router.push('/step-1');
    };

    return (
        <div className="w-full max-w-md animate-fadeIn space-y-4">
            <IonLoading
                isOpen={loading}
                message="Cargando..."
                duration={0}
            />
            <div className="card-modern p-8 text-center space-y-6">
                <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-gray-800">Capturar Fórmula</h2>
                    <p className="text-gray-600">Toma una foto clara de la fórmula médica</p>
                </div>

                <span
                    onClick={handleTakePhoto}
                    className="bg-gradient-purple w-full py-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-3"
                >
                    <Camera size={80} className="animate-pulse-glow text-white" />
                    <span className="text-white text-xl">Tomar Foto</span>
                </span>
            </div>

            <span
                onClick={handleBack}
                className="w-full py-4 rounded-2xl font-bold text-white bg-gray-600 hover:bg-gray-700 transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
            >
                <ArrowLeft size={20} />
                Regresar
            </span>
        </div>
    );
};

export default PhotoCapture;
