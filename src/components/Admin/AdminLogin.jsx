// src/components/Admin/AdminLogin.jsx
import { useState } from "react";
import { useNavigate, useLocation, Navigate, Link } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/authContextDef";
import "./AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const {
    token,
    isAuthenticated,
    user,
    loading: authLoading,
    loginWithCredentials,
  } = useAuth();

  const isAdmin = user?.role === "admin";
  const redirectTarget = location.state?.from
    ? `${location.state.from.pathname || "/admin"}${
        location.state.from.search || ""
      }`
    : "/admin";

  // 1. CRITICAL: Block all redirect decisions until initial auth resolution is done
  if (authLoading) {
    return null;
  }

  // 2. Only redirect if fully verified
  if (isAuthenticated && isAdmin && token) {
    return <Navigate to={redirectTarget} replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setLoading(true);

    try {
      const sanitizedEmail = email.trim().toLowerCase();

      const response = await API.post("/auth/login", {
        identifier: sanitizedEmail,
        password,
      });

      const { token: receivedToken, user: receivedUser } = response.data;

      if (receivedUser?.role !== "admin") {
        setErrorMessage(
          "Access denied: This account lacks administrative credentials.",
        );
        return;
      }

      loginWithCredentials(receivedUser, receivedToken);
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      const serverMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.code === "ECONNABORTED" || !error.response
          ? "Server is waking up. Please wait 15 seconds and try again."
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
}
