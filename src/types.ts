export interface APIResponse {
    message: string;
    key: string;
}

export interface LoginResponse {
    id: number;
    name: string;
    sede: string;
}

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