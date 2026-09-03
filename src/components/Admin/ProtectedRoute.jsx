import { useEffect } from "react";
import { Navigate, useLocation, Outlet } from "react-router-dom";

/**
 * Safely decodes a Base64URL JWT payload and verifies expiration.
 */
const decodeAndVerifyToken = (token) => {
  if (!token || typeof token !== "string") return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Convert Base64URL to standard Base64
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const payload = JSON.parse(jsonPayload);

    // Synchronous expiration check (exp is in seconds)
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch (err) {
    console.error("JWT token verification failed:", err);
    return null;
  }
};

const ProtectedRoute = ({ children, allowedRole = "admin" }) => {
  const location = useLocation();

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");

  let user = null;
  if (storedUser && storedUser !== "undefined") {
    try {
      user = JSON.parse(storedUser);
    } catch {
      user = null;
    }
  }

  // Synchronously verify token integrity, expiration, and role
  const decodedToken = decodeAndVerifyToken(token);
  const isAuthorized = Boolean(
    token && decodedToken && user && user.role === allowedRole,
  );

  // Clean up corrupted or expired credentials asynchronously without fighting router navigation
  useEffect(() => {
    if (!isAuthorized && (token || storedUser)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [isAuthorized, token, storedUser]);

  // Block unauthorized rendering synchronously before child components can mount
  if (!isAuthorized) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default ProtectedRoute;
