import { useState, useEffect, useCallback } from "react";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  id: number;
  email: string;
  rol: number;
  exp: number;
}

export const useAuth = () => {
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Función para validar si el token expiró
  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<JWTPayload>(token);
      const now = Math.floor(Date.now() / 1000);
      return decoded.exp < now;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      // ⬅️ VALIDAR EXPIRACIÓN
      if (isTokenExpired(savedToken)) {
        console.log("⚠️ Token expirado, cerrando sesión...");
        localStorage.removeItem("token");
        return;
      }

      try {
        const decoded = jwtDecode<JWTPayload>(savedToken);
        setUser(decoded);
        setToken(savedToken);
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = useCallback((newToken: string) => {
    localStorage.setItem("token", newToken);
    const decoded = jwtDecode<JWTPayload>(newToken);
    setUser(decoded);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  }, []);

  return {
    user,
    isAdmin: user?.rol === 1,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
  };
};
