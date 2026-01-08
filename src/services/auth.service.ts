import { LoginResponse } from "../types";
import { http } from "./http";

export const authService = {
    login: async (username: string, password: string): Promise<LoginResponse | Error> => {
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
    }
}