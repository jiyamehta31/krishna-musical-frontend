import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import "./Login.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/profile";

  // Redirect if already authenticated
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Login | Krishna Musicals";

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      navigate(from, { replace: true });
    }
  }, [navigate, from]);

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

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid response received from server");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Route admins to /admin if they logged in here without a specific deep link
      if (user.role === "admin" && from === "/profile") {
        navigate("/admin", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (error) {
      console.error("Login failed:", error);
      const serverMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please verify your email and password.";
      setErrorMessage(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <h1>Welcome Back</h1>
        <p className="login-subtitle">
          Sign in to your Krishna Musicals account
        </p>

        {errorMessage && (
          <div className="login-error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="user-email">Email Address</label>
            <input
              id="user-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="user-password">Password</label>
            <input
              id="user-password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
