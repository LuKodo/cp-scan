import { APIResponse } from "../types";
import { http } from "./http";

export const documentService = {
    save: async (file: File): Promise<APIResponse | Error> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            return http
                .post("file/upload", {
                    body: formData,
                })
                .json<APIResponse>();
        } catch (error) {
            return error as Error;
        }
    },
    update: async (ssc: string): Promise<{ saved: boolean }> => {
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
    }
}
