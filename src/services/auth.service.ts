import { LoginResponse } from "../types";
import { http } from "./http";

export const authService = {
    login: async (username: string, password: string): Promise<LoginResponse> => {
        try {
            const body = {
                name: username,
                password
            };
            const response = await http.post('users/login', {
                json: body
            });
            return response.json();
        } catch (e) {
            if (e instanceof Error) {
                throw e;
            }
            throw new Error('An unknown error occurred');
        }
    }
}