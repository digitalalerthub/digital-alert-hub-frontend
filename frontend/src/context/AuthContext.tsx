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

// /* Define la estructura del contexto global, es decir, qué datos y funciones estarán disponibles
// (por ejemplo: isLoggedIn, login, logout).*/

// import { createContext } from "react";

// interface AuthContextType {
//   isLoggedIn: boolean;
//   login: (token: string) => void;
//   logout: () => void;
// }

// // Solo exportamos el contexto, sin lógica
// export const AuthContext = createContext<AuthContextType | undefined>(
//   undefined
// );
