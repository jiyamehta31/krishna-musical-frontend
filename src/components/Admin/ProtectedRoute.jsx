import { Navigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../context/authContextDef";

export default function ProtectedRoute({ children, allowedRole = "admin" }) {
  const location = useLocation();
  const { user, token, loading, isAuthenticated } = useAuth();

  // Prevent routing flash while authentication state is being restored
  if (loading) {
    return null;
  }

  const isAuthorized = Boolean(
    isAuthenticated &&
    token &&
    user &&
    (allowedRole ? user.role === allowedRole : true),
  );

  if (!isAuthorized) {
    // Dynamically route the user to the correct login portal based on the required role
    const redirectPath = allowedRole === "admin" ? "/admin/login" : "/login";
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
