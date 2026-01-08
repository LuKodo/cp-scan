import { Capacitor, CapacitorHttp } from "@capacitor/core";
import { API_URL } from "../../config";

export const documentService = {
    update: async (ssc: string): Promise<{ saved: boolean }> => {
        try {
            const response = await CapacitorHttp
                .patch({
                    url: `${API_URL}/documentos/${ssc}`,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: {
                        hasImage: true
                    },
                });
            return response.data;
        } catch (error) {
            return { saved: false };
        }
    },
    generateUrl: async (filename: string) => {
        try {
            const res = await CapacitorHttp
                .post({
                    url: `${API_URL}/file/presigned-url`,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: { filename: filename },
                });
            return { success: true, message: res.data.url };
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