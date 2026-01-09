import { http } from "./http";

export const signatureService = {
    save: async (ssc: string, svgFirma: string): Promise<{ saved: boolean, message?: string }> => {
        try {
            await http
                .patch(`documentos/${ssc}`, {
                    json: {
                        svgFirma
                    },
                });
            return { saved: true };
        } catch (error) {
            if (error instanceof Error) {
                return { saved: false, message: error.message };
            }
            return { saved: false, message: 'Error actualizando documento' };
        }
    }
}