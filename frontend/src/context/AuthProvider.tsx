/* Es el cerebro del sistema de autenticación. Guarda si el usuario está logueado, permite iniciar o cerrar sesión, y comparte esa información con toda la app.
Guarda token, cambia isLoggedIn = true */

import { useState, useEffect, type ReactNode } from "react"; // Manejar estados y ejecución de la logica del componente
import { AuthContext } from "./AuthContext"; // Contexto estado de autenticación

// Envuelve la aplicación en app.tsx comparte el estado global
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado local: indica si el usuario está logueado o no

  // se ejecuta al montar el componente (una sola vez)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true); // Validamos si hay token guardado en el navegador
  }, []); // significa que solo se ejecuta una vez (cuando carga la app)

  // Función para iniciar sesión
  const login = (token: string) => {
    localStorage.setItem("token", token);
    setIsLoggedIn(true); // Actualiza el estado a "logueado"
  };

  const logout = () => {
    localStorage.removeItem("token"); // Elimina el token
    setIsLoggedIn(false); // Cambia el estado a no logueado
  };

  /* Retornamos el proveedor del contexto, Pasamos las variables y funciones a través del "value"
  Así cualquier componente dentro del Provider puede usar estos valores */
  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
