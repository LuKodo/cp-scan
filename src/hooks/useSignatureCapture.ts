import { useState } from 'react';
import {
    useIonViewWillEnter,
    useIonViewWillLeave,
} from '@ionic/react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { signatureService } from '../services/signature.service';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getSvgString } from '../utils/signature.utils';

export const useSignatureCapture = () => {
    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<string>('');

    const { getItem } = useLocalStorage();

    /* ──────────────────────────────────────────
       Ciclo de vida / orientación
    ────────────────────────────────────────── */
    useIonViewWillEnter(() => {
        ScreenOrientation.lock({ orientation: 'landscape' });
    });

    useIonViewWillLeave(() => {
        ScreenOrientation.unlock();
    });

    /* ──────────────────────────────────────────
       Touch helpers
    ────────────────────────────────────────── */
    const getPoint = (e: React.TouchEvent) => {
        const rect = (e.target as HTMLElement).getBoundingClientRect();
        const touch = e.touches[0];

        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top,
        };
    };

    const start = (e: React.TouchEvent) => {
        e.preventDefault();
        const { x, y } = getPoint(e);
        setCurrentPath(`M ${x} ${y}`);
    };

    const move = (e: React.TouchEvent) => {
        e.preventDefault();
        if (!currentPath) return;

        const { x, y } = getPoint(e);
        setCurrentPath(p => `${p} L ${x} ${y}`);
    };

    const end = () => {
        if (!currentPath) return;

        setPaths(p => [...p, currentPath]);
        setCurrentPath('');
    };

    const clear = () => {
        setPaths([]);
        setCurrentPath('');
    };

    /* ──────────────────────────────────────────
       Persistencia
    ────────────────────────────────────────── */
    const save = async (): Promise<{ message: string, saved: boolean }> => {
        if (!paths.length) {
            return { message: 'No hay una firma para guardar', saved: false };
        }

        const ssc = getItem('ssc');
        if (!ssc) {
            return { message: 'SSC no encontrado', saved: false };
        }

        try {
            const svgString = getSvgString(paths);
            const response = await signatureService.save(ssc, svgString);

            if (!response?.saved) {
                throw new Error('Error al guardar la firma');
            }

            return { message: 'Proceso completado', saved: true };

        } catch (err) {
            return {
                message:
                    err instanceof Error
                        ? err.message
                        : 'Error inesperado al guardar la firma',
                saved: false,
            };
        }
    };

    return {
        paths,
        currentPath,
        handlers: {
            start,
            move,
            end,
        },
        actions: {
            clear,
            save,
        },
    };
};
