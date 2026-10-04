import { Navigate, Outlet, useLocation } from "react-router-dom";
import PageLoader from "../../components/common/PageLoader";
import { useAuth } from "../../hooks/useAuth";
import { getDashboardPath } from "../../config/roles";

/**
 * Route guard for role workspaces.
 *
 * The role comes from the verified backend session — never from anything the
 * client can edit — so this only controls what the UI shows; the API enforces
 * the same rule server-side.
 */
const RoleRoute = ({ children, allowedRoles, allowedRole, guestRedirectTo = "/login" }) => {
  const { isAuthenticated, isLoading, user, role } = useAuth();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated || !user) {
    return <Navigate to={guestRedirectTo} replace state={{ from: location.pathname + location.search }} />;
  }

  const roles = allowedRoles || (allowedRole ? [allowedRole] : []);

  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return children || <Outlet />;
};

export default RoleRoute;