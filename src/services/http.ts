import ky from "ky";

export const http = ky.create({
    prefixUrl: 'https://api-mobile.pharmaser.com.co',
    retry: {
        limit: 2,
    },
    timeout: 10000,
    credentials: 'include',
});
