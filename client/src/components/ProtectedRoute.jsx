import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.loaderSpinner}></div>
        <p style={styles.loaderText}>Restoring Secure Session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};

const styles = {
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#080c14",
    color: "#f8fafc",
    fontFamily: "'Outfit', sans-serif",
  },
  loaderSpinner: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    border: "3px solid rgba(59, 130, 246, 0.1)",
    borderTopColor: "#3b82f6",
    animation: "spin 1s linear infinite",
    marginBottom: "16px",
  },
  loaderText: {
    fontSize: "1.1rem",
    fontWeight: "500",
    color: "#94a3b8",
  },
};

// Insert animation keyframes globally into document header
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default ProtectedRoute;
