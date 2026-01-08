import React, { createContext, useContext, useEffect, useState } from 'react';
import { clearSession, getSession, saveSession, Session } from './auth.service';
import { LoginResponse } from '../services/login';

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
