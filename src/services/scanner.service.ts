import { DocumentoEntity } from "../types";
import { getDataQR } from "../utils/qr.utils";
import { CapacitorHttp } from "@capacitor/core";
import { API_URL } from "../../config";

export const qrService = {
    process: async (qr: string): Promise<DocumentoEntity | Error> => {
        try {
            const data = getDataQR(qr);
            const response = await CapacitorHttp.post({
                url: `${API_URL}/documentos`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    ...data,
                }
            });
            return response.data;
        } catch (error) {
            return error as Error;
        }
    }
};