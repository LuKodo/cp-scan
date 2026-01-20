import Layout from "../template/layout";
import { useSignatureCapture } from "../hooks/useSignatureCapture";
import { toast } from "../utils/alert.utils";
import { useIonRouter } from "@ionic/react";
import { Save, Eraser } from "lucide-react";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";

const CaptureSignature: React.FC = () => {
  const router = useIonRouter();
  const { paths, currentPath, handlers, actions, loading } = useSignatureCapture();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    actions.clear();
  }, []);

  const handleSave = async () => {
    const result = await actions.save();
    if (result.saved) {
      setIsNavigating(true);
      toast("Proceso completado");
      actions.clear();
      router.push("/step-1");
    } else {
      toast(result.message);
    }
  };

  return (
    <Layout>
      {(loading || isNavigating) && <Loader fullScreen message={isNavigating ? "Guardando..." : "Procesando firma..."} />}
      <div className="w-full max-w-4xl space-y-8">
        <div className="card-fancy p-6 sm:p-8 bg-white border-2 border-primary-soft">
          <div className="bg-neutral-subtle border-4 border-white rounded-3xl shadow-inner overflow-hidden relative">
            <svg
              width="100%"
              height="180"
              viewBox="0 0 800 180"
              preserveAspectRatio="xMidYMid meet"
              style={{ touchAction: "none" }}
              onTouchStart={handlers.start}
              onTouchMove={handlers.move}
              onTouchEnd={handlers.end}
              className="cursor-crosshair"
            >
              {/* Grid pattern for better UX */}
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#ede9fe"
                    strokeWidth="1.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Signature paths */}
              {paths.map((d, i) => (
                <path
                  key={i}
                  d={d}
                  stroke="#7c3aed"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}

              {currentPath && (
                <path
                  d={currentPath}
                  stroke="#7c3aed"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>

            <div className="absolute bottom-4 right-6 pointer-events-none opacity-20">
              <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">Firma Digital</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <button
            className="btn-solid py-6 text-xl shadow-2xl"
            onClick={handleSave}
          >
            <Save size={28} strokeWidth={2.5} />
            <span>Guardar Firma</span>
          </button>

          <button
            className="btn-secondary py-6 text-xl shadow-2xl"
            onClick={actions.clear}
          >
            <Eraser size={28} strokeWidth={2.5} />
            <span>Borrar todo</span>
          </button>
        </div>

        {/* Info */}

        <div className="pt-4 px-6 text-center">
          <p className="text-[10px] font-black text-neutral-muted uppercase tracking-[0.2em] leading-relaxed opacity-60">
            Dibuja tu firma en el recuadro superior
          </p>
        </div>

      </div>
    </Layout>
  );
};

export default CaptureSignature;
