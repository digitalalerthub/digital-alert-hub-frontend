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




// /* Es el cerebro del sistema de autenticación. Ahora integra useAuth + isLoggedIn */

// import { useState, useEffect, type ReactNode } from "react"; // Manejar estados y ejecución de la logica del componente
// import { AuthContext } from "./AuthContext"; // Contexto estado de autenticación

// // Envuelve la aplicación en app.tsx comparte el estado global
// export const AuthProvider = ({ children }: { children: ReactNode }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado local: indica si el usuario está logueado o no

//   // se ejecuta al montar el componente (una sola vez)
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) setIsLoggedIn(true); // Validamos si hay token guardado en el navegador
//   }, []); // significa que solo se ejecuta una vez (cuando carga la app)

//   // Función para iniciar sesión
//   const login = (token: string) => {
//     localStorage.setItem("token", token);
//     setIsLoggedIn(true); // Actualiza el estado a "logueado"
//   };

//   const logout = () => {
//     localStorage.removeItem("token"); // Elimina el token
//     setIsLoggedIn(false); // Cambia el estado a no logueado
//   };

//   /* Retornamos el proveedor del contexto, Pasamos las variables y funciones a través del "value"
//   Así cualquier componente dentro del Provider puede usar estos valores */
//   return (
//     <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
