import { useState } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import axios from "axios";
import "./AdminLogin.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

/**
 * Validates JWT expiration without external libraries
 */
const isTokenValid = (token) => {
  if (!token || typeof token !== "string") return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return payload.exp ? Date.now() < payload.exp * 1000 : true;
  } catch {
    return false;
  }
};

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  // Reconstruct full destination path including query parameters
  const redirectTarget = location.state?.from
    ? `${location.state.from.pathname || "/admin"}${
        location.state.from.search || ""
      }`
    : "/admin";

  // Check stored credentials synchronously
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

  // Prevent flash of login form if administrator is already verified
  if (token && user?.role === "admin" && isTokenValid(token)) {
    return <Navigate to={redirectTarget} replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const sanitizedEmail = email.trim().toLowerCase();

      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        email: sanitizedEmail,
        password,
      });

      const { token: receivedToken, user: receivedUser } = response.data;

      if (receivedUser?.role !== "admin") {
        setErrorMessage(
          "Access denied: This account lacks administrative credentials.",
        );
        return;
      }

      localStorage.setItem("token", receivedToken);
      localStorage.setItem("user", JSON.stringify(receivedUser));

      // Redirect directly to destination preserving search params
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      console.error("Admin login error:", error);
      const serverMsg =
        error.response?.data?.message ||
        (error.code === "ECONNABORTED" || !error.response
          ? "Server is waking up (Render spin-up). Please wait 15 seconds and try again."
          : "Invalid credentials. Please verify your email and password.");
      setErrorMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <span className="admin-badge">PORTAL ACCESS</span>
          <h1>Krishna Musicals</h1>
          <p>Workshop Inventory & Catalog Administration</p>
        </div>

        {errorMessage && (
          <div className="login-error-banner" role="alert">
            <span className="error-icon">⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              name="email"
              placeholder="admin@krishnamusicals.com"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              name="password"
              placeholder="••••••••••••"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="admin-submit-btn">
            {loading ? "Authenticating Session..." : "Sign In to Dashboard"}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link to="/" className="back-store-link">
            ← Return to Public Storefront
          </Link>
        </div>
      </div>
    </main>
  );
};

export default AdminLogin;
