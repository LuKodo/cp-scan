import Layout from '../template/layout';
import { useSignatureCapture } from '../hooks/useSignatureCapture';
import { toast } from '../services/alert';
import { useIonRouter } from '@ionic/react';
import { Save, Eraser } from 'lucide-react';

const CaptureSignature: React.FC = () => {
    const router = useIonRouter();
    const {
        paths,
        currentPath,
        handlers,
        actions,
    } = useSignatureCapture();

    const handleSave = async () => {
        const result = await actions.save();
        if (result.saved) {
            toast('Proceso completado');
            router.push('/step-1');
        } else {
            toast(result.message);
        }
    }

    return (
        <Layout title="Firma">
            <div className="w-full max-w-4xl animate-fadeIn space-y-6">
                <div className="card-modern p-4 bg-linear-to-br from-purple-50 to-pink-50">
                    <div className="bg-white border-4 border-purple-200 rounded-2xl shadow-inner overflow-hidden">
                        <svg
                            width="100%"
                            height="200"
                            viewBox="0 0 800 200"
                            preserveAspectRatio="xMidYMid meet"
                            style={{ touchAction: 'none' }}
                            onTouchStart={handlers.start}
                            onTouchMove={handlers.move}
                            onTouchEnd={handlers.end}
                            className="cursor-crosshair"
                        >
                            {/* Grid pattern for better UX */}
                            <defs>
                                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3e8ff" strokeWidth="1" />
                                </pattern>
                            </defs>
                            <rect width="100%" height="100%" fill="url(#grid)" />

                            {/* Signature paths */}
                            {paths.map((d, i) => (
                                <path
                                    key={i}
                                    d={d}
                                    stroke="#7c3aed"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            ))}

                            {currentPath && (
                                <path
                                    d={currentPath}
                                    stroke="#7c3aed"
                                    strokeWidth="3"
                                    fill="none"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            )}
                        </svg>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <span
                        className="btn-gradient-purple py-1 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
                        onClick={handleSave}
                    >
                        <Save size={24} />
                        Guardar
                    </span>

                    <span
                        className="py-1 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 bg-linear-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600 flex items-center justify-center gap-2"
                        onClick={actions.clear}
                    >
                        <Eraser size={24} />
                        Limpiar
                    </span>
                </div>

                {/* Info */}
                <div className="text-center">
                    <p className="text-white/90 text-sm">
                        {paths.length === 0
                            ? 'Comienza a dibujar tu firma'
                            : `${paths.length} trazo${paths.length > 1 ? 's' : ''} capturado${paths.length > 1 ? 's' : ''}`
                        }
                    </p>
                </div>
            </div>
        </Layout>
    );
};

export default CaptureSignature;
