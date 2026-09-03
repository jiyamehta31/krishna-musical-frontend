import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Create Account | Krishna Musicals";

    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      navigate("/profile", { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const username = formData.username.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    // Client-side schema alignment
    if (username.length < 3) {
      setErrorMessage("Username must be at least 3 characters long.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/signup`, {
        username,
        email,
        password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid response structure from server.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/profile", { replace: true });
    } catch (error) {
      console.error("Signup error:", error);
      const serverMsg =
        error.response?.data?.message ||
        error.message ||
        "Registration failed. Please check your details or try a different email.";
      setErrorMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">
      <div className="signup-container">
        <h1>Create Account</h1>
        <p className="signup-subtitle">Join the Krishna Musicals community</p>

        {errorMessage && (
          <div className="signup-error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        <form className="signup-form" onSubmit={handleSignup}>
          <div className="form-group">
            <label htmlFor="signup-username">Full Name or Username *</label>
            <input
              id="signup-username"
              type="text"
              name="username"
              autoComplete="username"
              placeholder="e.g. Rahul Sharma"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-email">Email Address *</label>
            <input
              id="signup-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="name@example.com"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="signup-password">
              Password (min. 6 characters) *
            </label>
            <input
              id="signup-password"
              type="password"
              name="password"
              autoComplete="new-password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
};

export default Signup;
