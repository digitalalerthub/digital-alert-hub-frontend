import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';

interface RoleRouteProps {
    allowedRoles: number[];
}

const RoleRoute = ({ allowedRoles }: RoleRouteProps) => {
    const { isLoggedIn, user } = useAuth();

    if (!isLoggedIn) return <Navigate to='/' replace />;

    if (!allowedRoles.includes(user!.rol)) {
        return <Navigate to='/admin' replace />;
    }

    return <Outlet />;
};

export default RoleRoute;