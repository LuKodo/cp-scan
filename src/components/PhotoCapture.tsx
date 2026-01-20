import { useState } from "react";
import { useIonRouter } from "@ionic/react";
import { Camera, ArrowLeft } from "lucide-react";
import { useDocumentScanner } from "../hooks/useDocumentScanner";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { toast } from "../utils/alert.utils";
import nextStep from "../utils/router";
import { useLocation } from 'react-router-dom';
import Loader from "./Loader";

interface Props {
  type: string;
}

const PhotoCapture: React.FC<Props> = ({ type }) => {
  const router = useIonRouter();
  const { getItem } = useLocalStorage();
  const ssc = getItem("ssc");
  const session = getItem("session");
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const { takePhoto } = useDocumentScanner();

  const handleTakePhoto = async () => {
    try {
      setLoading(true);
      if (!ssc) {
        toast("No se encontro el SSC");
        return;
      }
      const result = await takePhoto(ssc, type);

      if (!result.success) {
        toast(result.message);
        return;
      }

      const signature_method = JSON.parse(session!);
      const next = nextStep(signature_method.token.metodo_firma);
      if (location.pathname === "/step-2") {
        setLoading(false);
        router.push(next);
      } else {
        setLoading(false);
        toast("Proceso completado")
        router.push("/step-1");
      }
    } catch (error) {
      setLoading(false);
      console.error(error);
      toast("Error al tomar la foto");
    }
  };

  const handleBack = () => {
    router.push("/step-1");
  };

  return (
    <div className="w-full flex flex-col items-center animate-pop">
      {(loading) && <Loader fullScreen message={"Procesando captura..."} />}

      <div className="card-fancy p-10 sm:p-12 text-center space-y-10 w-full shadow-2xl">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-neutral-text tracking-tight">
              {type === "formula" ? "Capturar Fórmula" : "Capturar Firma"}
            </h3>
          </div>
        </div>

        <button
          onClick={handleTakePhoto}
          className="btn-solid w-full py-12 rounded-[40px] flex-col gap-4 shadow-2xl group"
        >
          <div className="bg-white/20 p-5 rounded-full group-hover:bg-white/30 transition-colors">
            <Camera size={56} className="text-white" />
          </div>
          <span className="text-2xl font-black uppercase tracking-widest">Iniciar Cámara</span>
        </button>
      </div>

      <button
        onClick={handleBack}
        className="btn-secondary w-full mt-6 py-5 flex items-center justify-center gap-3 group active:scale-95 shadow-sm"
      >
        <ArrowLeft size={22} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-extrabold uppercase tracking-widest text-sm">Volver al inicio</span>
      </button>

      <div className="mt-12 px-10 text-center opacity-30">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-relaxed">
          Los archivos se cifran antes de ser enviados
        </p>
      </div>
    </div>
  );
};

export default PhotoCapture;
