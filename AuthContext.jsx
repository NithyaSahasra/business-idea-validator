import React, { createContext, useContext, useState, useEffect } from "react";
import { api, setAccessToken, clearAccessToken } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMockMode, setIsMockMode] = useState(false);

  // Initial boot: check server health and attempt session restoration via refresh cookie
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check health endpoint for mock research indicator
        const health = await api.get("/api/health").catch(() => null);
        if (health && health.mock_research) {
          setIsMockMode(true);
        }

        // Attempt silent refresh using HttpOnly cookie
        const refreshData = await api.post("/api/auth/refresh", {});
        if (refreshData && refreshData.access_token) {
          setAccessToken(refreshData.access_token);
          setUser(refreshData.user);
        }
      } catch (err) {
        // User is not signed in or refresh token expired
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    const data = await api.post("/api/auth/login", { email, password });
    setAccessToken(data.access_token);
    setUser(data.user);
    return data.user;
  };

  const signup = async (formData) => {
    return await api.post("/api/auth/signup", formData);
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {});
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      clearAccessToken();
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      const freshUser = await api.get("/api/auth/me");
      setUser(freshUser);
      return freshUser;
    } catch (e) {
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isMockMode,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
