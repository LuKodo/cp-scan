import { Capacitor } from "@capacitor/core";
import { API_URL } from "../../config";
import { http } from "./http";

export const documentService = {
    update: async (ssc: string): Promise<{ saved: boolean, message?: string }> => {
        try {
            const response = await http
                .patch(`/documentos/${ssc}`, {
                    json: {
                        hasImage: true
                    },
                });
            return response.json();
        } catch (error) {
            if (error instanceof Error) {
                return { saved: false, message: error.message };
            }
            return { saved: false, message: 'Error actualizando documento' };
        }
    },
    generateUrl: async (filename: string) => {
        try {
            const res = await http
                .post(`/file/presigned-url`, {
                    json: {
                        filename: filename
                    },
                });
            return { success: true, message: res.json() };
        } catch (error) {
            if (error instanceof Error) {
                return { success: false, message: error.message };
            }
            console.error(error);
            return { success: false, message: 'Error generando URL' };
        }
    },
    uploadToOCI: async (path: string, url: string) => {
        try {
            const fileUrl = Capacitor.convertFileSrc(path);
            const response = await fetch(fileUrl);
            const buffer = await response.arrayBuffer();
            const binary = new Uint8Array(buffer);

            await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'image/jpeg',
                },
                body: binary,
            });

            return { success: true, message: 'Archivo subido correctamente' };
        } catch (error) {
            if (error instanceof Error) {
                return { success: false, message: error.message };
            }
            return { success: false, message: 'Error subiendo archivo a OCI' };
        }
    }
}