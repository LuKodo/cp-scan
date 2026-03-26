import type { Documento, DocumentoResponseDTO, QRData } from '../types/domain';

export const DocumentMapper = {
  fromQRData(qrData: QRData, centroCosto: string, fechaEscaneo: string, horaEscaneo: string): Documento {
    return {
      fechaescaneo: fechaEscaneo,
      horaescaneo: horaEscaneo,
      url: '',
      centrocosto: centroCosto,
      ssc: qrData.ssc,
      tipodocumento: qrData.tipoDocumento,
      numerodocumento: qrData.numeroDocumento,
      factura: qrData.factura,
      facturacuota: qrData.facturaCuota,
      fechadispensacion: qrData.fechaDispensacion,
      origen: 'APP',
      estado: qrData.estado ?? 'PENDIENTE',
    };
  },

  fromDTO(dto: DocumentoResponseDTO): Documento {
    return {
      fechaescaneo: dto.fechaescaneo,
      horaescaneo: dto.horaescaneo,
      url: dto.url,
      centrocosto: dto.centrocosto,
      ssc: dto.ssc,
      tipodocumento: dto.tipodocumento,
      numerodocumento: dto.numerodocumento,
      factura: dto.factura,
      facturacuota: dto.facturacuota,
      fechadispensacion: dto.fechadispensacion,
      origen: dto.origen,
      estado: dto.estado,
    };
  },

  toDTO(doc: Documento): DocumentoResponseDTO {
    return {
      fechaescaneo: doc.fechaescaneo,
      horaescaneo: doc.horaescaneo,
      url: doc.url,
      centrocosto: doc.centrocosto,
      ssc: doc.ssc,
      tipodocumento: doc.tipodocumento,
      numerodocumento: doc.numerodocumento,
      factura: doc.factura,
      facturacuota: doc.facturacuota,
      fechadispensacion: doc.fechadispensacion,
      origen: doc.origen,
      estado: doc.estado,
    };
  },
};
