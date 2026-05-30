import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiHome, FiUsers, FiBox, FiFileText, FiLogOut } from "react-icons/fi";

const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>⚡</div>
        <h2 style={styles.logoText}>Antigravity Bill</h2>
      </div>

      <nav style={styles.nav}>
        <NavLink
          to="/"
          style={({ isActive }) => (isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink)}
        >
          <FiHome size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/clients"
          style={({ isActive }) => (isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink)}
        >
          <FiUsers size={18} />
          <span>Clients</span>
        </NavLink>

        <NavLink
          to="/products"
          style={({ isActive }) => (isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink)}
        >
          <FiBox size={18} />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/bills"
          style={({ isActive }) => (isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink)}
        >
          <FiFileText size={18} />
          <span>Bills</span>
        </NavLink>
      </nav>

      {user && (
        <div style={styles.userSection}>
          <div style={styles.userAvatar}>
            {user.name ? user.name.slice(0, 2).toUpperCase() : "US"}
          </div>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user.name}</p>
            <p style={styles.userEmail}>{user.email}</p>
          </div>
          <button onClick={logout} style={styles.logoutBtn} title="Sign Out">
            <FiLogOut size={18} />
          </button>
        </div>
      )}
    </aside>
  );
};

const styles = {
  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: "var(--sidebar-width)",
    background: "rgba(15, 21, 36, 0.8)",
    backdropFilter: "blur(20px)",
    borderRight: "1px solid var(--glass-border)",
    display: "flex",
    flexDirection: "column",
    padding: "30px 20px",
    zIndex: 100,
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "40px",
    padding: "0 8px",
  },
  logoIcon: {
    fontSize: "1.5rem",
    background: "rgba(59, 130, 246, 0.15)",
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    color: "var(--accent-blue)",
    boxShadow: "0 0 10px rgba(59, 130, 246, 0.2)",
  },
  logoText: {
    fontSize: "1.2rem",
    fontWeight: "800",
    letterSpacing: "0.5px",
    background: "linear-gradient(135deg, #ffffff 30%, var(--text-secondary) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  navLink: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "12px 16px",
    borderRadius: "var(--border-radius-md)",
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontWeight: "500",
    fontSize: "0.95rem",
    transition: "var(--transition-smooth)",
    border: "1px solid transparent",
  },
  navLinkActive: {
    color: "#ffffff",
    background: "rgba(59, 130, 246, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    boxShadow: "0 4px 20px rgba(59, 130, 246, 0.08)",
  },
  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 12px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid var(--glass-border)",
    borderRadius: "var(--border-radius-lg)",
    marginTop: "auto",
  },
  userAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, var(--accent-blue) 0%, #1e40af 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    fontWeight: "700",
    color: "#ffffff",
    boxShadow: "0 2px 8px rgba(59, 130, 246, 0.2)",
  },
  userInfo: {
    flex: 1,
    minWidth: 0,
  },
  userName: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#ffffff",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  userEmail: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  logoutBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-muted)",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "6px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "var(--transition-smooth)",
  },
};

// Global styles for active hover elements
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    aside nav a:hover {
      color: #ffffff !important;
      background: rgba(255, 255, 255, 0.04);
      transform: translateX(4px);
    }
    .logout-btn-hover:hover {
      color: var(--accent-coral) !important;
      background: rgba(239, 68, 68, 0.1) !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Sidebar;
