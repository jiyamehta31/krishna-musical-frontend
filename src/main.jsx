import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import App from "./App.jsx";
import "./styles/variables.css"
;
import "./styles/global.css"
;

axios.defaults.baseURL =
  import.meta.env.VITE_API_URL ||
  "https://krishna-musical-backend-1.onrender.com/api";

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

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
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
