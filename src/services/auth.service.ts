import { LoginResponse } from "../types";
import { http } from "./http";

export const authService = {
    login: async (username: string, password: string): Promise<LoginResponse | Error> => {
        try {
            const body = {
                name: username,
                password
            };
            const response = await http.post('/users/login', {
                json: body
            });
            return response.json();
        } catch (e) {
            if (e instanceof Error) {
                return e;
            }
            return new Error('An unknown error occurred');
        }
    }
}