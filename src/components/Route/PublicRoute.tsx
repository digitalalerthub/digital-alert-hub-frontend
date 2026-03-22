import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/useAuth";

const PublicRoute = () => {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return isLoggedIn ? <Navigate to="/admin" replace /> : <Outlet />;
};

export default PublicRoute;
