import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/axios";
import { useAuth } from "../../context/authContextDef";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    loading: authLoading,
    user,
    loginWithCredentials,
  } = useAuth();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [step, setStep] = useState("login");
  const [otp, setOtp] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("expired") === "true"
      ? "Your session has expired. Please sign in again."
      : "";
  });
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = "Login | Krishna Musicals";

    // ONLY redirect if initial session loading is completely finished
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
      const response = await API.post("/auth/login", {
        identifier,
        password,
      });

      const { token, user: loggedInUser } = response.data;

      if (!token || !loggedInUser) {
        throw new Error("Invalid response received from server.");
      }

      loginWithCredentials(loggedInUser, token);

      if (loggedInUser.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/profile", { replace: true });
      }
    } catch (error) {
      const serverData = error.response?.data;

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
      const response = await API.post("/auth/verify-email", {
        email: unverifiedEmail,
        otp: otp.trim(),
      });

      const { token, user: verifiedUser } = response.data;

      if (!token || !verifiedUser) {
        throw new Error(
          "Verification succeeded, but no session token was received.",
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
        email: unverifiedEmail,
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

  // Prevent any DOM flicker while AuthContext is verifying stored tokens
  if (authLoading) {
    return null;
  }

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
          Don't have an account? <Link to="/signup">Create one</Link>
        </p>
      </div>
    </main>
  );
}
