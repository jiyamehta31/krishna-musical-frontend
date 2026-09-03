import { useEffect, useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  // Safely parse user from localStorage
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser || storedUser === "undefined") return null;
    try {
      return JSON.parse(storedUser);
    } catch (err) {
      console.error("Corrupted user session:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user?.username) {
      document.title = `${user.username}'s Profile | Krishna Musicals`;
    } else {
      document.title = "User Profile | Krishna Musicals";
    }
  }, [user]);

  // Declarative, pure redirect during render phase
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    // Clean client-side transition to login
    navigate("/login", { replace: true });
  };

  const isAdmin = user.role === "admin";

  return (
    <main className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar-badge">
          <span className="profile-avatar-text">
            {user.username ? user.username.charAt(0).toUpperCase() : "U"}
          </span>
        </div>

        <h1>My Account</h1>
        <p className="profile-subtitle">
          Manage your Krishna Musicals customer credentials
        </p>

        <div className="profile-details-list">
          <div className="profile-detail-item">
            <span className="detail-label">Full Name</span>
            <p className="detail-value">{user.username}</p>
          </div>

          <div className="profile-detail-item">
            <span className="detail-label">Email Address</span>
            <p className="detail-value">{user.email}</p>
          </div>

          <div className="profile-detail-item">
            <span className="detail-label">Account Type</span>
            <span
              className={`role-badge ${isAdmin ? "role-admin" : "role-customer"}`}
            >
              {isAdmin ? "Administrator" : "Customer"}
            </span>
          </div>
        </div>

        {/* Quick link for administrators */}
        {isAdmin && (
          <div className="profile-admin-cta">
            <Link to="/admin" className="admin-portal-link">
              Go to Admin Dashboard →
            </Link>
          </div>
        )}

        <div className="profile-actions">
          <Link to="/products" className="continue-shopping-btn">
            Browse Instruments
          </Link>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </div>
      </div>
    </main>
  );
};

export default Profile;
