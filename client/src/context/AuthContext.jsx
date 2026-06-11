import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../utils/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (storedToken) {
        try {
          // Fetch current user details using access token
          const res = await API.get("/users/me");
          setUser(res.data.data);
        } catch (error) {
          console.log("Failed to fetch user with stored access token, trying silent refresh...");
          // Try silent refresh using refresh token in localStorage/cookies
          if (refreshToken) {
            try {
              const refreshRes = await API.post("/users/refresh-token", { refreshToken });
              const { accessToken, refreshToken: newRefreshToken } = refreshRes.data.data;
              localStorage.setItem("accessToken", accessToken);
              if (newRefreshToken) {
                localStorage.setItem("refreshToken", newRefreshToken);
              }
              // Fetch user details with the new token
              const userRes = await API.get("/users/me");
              setUser(userRes.data.data);
            } catch (refreshErr) {
              console.log("Silent refresh failed as well. Cleaning credentials.");
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
            }
          } else {
            console.log("No refresh token available. Cleaning credentials.");
            localStorage.removeItem("accessToken");
          }
        }
      } else if (refreshToken) {
        // No access token stored but refresh token exists, try silent refresh
        try {
          const refreshRes = await API.post("/users/refresh-token", { refreshToken });
          const { accessToken, refreshToken: newRefreshToken } = refreshRes.data.data;
          localStorage.setItem("accessToken", accessToken);
          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
          }
          // Fetch user details with the new token
          const userRes = await API.get("/users/me");
          setUser(userRes.data.data);
        } catch (refreshErr) {
          console.log("Silent refresh failed. Cleaning credentials.");
          localStorage.removeItem("refreshToken");
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await API.post("/users/login", { email, password });
      const { accessToken, refreshToken, user: loggedUser } = res.data.data;
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      setUser(loggedUser);
      return { success: true };
    } catch (error) {
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      return {
        success: false,
        message: error.response?.data?.message || "Login failed, please check your credentials.",
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      await API.post("/users/register", { name, email, password });
      // Automatically log in after registration
      return await login(email, password);
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed. Try again.",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await API.post("/users/logout");
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
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
