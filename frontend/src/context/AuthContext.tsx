// Define la estructura del contexto global, es decir, qué datos y funciones estarán disponibles (por ejemplo: isLoggedIn, login, logout).

import { createContext } from "react";

interface AuthContextType {
  isLoggedIn: boolean;
  login: (token: string) => void;
  logout: () => void;
}

// 👇 Solo exportamos el contexto, sin lógica
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
