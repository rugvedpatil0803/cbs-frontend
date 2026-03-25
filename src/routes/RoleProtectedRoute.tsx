import { Navigate, Outlet } from "react-router-dom";

type Props = {
  allowedRoles: string[];
};

const RoleProtectedRoute = ({ allowedRoles }: Props) => {
  const roles = JSON.parse(localStorage.getItem("roles") || "[]");

  const hasAccess = roles.some((role: string) =>
    allowedRoles.includes(role)
  );

  return hasAccess ? <Outlet /> : <Navigate to="/login" replace />;
};

export default RoleProtectedRoute;