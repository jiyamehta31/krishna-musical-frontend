import { useState, useEffect, useCallback, useRef } from "react";
import API from "../api/axios";
import { AuthContext } from "./authContextDef";

export default function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null,
  );

  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem("user");
    if (!cached || cached === "undefined") return null;
    try {
      return JSON.parse(cached);
    } catch (err) {
      console.error("Corrupted user session:", err);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return null;
    }
  });

  // Automatically false if no token, true only if a token needs async verification
  const [loading, setLoading] = useState(() =>
    Boolean(localStorage.getItem("token")),
  );
  const initialCheckDone = useRef(false);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setLoading(false);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete API.defaults.headers.common["Authorization"];
  }, []);

  const loginWithCredentials = useCallback((userData, authToken) => {
    setToken(authToken);
    setUser(userData);
    setLoading(false);
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    API.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
  }, []);

  useEffect(() => {
    if (initialCheckDone.current) return;
    initialCheckDone.current = true;

    const initialToken = localStorage.getItem("token");

    // No token exists -> loading is already false from initial state, simply exit
    if (!initialToken) {
      return;
    }

    API.defaults.headers.common["Authorization"] = `Bearer ${initialToken}`;

    const verifyUserSession = async () => {
      try {
        const { data } = await API.get("/auth/me");
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        } else {
          logout();
        }
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifyUserSession();
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        loginWithCredentials,
        logout,
      }}
    >
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            background: "var(--bg-primary, #111)",
            color: "var(--text-muted, #888)",
            fontFamily: "inherit",
          }}
        >
          <span>Initializing workshop session...</span>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
