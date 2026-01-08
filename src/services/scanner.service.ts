import { DocumentoEntity } from "../types";
import { http } from "./http";
import { getDataQR } from "../utils/qr.utils";

export const qrService = {
    process: async (qr: string, sede: string): Promise<DocumentoEntity | Error> => {
        try {
            const data = getDataQR(qr);
            const response = await http.post<DocumentoEntity>("documentos", {
                json: {
                    ...data,
                    centrocosto: sede
                }
            }).json();
            return response;
        } catch (error) {
            return error as Error;
        }
    }
};