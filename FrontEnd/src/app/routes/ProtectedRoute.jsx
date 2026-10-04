import { Navigate, Outlet, useLocation } from "react-router-dom";
import PageLoader from "../../components/common/PageLoader";
import { useAuth } from "../../hooks/useAuth";

/**
 * Blocks a route until the backend confirms a live session.
 * While the session is still being restored we render a loader, so a hard
 * refresh on a deep link never bounces the user to the login screen.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return children || <Outlet />;
};

export default ProtectedRoute;