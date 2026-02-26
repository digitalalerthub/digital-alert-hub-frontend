import { useState, useEffect, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";
import type { JWTPayload } from "./AuthContext";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<JWTPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      try {
        const decoded = jwtDecode<JWTPayload>(savedToken);
        setUser(decoded);
        setToken(savedToken);
        setIsLoggedIn(true);
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem("token", newToken);
    const decoded = jwtDecode<JWTPayload>(newToken);

    setUser(decoded);
    setToken(newToken);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        isAdmin: user?.rol === 1,
        token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};