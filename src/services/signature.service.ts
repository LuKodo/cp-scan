import { CapacitorHttp } from "@capacitor/core";
import { API_URL } from "../../config";

export const signatureService = {
    save: async (ssc: string, svgFirma: string): Promise<{ saved: boolean }> => {
        try {
            await CapacitorHttp
                .patch({
                    url: `${API_URL}/documentos/${ssc}`,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    data: {
                        svgFirma
                    },
                });
            return { saved: true };
        } catch (error) {
            return { saved: false };
        }
    }
}