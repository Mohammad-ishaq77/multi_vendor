import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getDashboardPath } from "../../config/roles";

const RoleRoute = ({ children, allowedRoles, allowedRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  const roles = allowedRoles || (allowedRole ? [allowedRole] : []);

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  return children || <Outlet />;
};

export default RoleRoute;
