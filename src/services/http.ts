import ky from "ky";

export const http = ky.create({
  prefixUrl: 'http://192.168.3.194:8051',
  timeout: 10000,
});
