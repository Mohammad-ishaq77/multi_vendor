import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import authService from "../../services/authService";

const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated && user) {
    return <Navigate to={authService.getPostAuthPath(user)} replace />;
  }

  return children || <Outlet />;
};

export default GuestRoute;
