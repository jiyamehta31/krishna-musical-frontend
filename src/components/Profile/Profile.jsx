import { useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../context/authContextDef";
import "./Profile.css";

const Profile = () => {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (user?.username) {
      document.title = `${user.username}'s Profile | Krishna Musicals`;
    } else {
      document.title = "User Profile | Krishna Musicals";
    }
  }, [user]);

  // 1. Wait for AuthProvider to finish its check - prevents early redirect flash
  if (loading) {
    return null;
  }

  // 2. If unauthenticated after check, do a single clean redirect
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

 const handleLogout = () => {
   logout();
   window.location.replace("/login");
 };

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
