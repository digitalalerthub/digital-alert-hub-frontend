// Componente de control de acceso es decir las paginas protegidas que solo se ven cuando estan logueados, es decir isLoggedIn es true

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface PrivateRouteProps {
  children: React.ReactElement;
}

/* Definimos una interfaz para las props del componente
"children" representa el componente hijo que se renderizará si el usuario está autenticado */
const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isLoggedIn } = useAuth(); // Con él obtenemos el estado global de autenticación (isLoggedIn)

  // Si esta logueado renderiza contenido hijo si no redirige a login y evita guarda la ruta protegida en el navegador
  return isLoggedIn ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
