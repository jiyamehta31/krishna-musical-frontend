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

  // Step management: "form" -> "otp"
  const [step, setStep] = useState("form");
  const [otp, setOtp] = useState("");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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

  // STEP 1: Submit Form & Trigger OTP Email
  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const username = formData.username.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

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

      if (response.data?.success) {
        setRegisteredEmail(email);
        setStep("otp");
        setSuccessMessage(
          "Verification code sent to your email. Check your inbox!",
        );
      } else {
        throw new Error(response.data?.message || "Registration failed.");
      }
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

  // STEP 2: Submit 6-digit OTP to Activate Account & Log In
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
          email: registeredEmail,
          otp: otp.trim(),
        },
      );

      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error(
          "Activation succeeded but no session token was received.",
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

  // Re-request OTP code
  const handleResendOtp = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/resend-otp`, {
        email: registeredEmail,
      });

      setSuccessMessage(
        response.data?.message || "A new 6-digit code was sent to your email.",
      );
    } catch (error) {
      console.error("Resend error:", error);
      setErrorMessage(
        error.response?.data?.message ||
          "Unable to resend OTP. Please try again later.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="signup-page">
      <div className="signup-container">
        <h1>{step === "form" ? "Create Account" : "Verify Email"}</h1>
        <p className="signup-subtitle">
          {step === "form"
            ? "Join the Krishna Musicals community"
            : `Enter the 6-digit code sent to ${registeredEmail}`}
        </p>

        {errorMessage && (
          <div className="signup-error-banner" role="alert">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="signup-success-banner" role="status">
            {successMessage}
          </div>
        )}

        {/* STEP 1: Registration Form */}
        {step === "form" && (
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
              {loading ? "Sending Code..." : "Create Account"}
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification Form */}
        {step === "otp" && (
          <form className="signup-form" onSubmit={handleVerifyOtp}>
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

            <button type="submit" className="signup-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify & Complete Signup"}
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
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </main>
  );
};

export default Signup;
