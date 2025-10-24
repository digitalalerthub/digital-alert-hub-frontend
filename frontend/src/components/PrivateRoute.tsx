import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth"; // 👈 Asegúrate de tener este hook

interface PrivateRouteProps {
  children: React.ReactElement;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? children : <Navigate to="/" replace />;
};

export default PrivateRoute;
