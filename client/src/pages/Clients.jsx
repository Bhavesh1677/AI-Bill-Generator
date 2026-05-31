import React, { useState, useEffect } from "react";
import API from "../utils/api";
import { FiPlus, FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin, FiX, FiUsers } from "react-icons/fi";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ name: "", businessName: "", email: "", phone: "", address: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await API.get("/clients");
      setClients(res.data.data);
    } catch (err) {
      setError("Failed to fetch clients list.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setFormData({ name: "", businessName: "", email: "", phone: "", address: "" });
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      businessName: client.businessName || "",
      email: client.email,
      phone: client.phone || "",
      address: client.address || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClient(null);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setFormError("Name is a required field.");
      return;
    }

    setFormError("");
    setSaving(true);

    try {
      if (editingClient) {
        // Edit Client
        const res = await API.patch(`/clients/${editingClient._id}`, formData);
        setClients((prev) =>
          prev.map((c) => (c._id === editingClient._id ? res.data.data : c))
        );
      } else {
        // Create Client
        const res = await API.post("/clients", formData);
        setClients((prev) => [res.data.data, ...prev]);
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save client details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this client? All bills associated with this client will remain but their client info might appear as deleted.")) {
      return;
    }

    try {
      await API.delete(`/clients/${clientId}`);
      setClients((prev) => prev.filter((c) => c._id !== clientId));
    } catch (err) {
      alert("Failed to delete client record.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div className="loader"></div>
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Fetching client registry...</p>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Client Directory</h1>
          <p style={styles.subtitle}>Register business accounts, coordinate addresses, and assign bill paths</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <FiPlus size={16} />
          <span>Add Client</span>
        </button>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {clients.length === 0 ? (
        <div className="glass-panel" style={styles.emptyState}>
          <FiUsers size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
          <h3>No Clients Found</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Click 'Add Client' to create your first business contact.</p>
          <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ marginTop: "16px" }}>
            Add Client
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {clients.map((client) => (
            <div key={client._id} className="glass-panel glass-panel-hover" style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.avatar}>
                  {(client.businessName || client.name).slice(0, 2).toUpperCase()}
                </div>
                <div style={styles.actions}>
                  <button style={styles.iconBtn} onClick={() => handleOpenEditModal(client)} title="Edit Client">
                    <FiEdit2 size={14} />
                  </button>
                  <button style={{ ...styles.iconBtn, color: "#f87171" }} onClick={() => handleDeleteClient(client._id)} title="Delete Client">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>

              <h3 style={styles.cardName}>{client.businessName || client.name}</h3>
              {client.businessName && (
                <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "-12px", marginBottom: "4px" }}>
                  Contact: {client.name}
                </p>
              )}

              <div style={styles.cardDetails}>
                {client.email && (
                  <div style={styles.detailRow}>
                    <FiMail size={14} style={styles.detailIcon} />
                    <span style={styles.detailText}>{client.email}</span>
                  </div>
                )}
                {client.phone && (
                  <div style={styles.detailRow}>
                    <FiPhone size={14} style={styles.detailIcon} />
                    <span style={styles.detailText}>{client.phone}</span>
                  </div>
                )}
                {client.address && (
                  <div style={styles.detailRow}>
                    <FiMapPin size={14} style={styles.detailIcon} />
                    <span style={styles.detailText}>{client.address}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

      {/* Modal Dialog */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel animate-fade-in" style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <h2>{editingClient ? "Edit Client" : "Add Client"}</h2>
              <button style={styles.modalCloseBtn} onClick={handleCloseModal}>
                <FiX size={20} />
              </button>
            </div>

            {formError && <div style={styles.errorAlert}>{formError}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="name">Client Contact Name *</label>
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  placeholder="e.g. Jane Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="businessName">Client Business Name</label>
                <input
                  type="text"
                  id="businessName"
                  className="form-input"
                  placeholder="e.g. Acme Corp"
                  value={formData.businessName}
                  onChange={handleInputChange}
                />
              </div>


              <div className="form-group">
                <label htmlFor="phone">Mobile Number</label>
                <input
                  type="text"
                  id="phone"
                  className="form-input"
                  placeholder="+91 98765 43210"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="address">Billing Address</label>
                <input
                  type="text"
                  id="address"
                  className="form-input"
                  placeholder="123 Financial Way, Suite 400"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Details"}
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
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "35px",
    gap: "16px",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "#ffffff",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
    marginTop: "4px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
    gap: "24px",
  },
  card: {
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "10px",
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.2)",
    color: "var(--accent-blue)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.95rem",
    fontWeight: "700",
  },
  actions: {
    display: "flex",
    gap: "8px",
  },
  iconBtn: {
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
  cardName: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "#ffffff",
  },
  cardDetails: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  detailRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.88rem",
    color: "var(--text-secondary)",
  },
  detailIcon: {
    color: "var(--text-muted)",
    flexShrink: 0,
  },
  detailText: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
  },
  centerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  errorAlert: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    color: "#f87171",
    padding: "12px 16px",
    borderRadius: "var(--border-radius-md)",
    fontSize: "0.9rem",
    fontWeight: "500",
    marginBottom: "24px",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(8, 12, 20, 0.8)",
    backdropFilter: "blur(8px)",
    zIndex: 200,
    padding: "40px 20px",
    overflowY: "auto",
  },
  modalContainer: {
    width: "100%",
    maxWidth: "480px",
    padding: "30px",
    position: "relative",
    margin: "0 auto",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "24px",
  },
  modalCloseBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-secondary)",
    cursor: "pointer",
    padding: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "30px",
  },
};

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    .glass-panel button:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #ffffff;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Clients;
