// src/components/Auth/Signup.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/authContextDef";
import "./Login.css";

export default function Signup() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    loading: authLoading,
    user,
    loginWithCredentials,
  } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [step, setStep] = useState("signup"); // 'signup' | 'otp'
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Create Account | Krishna Musicals";

    if (!authLoading && isAuthenticated) {
      if (user?.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/profile", { replace: true });
      }
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const username = formData.username.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (!username || !email || !password) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // Corrected from /auth/register to /auth/signup
      const response = await API.post("/auth/signup", {
        username,
        email,
        password,
      });

      // If backend issues a session immediately
      if (response.data?.token && response.data?.user) {
        loginWithCredentials(response.data.user, response.data.token);
        navigate("/profile", { replace: true });
        return;
      }

      // If OTP email verification is enforced
      setStep("otp");
      setSuccessMessage(
        response.data?.message ||
          `Verification code sent to ${email}. Please check your inbox.`,
      );
    } catch (error) {
      const serverMsg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Registration failed. Please verify your details.";
      setErrorMessage(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (otp.trim().length !== 6) {
      setErrorMessage("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);

    try {
      const response = await API.post("/auth/verify-email", {
        email: formData.email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      const { token, user: verifiedUser } = response.data;

      if (!token || !verifiedUser) {
        throw new Error(
          "Verification completed, but no session token was received.",
        );
      }

      loginWithCredentials(verifiedUser, token);

      if (verifiedUser.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/profile", { replace: true });
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Invalid or expired verification code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await API.post("/auth/resend-otp", {
        email: formData.email.trim().toLowerCase(),
      });

      setSuccessMessage(
        response.data?.message ||
          "A fresh 6-digit verification code has been dispatched to your email.",
      );
    } catch (error) {
      setErrorMessage(
        error.response?.data?.message ||
          "Failed to resend code. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return null;
  }

  return (
    <main className="login-page">
      <div className="login-container">
        <h1>{step === "signup" ? "Create Account" : "Verify Email"}</h1>
        <p className="login-subtitle">
          {step === "signup"
            ? "Join Krishna Musicals for custom orders & workshop updates"
            : `Enter the 6-digit code sent to ${formData.email}`}
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

        {step === "signup" && (
          <form className="login-form" onSubmit={handleSignup}>
            <div className="form-group">
              <label htmlFor="signup-username">Full Name / Username *</label>
              <input
                id="signup-username"
                type="text"
                name="username"
                autoComplete="name"
                placeholder="e.g. Ramesh Sharma"
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
                placeholder="you@example.com"
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
                placeholder="Create a strong password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form className="login-form" onSubmit={handleVerifyOtp}>
            <div className="form-group">
              <label htmlFor="signup-otp">6-Digit Verification Code *</label>
              <input
                id="signup-otp"
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
              {loading ? "Verifying..." : "Verify & Complete"}
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
                  color: "var(--gold-primary, #c89d5c)",
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
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
