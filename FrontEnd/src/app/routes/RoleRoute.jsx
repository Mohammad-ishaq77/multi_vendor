import { Navigate, useLocation } from "react-router-dom";

const roleRoutes = {
  customer: "/customer/dashboard",
  shopkeeper: "/shopkeeper/dashboard",
  delivery: "/delivery/dashboard",
  admin: "/admin/dashboard",
};

const RoleRoute = ({ children, allowedRole }) => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("nearmart_user") || "null");

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const redirectPath = roleRoutes[user.role] || "/";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default RoleRoute;
