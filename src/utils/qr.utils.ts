import { DocumentoEntity } from "../types";
import { DateTime } from "luxon";

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