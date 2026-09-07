import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: "", // Can be email or username
    password: "",
  });

  // Step state: "login" -> "otp" (if unverified)
  const [step, setStep] = useState("login");
  const [otp, setOtp] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Login | Krishna Musicals";

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

  // STEP 1: Standard Login Attempt
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const identifier = formData.identifier.trim();
    const password = formData.password;

    if (!identifier || !password) {
      setErrorMessage("Please enter both your email/username and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        identifier,
        password,
      });

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error("Invalid response received from server.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/profile", { replace: true });
    } catch (error) {
      console.error("Login error:", error);

      const serverData = error.response?.data;

      // Handle unverified user state seamlessly
      if (error.response?.status === 403 && serverData?.isUnverified) {
        setUnverifiedEmail(serverData.email);
        setStep("otp");
        setSuccessMessage(
          "Your account is not verified yet. Enter the 6-digit code or request a new one.",
        );
        return;
      }

      setErrorMessage(
        serverData?.message ||
          error.message ||
          "Invalid credentials. Please verify your email and password.",
      );
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP if account was unverified
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (otp.trim().length !== 6) {
      setErrorMessage("Please enter the complete 6-digit code.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/verify-email`,
        {
          email: unverifiedEmail,
          otp: otp.trim(),
        },
      );

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error(
          "Verification succeeded, but no session token was received.",
        );
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/profile", { replace: true });
    } catch (error) {
      console.error("Verification error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Invalid or expired verification code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Re-request OTP if previous code expired
  const handleResendOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/resend-otp`, {
        email: unverifiedEmail,
      });

      setSuccessMessage(
        response.data?.message ||
          "A fresh 6-digit verification code has been dispatched to your email.",
      );
    } catch (error) {
      console.error("Resend error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to resend code. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-container">
        <h1>{step === "login" ? "Account Login" : "Verify Email"}</h1>
        <p className="login-subtitle">
          {step === "login"
            ? "Access your Krishna Musicals account"
            : `Enter the 6-digit code sent to ${unverifiedEmail}`}
        </p>

        {errorMessage && (
          <div className="login-error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="login-success-banner" role="status">
            {successMessage}
          </div>
        )}

        {/* STEP 1: Standard Login Form */}
        {step === "login" && (
          <form className="login-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="login-identifier">Email or Username *</label>
              <input
                id="login-identifier"
                type="text"
                name="identifier"
                autoComplete="username"
                placeholder="Enter email or username"
                value={formData.identifier}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password *</label>
              <input
                id="login-password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>
        )}

        {/* STEP 2: Unverified Account OTP Screen */}
        {step === "otp" && (
          <form className="login-form" onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label htmlFor="login-otp">6-Digit Verification Code *</label>
              <input
                id="login-otp"
                type="text"
                name="otp"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="e.g. 583920"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
                style={{
                  textAlign: "center",
                  letterSpacing: "6px",
                  fontSize: "20px",
                }}
                required
                autoFocus
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Sign In"}
            </button>

            <div
              className="otp-actions"
              style={{ marginTop: "14px", textAlign: "center" }}
            >
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading}
                style={{
                  background: "none",
                  border: "none",
                  color: "#c89d5c",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "14px",
                }}
              >
                Didn't receive code? Resend OTP
              </button>
            </div>
          </form>
        )}

        <p className="auth-switch">
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
