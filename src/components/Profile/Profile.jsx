import { useNavigate } from "react-router-dom";
import "./Profile.css";

const Profile = () => {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
    window.location.reload();
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <main className="profile-page">
      <div className="profile-card">
        <div className="profile-icon">👤</div>

        <h1>My Profile</h1>

        <div className="profile-info">
          <div>
            <span>Name</span>
            <p>{user.username}</p>
          </div>

          <div>
            <span>Email</span>
            <p>{user.email}</p>
          </div>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </main>
  );
};

export default Profile;
