import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "auth";

function nowMs() {
  return Date.now();
}

function loadAuth() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Validación básica de forma
    if (!parsed?.token || !parsed?.expiresAtMs) return null;

    // Si expiró, limpiamos
    if (parsed.expiresAtMs <= nowMs()) return null;

    return parsed;
  } catch {
    return null;
  }
}

function saveAuth(auth) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => loadAuth());

  // Persistencia automática
  useEffect(() => {
    if (auth) saveAuth(auth);
    else clearAuth();
  }, [auth]);

  // Auto-logout cuando vence (opcional pero útil)
  useEffect(() => {
    if (!auth?.expiresAtMs) return;

    const msLeft = auth.expiresAtMs - nowMs();
    if (msLeft <= 0) {
      setAuth(null);
      return;
    }

    const id = setTimeout(() => setAuth(null), msLeft);
    return () => clearTimeout(id);
  }, [auth?.expiresAtMs]);

  const value = useMemo(() => {
    const token = auth?.token ?? null;
    const isAuthenticated = Boolean(token);

    const setSessionFromLogin = (loginResponse) => {
      // loginResponse: { token, expiresInSeconds }
      const expiresAtMs = nowMs() + (loginResponse.expiresInSeconds * 1000);
      setAuth({ token: loginResponse.token, expiresAtMs });
    };

    const logout = () => setAuth(null);

    const getToken = () => auth?.token ?? null;

    return { token, isAuthenticated, setSessionFromLogin, logout, getToken, auth };
  }, [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider />");
  return ctx;
}
