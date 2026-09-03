import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import App from "./App.jsx";
import "./styles/variables.css";
import "./styles/global.css";

// 1. Global Base URL configuration
axios.defaults.baseURL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com";

// 2. Global Request Interceptor: automatically attaches Bearer token if present
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// 3. Global Response Interceptor: handles 401 Unauthorized (expired sessions)
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if attempting to access protected admin resources
      if (
        window.location.pathname.startsWith("/admin") &&
        window.location.pathname !== "/admin/login"
      ) {
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Target container '#root' was not found in index.html.");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
