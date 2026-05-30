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
      if (storedToken) {
        try {
          // Fetch current user details using access token
          const res = await API.get("/users/me");
          setUser(res.data.data);
        } catch (error) {
          console.log("Failed to fetch user with stored access token, trying silent refresh...");
          // Try silent refresh using refresh token in HTTPOnly cookies
          try {
            const refreshRes = await API.post("/users/refresh-token");
            const { accessToken, user: loggedUser } = refreshRes.data.data;
            localStorage.setItem("accessToken", accessToken);
            setUser(loggedUser);
          } catch (refreshErr) {
            console.log("Silent refresh failed as well. Cleaning credentials.");
            localStorage.removeItem("accessToken");
          }
        }
      } else {
        // No token stored, try silent refresh anyway (cookies might still exist)
        try {
          const refreshRes = await API.post("/users/refresh-token");
          const { accessToken, user: loggedUser } = refreshRes.data.data;
          localStorage.setItem("accessToken", accessToken);
          setUser(loggedUser);
        } catch (refreshErr) {
          // Silent refresh failed, stay logged out
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
      const { accessToken, user: loggedUser } = res.data.data;
      localStorage.setItem("accessToken", accessToken);
      setUser(loggedUser);
      return { success: true };
    } catch (error) {
      setUser(null);
      localStorage.removeItem("accessToken");
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
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
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
