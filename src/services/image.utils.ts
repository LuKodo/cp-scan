import ky from "ky";
import { http } from "./http";
import { Capacitor } from '@capacitor/core';

export const base64ToFile = (
    base64: string,
    filename: string,
    mime = 'image/jpeg'
): File => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Uint8Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    return new File([byteNumbers], filename, { type: mime });
};

export const getBase64Size = (base64: string) => {
    const padding =
        base64.endsWith('==') ? 2 :
            base64.endsWith('=') ? 1 : 0;

    const bytes = (base64.length * 3) / 4 - padding;

    return {
        bytes,
        kb: Number((bytes / 1024).toFixed(2)),
        mb: Number((bytes / (1024 * 1024)).toFixed(2)),
    };
};

export const generateUrl = async (filename: string) => {
    try {
        const res = await http.post<{ url: string, objectName: string }>(`file/presigned-url`, {
            json: { filename },
        }).json();

        return { success: true, message: res.url };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'Error generando URL' };
    }
};

export const uploadToOCI = async (file: File, url: string) => {
    try {
        await ky.put(url, {
            headers: {
                'Content-Type': 'image/jpeg',
            },
            body: file,
        });

        return { success: true, message: 'Archivo subido correctamente' };
    } catch (error) {
        if (error instanceof Error) {
            return { success: false, message: error.message };
        }
        return { success: false, message: 'Error subiendo archivo a OCI' };
    }
};

export async function fileFromPath(
    path: string,
    filename: string
): Promise<File> {
    const fileUrl = Capacitor.convertFileSrc(path);
    const response = await fetch(fileUrl);

    if (!response.ok) {
        throw new Error('No se pudo leer el archivo escaneado');
    }

    const blob = await response.blob();

    return new File([blob], filename, {
        type: blob.type || 'image/jpeg',
    });
}
