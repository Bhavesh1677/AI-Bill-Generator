import React, { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../utils/api";
import {
  FiHome,
  FiUsers,
  FiBox,
  FiFileText,
  FiLogOut,
  FiX,
  FiCamera,
  FiCheckCircle,
  FiAlertCircle,
  FiUploadCloud,
  FiTruck,
} from "react-icons/fi";

const Sidebar = () => {
  const { user, logout, setUser } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [businessName, setBusinessName] = useState(user?.businessName || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address, setAddress] = useState(user?.address || "");
  const [upiId, setUpiId] = useState(user?.upiId || "");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(user?.businessLogo || "");
  const [updating, setUpdating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setBusinessName(user.businessName || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
      setUpiId(user.upiId || "");
      setLogoPreview(user.businessLogo || "");
    }
  }, [user]);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleTriggerUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("businessName", businessName);
      formData.append("phone", phone);
      formData.append("address", address);
      formData.append("upiId", upiId);

      if (logoFile) {
        formData.append("businessLogo", logoFile);
      }

      const res = await API.patch("/users/profile", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(res.data.data);
      setSuccessMsg("Settings updated successfully!");
      setLogoFile(null);
      setTimeout(() => {
        setSuccessMsg("");
      }, 3000);
    } catch (error) {
      console.error("Profile update error:", error);
      setErrorMsg(error.response?.data?.message || "Failed to update profile settings.");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <aside style={styles.sidebar}>
        <div style={styles.logoContainer}>
          <img src="/logo.png" alt="Logo" style={styles.logoIcon} />
          <h2 style={styles.logoText}>IndoPOS</h2>
        </div>

        <nav style={styles.nav}>
          <NavLink
            to="/dashboard"
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
            <span>Customers (Khata)</span>
          </NavLink>

          <NavLink
            to="/products"
            style={({ isActive }) => (isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink)}
          >
            <FiBox size={18} />
            <span>Products</span>
          </NavLink>

          <NavLink
            to="/suppliers"
            style={({ isActive }) => (isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink)}
          >
            <FiTruck size={18} />
            <span>Suppliers</span>
          </NavLink>

          <NavLink
            to="/bills"
            style={({ isActive }) => (isActive ? { ...styles.navLink, ...styles.navLinkActive } : styles.navLink)}
          >
            <FiFileText size={18} />
            <span>POS Orders</span>
          </NavLink>
        </nav>

        {user && (
          <div
            onClick={() => setShowModal(true)}
            style={{ ...styles.userSection, cursor: "pointer" }}
            className="user-profile-widget"
            title="Business & Profile Settings"
          >
            <div style={styles.userAvatar}>
              {user.businessLogo ? (
                <img
                  src={user.businessLogo}
                  alt="Logo"
                  style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                user.name ? user.name.slice(0, 2).toUpperCase() : "US"
              )}
            </div>
            <div style={styles.userInfo}>
              <p style={styles.userName}>{user.name}</p>
              <p style={styles.userEmail}>{user.email}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              style={styles.logoutBtn}
              className="logout-btn-hover"
              title="Sign Out"
            >
              <FiLogOut size={18} />
            </button>
          </div>
        )}
      </aside>

      {/* Settings Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(12px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
          onClick={() => {
            if (!updating) setShowModal(false);
          }}
        >
          <div
            style={{
              background: "rgba(15, 22, 38, 0.95)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "20px",
              width: "90%",
              maxWidth: "600px",
              padding: "30px",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.6)",
              color: "#ffffff",
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <div>
                <h3 style={{ fontSize: "1.3rem", fontWeight: "700", margin: 0, color: "#ffffff" }}>
                  Business & Profile Settings
                </h3>
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "4px 0 0 0" }}>
                  Customize your personal profile and billing credentials
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                disabled={updating}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                className="modal-close-btn"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* Notifications */}
            {successMsg && (
              <div
                style={{
                  background: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#10b981",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "0.9rem",
                  marginBottom: "20px",
                }}
              >
                <FiCheckCircle size={18} />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  borderRadius: "8px",
                  padding: "12px",
                  color: "#ef4444",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "0.9rem",
                  marginBottom: "20px",
                }}
              >
                <FiAlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Logo Section */}
              <div style={{ textAlign: "center", marginBottom: "10px" }}>
                <div onClick={handleTriggerUpload} className="logo-upload-container">
                  {logoPreview ? (
                    <img
                      src={logoPreview}
                      alt="Logo Preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", color: "var(--text-secondary)" }}>
                      <FiUploadCloud size={24} />
                    </div>
                  )}
                  <div className="logo-upload-overlay">
                    <FiCamera size={18} />
                    <span>Upload Logo</span>
                  </div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleLogoChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "8px", marginBottom: 0 }}>
                  Click avatar to upload your business logo (.png, .jpg)
                </p>
              </div>

              {/* Input Fields */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="modal-label">Business Name</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="E.g. Acme Billing Ltd."
                    className="modal-input"
                    disabled={updating}
                  />
                </div>
                <div>
                  <label className="modal-label">Your Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="E.g. Bhavesh Pawar"
                    required
                    className="modal-input"
                    disabled={updating}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label className="modal-label">Mobile Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="E.g. 9876543210"
                    className="modal-input"
                    disabled={updating}
                  />
                </div>
                <div>
                  <label className="modal-label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E.g. user@example.com"
                    required
                    className="modal-input"
                    disabled={updating}
                  />
                </div>
              </div>

              <div>
                <label className="modal-label">UPI ID (For Invoice Payments)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="E.g. business@ybl"
                  className="modal-input"
                  disabled={updating}
                />
              </div>


              <div>
                <label className="modal-label">Business Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, State, ZIP..."
                  className="modal-input"
                  style={{ resize: "none", height: "70px" }}
                  disabled={updating}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={updating}
                  className="modal-btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" disabled={updating} className="modal-btn-primary">
                  {updating ? (
                    <>
                      <span className="spinner"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
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
    width: "38px",
    height: "38px",
    objectFit: "contain",
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
    transition: "var(--transition-smooth)",
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
    overflow: "hidden",
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
    .user-profile-widget {
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
    .user-profile-widget:hover {
      background: rgba(255, 255, 255, 0.07) !important;
      border-color: rgba(59, 130, 246, 0.3) !important;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.1) !important;
    }
    .modal-close-btn {
      transition: all 0.25s ease;
    }
    .modal-close-btn:hover {
      color: #ffffff !important;
      transform: rotate(90deg);
    }
    .logo-upload-container {
      position: relative;
      width: 100px;
      height: 100px;
      border-radius: 50%;
      cursor: pointer;
      overflow: hidden;
      border: 2px dashed rgba(255, 255, 255, 0.2);
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justifyContent: center;
      background: rgba(255, 255, 255, 0.02);
      margin: 0 auto;
    }
    .logo-upload-container:hover {
      border-color: var(--accent-blue);
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.25);
    }
    .logo-upload-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      flex-direction: column;
      align-items: center;
      justifyContent: center;
      opacity: 0;
      transition: opacity 0.2s ease;
      color: #ffffff;
      font-size: 0.75rem;
      gap: 4px;
    }
    .logo-upload-container:hover .logo-upload-overlay {
      opacity: 1;
    }
    .modal-input {
      width: 100%;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 10px 14px;
      color: #ffffff;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      outline: none;
      box-sizing: border-box;
    }
    .modal-input:focus {
      border-color: var(--accent-blue);
      background: rgba(255, 255, 255, 0.05);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }
    .modal-input:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .modal-label {
      display: block;
      font-size: 0.85rem;
      color: var(--text-secondary);
      font-weight: 500;
      margin-bottom: 6px;
    }
    .modal-btn-primary {
      background: var(--accent-blue);
      color: #ffffff;
      border: none;
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      justifyContent: center;
      gap: 8px;
    }
    .modal-btn-primary:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);
    }
    .modal-btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .modal-btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      color: var(--text-secondary);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 10px 20px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .modal-btn-secondary:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }
    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: #ffffff;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Sidebar;
