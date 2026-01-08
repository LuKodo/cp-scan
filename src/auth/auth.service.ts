import { LoginResponse } from "../types";

const FOUR_HOURS = 4 * 60 * 60 * 1000;
const SESSION_KEY = 'session';

export type Session = {
  token: LoginResponse;
  expiresAt: number;
};

export function saveSession(token: LoginResponse): Session {
  const session: Session = {
    token,
    expiresAt: Date.now() + FOUR_HOURS,
  };

  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function getSession(): Session | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;

  const session: Session = JSON.parse(raw);

  if (Date.now() > session.expiresAt) {
    clearSession();
    return null;
  }

  return session;
}

export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}
