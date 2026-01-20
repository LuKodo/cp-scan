import React, { createContext, useEffect, useState } from "react";
import { clearSession, getSession, saveSession, Session } from "./auth.service";
import { LoginResponse } from "../types";

type AuthContextType = {
  session: Session | null;
  login: (token: LoginResponse) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>(null!);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = getSession();
    setSession(s);
    setLoading(false);
  }, []);

  const login = (token: LoginResponse) => {
    if (!token.metodo_firma) {
      throw new Error(
          "No tienes un metodo de firma asociado, contacta con el administrador",
      );
    }

    if (!token.sede) {
      throw new Error(
          "No tienes una sede asociada, contacta con el administrador",
      );
    }
    const s = saveSession(token);
    setSession(s);
  };

  const logout = () => {
    clearSession();
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ session, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
