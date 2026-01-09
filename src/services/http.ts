import ky from "ky";
import { API_URL } from "../../config";

export const http = ky.create({
    prefixUrl: API_URL,
    retry: {
        limit: 2,
    },
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});
