import { DocumentoEntity } from "../types";
import { getDataQR } from "../utils/qr.utils";
import { http } from "./http";

export const qrService = {
    process: async (qr: string): Promise<DocumentoEntity | Error> => {
        try {
            const data = getDataQR(qr);
            const response = await http.post(`documentos`, {
                json: {
                    ...data,
                },
            });
            return response.json();
        } catch (error) {
            if (error instanceof Error) {
                return error;
            }
            return new Error('An unknown error occurred');
        }
    }
};