// Este hook nos permite acceder a cualquier contexto que haya sido creado con createContext()

import { useContext } from "react";
import { AuthContext } from "./AuthContext";

// Definimos un hook personalizado: useAuth
// Su propósito es facilitar el uso del AuthContext en otros componentes
export const useAuth = () => {
  const context = useContext(AuthContext);  // Esto nos da acceso a las variables y funciones compartidas (isLoggedIn, login, logout)
  if (!context) throw new Error("useAuth debe usarse dentro de un AuthProvider"); // Validamos que el hook se esté usando dentro del <AuthProvider>
  return context; // Retornamos el contexto ya validado
};
