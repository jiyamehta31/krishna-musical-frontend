import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css"

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "https://krishna-musical-backend-1.onrender.com/api/auth/login",
        {
          email,
          password,
        },
      );

      const { token, user } = response.data;

      if (user.role !== "admin") {
        alert("You are not authorized to access the admin dashboard.");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/admin");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    }
  };

  return (
    <main className="admin-login">
      <div className="login-container">
        <h1>Admin Login</h1>

        <form onSubmit={handleLogin} className="admin-login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </main>
  );
};

export default AdminLogin;
