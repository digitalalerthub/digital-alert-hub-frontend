/* Define estructura del contexto - SOLO types (Vite OK) */

import { createContext } from "react";

export interface JWTPayload {
  id: number;
  email: string;
  rol: number;
}

export interface AuthContextType {
  isLoggedIn: boolean;
  user: JWTPayload | null;
  isAdmin: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
