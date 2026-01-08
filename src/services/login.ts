import { http } from "./http";

export interface LoginResponse {
    id: number;
    name: string;
    sede: string;
}

export const loginservice = async (username: string, password: string): Promise<LoginResponse | Error> => {
    try {
        const response = await http.post<LoginResponse>("users/login", {
            json: {
                username,
                password
            }
        });
        return response.json();
    } catch (error) {
        return error as Error;
    }
};