import ky from "ky";

export const versionService = {
    get: async (): Promise<{ version: string, url: string }> => {
        try {
            const response = await ky.get(`https://raw.githubusercontent.com/LuKodo/cp-scan/refs/heads/main/releases/version.json`);
            return response.json();
        } catch (error) {
            if (error instanceof Error) {
                return { version: error.message, url: '' };
            }
            return { version: 'Error obteniendo version', url: '' };
        }
    }
}
