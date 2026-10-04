import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import authService from "../../services/authService";

/** Keeps signed-in users away from /login and /register. */
const GuestRoute = ({ children }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return null;

  if (isAuthenticated && user) {
    const from = location.state?.from;
    return (
      <Navigate to={from || authService.getPostAuthPath(user)} replace />
    );
  }

  return children || <Outlet />;
};

export default GuestRoute;