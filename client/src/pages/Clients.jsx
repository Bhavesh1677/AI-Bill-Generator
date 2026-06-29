import React, { useState, useEffect } from "react";
import API from "../utils/api";
import { FiPlus, FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin, FiX, FiUsers, FiCreditCard, FiDollarSign } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", address: "", creditLimit: "5000" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Khata ledger payment modal
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [activePaymentClient, setActivePaymentClient] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [paymentSaving, setPaymentSaving] = useState(false);

  // History modal
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyClient, setHistoryClient] = useState(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await API.get("/clients");
      setClients(res.data.data);
    } catch (err) {
      setError("Failed to fetch customer list.");
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
    setFormData({ name: "", email: "", phone: "", address: "", creditLimit: "5000" });
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEditModal = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      address: client.address || "",
      creditLimit: client.creditLimit !== undefined ? client.creditLimit.toString() : "5000",
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

    if (isNaN(formData.creditLimit) || parseFloat(formData.creditLimit) < 0) {
      setFormError("Credit limit must be a positive number.");
      return;
    }

    setFormError("");
    setSaving(true);

    try {
      const parsedData = {
        ...formData,
        creditLimit: parseFloat(formData.creditLimit)
      };

      if (editingClient) {
        // Edit Client
        const res = await API.patch(`/clients/${editingClient._id}`, parsedData);
        setClients((prev) =>
          prev.map((c) => (c._id === editingClient._id ? res.data.data : c))
        );
      } else {
        // Create Client
        const res = await API.post("/clients", parsedData);
        setClients((prev) => [res.data.data, ...prev]);
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save customer details.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenPaymentModal = (client) => {
    setActivePaymentClient(client);
    setPaymentAmount("");
    setPaymentError("");
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
      setPaymentError("Please enter a valid positive payment amount.");
      return;
    }

    setPaymentSaving(true);
    setPaymentError("");

    try {
      const res = await API.post(`/clients/khata-payment/${activePaymentClient._id}`, {
        amount: parseFloat(paymentAmount),
        note: "Store Credit Ledger Repayment"
      });

      // Update client state
      setClients((prev) =>
        prev.map((c) => (c._id === activePaymentClient._id ? res.data.data : c))
      );
      setShowPaymentModal(false);
      setActivePaymentClient(null);
    } catch (err) {
      setPaymentError(err.response?.data?.message || "Failed to log Khata repayment.");
    } finally {
      setPaymentSaving(false);
    }
  };

  const handleOpenHistoryModal = (client) => {
    setHistoryClient(client);
    setShowHistoryModal(true);
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm("Are you sure you want to delete this customer? All historical records will remain, but this customer profile will be deactivated.")) {
      return;
    }

    try {
      await API.delete(`/clients/${clientId}`);
      setClients((prev) => prev.filter((c) => c._id !== clientId));
    } catch (err) {
      alert("Failed to delete customer record.");
      console.error(err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div className="loader"></div>
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Fetching customer registry...</p>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in">
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Customer Ledger (Khata)</h1>
            <p style={styles.subtitle}>Manage customer credits, record cash repayments, and monitor account status</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <FiPlus size={16} />
            <span>Add Customer</span>
          </button>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        {clients.length === 0 ? (
          <div className="glass-panel" style={styles.emptyState}>
            <FiUsers size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <h3>No Customers Registered</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Click 'Add Customer' to create your first contact.</p>
            <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ marginTop: "16px" }}>
              Add Customer
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {clients.map((client) => {
              const creditUsage = (client.outstandingBalance || 0) / (client.creditLimit || 5000);
              const progressPercentage = Math.min(100, Math.max(0, creditUsage * 100));

              return (
                <div key={client._id} className="glass-panel glass-panel-hover" style={styles.card}>
                  <div style={styles.cardHeader}>
                    <div style={styles.avatar}>
                      {client.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div style={styles.actions}>
                      <button style={styles.iconBtn} onClick={() => handleOpenEditModal(client)} title="Edit Customer">
                        <FiEdit2 size={14} />
                      </button>
                      <button style={{ ...styles.iconBtn, color: "#f87171" }} onClick={() => handleDeleteClient(client._id)} title="Delete Customer">
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <h3 style={styles.cardName}>{client.name}</h3>

                  <div style={styles.ledgerInfo}>
                    <div style={styles.ledgerRow}>
                      <span style={{ color: "var(--text-secondary)" }}>Outstanding Balance:</span>
                      <span style={{ fontWeight: "700", color: (client.outstandingBalance || 0) > 0 ? "#f87171" : "var(--accent-emerald)" }}>
                        {formatCurrency(client.outstandingBalance || 0)}
                      </span>
                    </div>

                    <div style={styles.ledgerRow}>
                      <span style={{ color: "var(--text-secondary)" }}>Credit Limit:</span>
                      <span style={{ color: "#ffffff" }}>{formatCurrency(client.creditLimit || 5000)}</span>
                    </div>

                    {/* Progress bar */}
                    <div style={styles.progressContainer}>
                      <div style={{ ...styles.progressBar, width: `${progressPercentage}%`, background: progressPercentage > 85 ? "#f87171" : "var(--accent-blue)" }} />
                    </div>
                  </div>

                  <div style={styles.cardDetails}>
                    {client.email && (
                      <div style={styles.detailRow}>
                        <FiMail size={13} style={styles.detailIcon} />
                        <span style={styles.detailText}>{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div style={styles.detailRow}>
                        <FiPhone size={13} style={styles.detailIcon} />
                        <span style={styles.detailText}>{client.phone}</span>
                      </div>
                    )}
                    {client.address && (
                      <div style={styles.detailRow}>
                        <FiMapPin size={13} style={styles.detailIcon} />
                        <span style={styles.detailText}>{client.address}</span>
                      </div>
                    )}
                  </div>

                  <div style={styles.cardActionsRow}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "8px 12px", fontSize: "0.8rem", flex: 1 }}
                      onClick={() => handleOpenHistoryModal(client)}
                    >
                      Ledger History
                    </button>
                    <button
                      className="btn btn-primary"
                      style={{ padding: "8px 12px", fontSize: "0.8rem", flex: 1 }}
                      onClick={() => handleOpenPaymentModal(client)}
                    >
                      Log Payment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Profile Add/Edit Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel animate-fade-in" style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <h2>{editingClient ? "Edit Customer" : "Add Customer"}</h2>
              <button style={styles.modalCloseBtn} onClick={handleCloseModal}>
                <FiX size={20} />
              </button>
            </div>

            {formError && <div style={styles.errorAlert}>{formError}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="name">Customer Full Name *</label>
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="e.g. john@example.com"
                  value={formData.email}
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
                <label htmlFor="address">Address</label>
                <input
                  type="text"
                  id="address"
                  className="form-input"
                  placeholder="Street address, City"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="creditLimit">Khata Credit Limit (INR)</label>
                <input
                  type="number"
                  id="creditLimit"
                  className="form-input"
                  placeholder="5000"
                  value={formData.creditLimit}
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

      {/* Ledger Log Payment Modal */}
      {showPaymentModal && activePaymentClient && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel animate-fade-in" style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <h2>Log Khata Payment</h2>
              <button style={styles.modalCloseBtn} onClick={() => { setShowPaymentModal(false); setActivePaymentClient(null); }}>
                <FiX size={20} />
              </button>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Record a payment received from <strong>{activePaymentClient.name}</strong> to reduce their outstanding debt.
            </p>

            {paymentError && <div style={styles.errorAlert}>{paymentError}</div>}

            <form onSubmit={handlePaymentSubmit}>
              <div className="form-group">
                <label htmlFor="paymentAmount">Amount Paid (INR) *</label>
                <div style={styles.inputWithPrefix}>
                  <FaRupeeSign size={12} style={styles.prefixIcon} />
                  <input
                    type="number"
                    id="paymentAmount"
                    step="0.01"
                    className="form-input"
                    style={{ paddingLeft: "32px" }}
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowPaymentModal(false); setActivePaymentClient(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={paymentSaving}>
                  {paymentSaving ? "Recording..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ledger History Modal */}
      {showHistoryModal && historyClient && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel animate-fade-in" style={{ ...styles.modalContainer, maxWidth: "600px" }}>
            <div style={styles.modalHeader}>
              <div>
                <h2 style={{ margin: 0 }}>Ledger Ledger History</h2>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "2px" }}>
                  Outstanding Balance: {formatCurrency(historyClient.outstandingBalance || 0)}
                </p>
              </div>
              <button style={styles.modalCloseBtn} onClick={() => { setShowHistoryModal(false); setHistoryClient(null); }}>
                <FiX size={20} />
              </button>
            </div>

            <div style={styles.historyList}>
              {(!historyClient.khataHistory || historyClient.khataHistory.length === 0) ? (
                <p style={{ textAlign: "center", color: "var(--text-muted)", padding: "20px" }}>No transactions logged on this ledger.</p>
              ) : (
                <table style={styles.historyTable}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Date</th>
                      <th style={styles.th}>Type</th>
                      <th style={styles.th}>Amount</th>
                      <th style={styles.th}>Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyClient.khataHistory.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={styles.td}>{new Date(item.date).toLocaleDateString()}</td>
                        <td style={styles.td}>
                          <span
                            style={{
                              color: item.type === "purchase" ? "#f87171" : "var(--accent-emerald)",
                              fontWeight: "600",
                              fontSize: "0.8rem",
                              textTransform: "uppercase",
                            }}
                          >
                            {item.type}
                          </span>
                        </td>
                        <td style={styles.td}>{formatCurrency(item.amount)}</td>
                        <td style={styles.td}>{item.note || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div style={{ ...styles.modalActions, marginTop: "20px" }}>
              <button className="btn btn-secondary" onClick={() => { setShowHistoryModal(false); setHistoryClient(null); }}>
                Close
              </button>
            </div>
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
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
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
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0",
  },
  ledgerInfo: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid var(--glass-border)",
    borderRadius: "var(--border-radius-md)",
    padding: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  ledgerRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.88rem",
  },
  progressContainer: {
    width: "100%",
    height: "6px",
    borderRadius: "3px",
    background: "rgba(255,255,255,0.05)",
    overflow: "hidden",
    marginTop: "4px",
  },
  progressBar: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.3s ease",
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
  cardActionsRow: {
    display: "flex",
    gap: "10px",
    marginTop: "8px",
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
  inputWithPrefix: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  prefixIcon: {
    position: "absolute",
    left: "14px",
    color: "var(--text-muted)",
  },
  modalActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "12px",
    marginTop: "30px",
  },
  historyList: {
    maxHeight: "350px",
    overflowY: "auto",
    marginTop: "16px",
  },
  historyTable: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    padding: "10px",
    borderBottom: "1px solid var(--glass-border)",
  },
  td: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    padding: "12px 10px",
  },
};

export default Clients;
