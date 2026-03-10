// Componente de control de acceso es decir las paginas protegidas que solo se ven cuando estan logueados, es decir isLoggedIn es true

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

// Definimos una interfaz para las props del componente
const PrivateRoute = () => {
    const { isLoggedIn, isLoading } = useAuth(); // Con él obtenemos el estado global de autenticación (isLoggedIn)

    if (isLoading) {
        return null;
    }

    // Si esta logueado renderiza contenido hijo si no redirige a login y evita guarda la ruta protegida en el navegador
    return isLoggedIn ? <Outlet /> : <Navigate to='/' replace />;
};

export default PrivateRoute;
