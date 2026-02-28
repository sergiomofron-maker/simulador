import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { login as loginRequest, register as registerRequest } from '../lib/apiClient';

interface AuthContextValue {
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AUTH_TOKEN_KEY = 'simulador.auth.token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function getInitialToken(): string | null {
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(getInitialToken);

  const setSession = (nextToken: string | null) => {
    setToken(nextToken);

    if (nextToken) {
      window.localStorage.setItem(AUTH_TOKEN_KEY, nextToken);
      return;
    }

    window.localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login: async (email, password) => {
        const response = await loginRequest({ email, password });
        setSession(response.token);
      },
      register: async (email, password) => {
        const response = await registerRequest({ email, password });
        setSession(response.token);
      },
      logout: () => {
        setSession(null);
      }
    }),
    [token]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
