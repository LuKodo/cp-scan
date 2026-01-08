import { http } from "./http";
import { DateTime } from "luxon";

export interface QrResponse {
    id: number;
    name: string;
    sede: string;
}

export interface DocumentoEntity {
    fechaescaneo: string;
    horaescaneo: string;
    url: string;
    centrocosto: string;
    ssc: string;
    tipodocumento: string;
    numerodocumento: string;
    factura: string;
    facturacuota: string;
    fechadispensacion: string;
    hasImage: boolean;
    svgFirma: string;
}

export const getDataQR = (qr: string): DocumentoEntity => {
    const data = qr.split("|");
    return {
        fechaescaneo: DateTime.now().toFormat("yyyy-MM-dd"),
        horaescaneo: DateTime.now().toFormat("HH:mm:ss"),
        url: '',
        centrocosto: '',
        ssc: data[0].split(":")[1].trim(),
        tipodocumento: data[1].split(":")[1].trim(),
        numerodocumento: data[2].split(":")[1].trim(),
        factura: data[3].split(":")[1].trim(),
        facturacuota: data[4].split(":")[1].trim(),
        fechadispensacion: data[5].split(": ")[1].split(" ")[0],
        hasImage: false,
        svgFirma: '',
    };
}

export const qrService = async (qr: string, sede: string): Promise<DocumentoEntity | Error> => {
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
};