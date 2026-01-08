// services/formula.service.ts
import { http } from "./http";

interface FormulaResponse {
    message: string;
    key: string;
}

export const formulaService = async (file: File): Promise<FormulaResponse | Error> => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        return http
            .post("file/upload", {
                body: formData,
            })
            .json<FormulaResponse>();
    } catch (error) {
        return error as Error;
    }
};

export const updateFormulaService = async (ssc: string): Promise<{ saved: boolean }> => {
    try {
        return http
            .patch(`documentos/${ssc}`, {
                json: {
                    hasImage: true
                },
            })
            .json<{ saved: boolean }>();
    } catch (error) {
        return { saved: false };
    }
};
