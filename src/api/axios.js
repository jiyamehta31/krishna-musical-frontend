import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://krishna-musical-backend-1.onrender.com/api",
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Guard flag to prevent multi-triggering 401 redirects
let isRedirecting = false;

API.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const currentPath = window.location.pathname;

        // Only handle 401 if we aren't already on the login/auth pages
        if (status === 401 && !currentPath.includes("/login") && !currentPath.includes("/signup")) {
            if (!isRedirecting) {
                isRedirecting = true;
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                // Single clean redirect
                window.location.href = "/login?expired=true";
            }
        }
        return Promise.reject(error);
    }
);

export default API;