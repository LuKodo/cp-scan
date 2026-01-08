import { http } from "./http";

export const signatureService = {
    save: async (ssc: string, svgFirma: string): Promise<{ saved: boolean }> => {
        try {
            return http
                .patch(`documentos/${ssc}`, {
                    json: {
                        svgFirma
                    },
                })
                .json<{ saved: boolean }>();
        } catch (error) {
            return { saved: false };
        }
    }
}