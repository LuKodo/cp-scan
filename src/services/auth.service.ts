import { CapacitorHttp } from "@capacitor/core";
import { LoginResponse } from "../types";
import { API_URL } from "../../config";

export const authService = {
    login: async (username: string, password: string): Promise<LoginResponse | Error> => {
        const body = {
            name: username,
            password
        };
        const response = await CapacitorHttp.post({
            url: `${API_URL}/users/login`,
            headers: {
                'Content-Type': 'application/json',
            },
            data: body
        });
        return response.data;
    }
}