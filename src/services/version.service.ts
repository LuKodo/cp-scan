import { http } from "./http";

export const versionService = {
    get: async (): Promise<{ version: string }> => {
        try {
            const response = await http.get(`/config/version`);
            return response.json();
        } catch (error) {
            if (error instanceof Error) {
                return { version: error.message };
            }
            return { version: 'Error obteniendo version' };
        }
    }
}
