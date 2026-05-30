import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/api";
import { FiPlus, FiTrash, FiCalendar, FiUser, FiInfo, FiLayers } from "react-icons/fi";

const CreateBill = () => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [clientId, setClientId] = useState("");
  const [issueDate, setIssueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => {
    const defaultDue = new Date();
    defaultDue.setDate(defaultDue.getDate() + 15);
    return defaultDue.toISOString().split("T")[0];
  });
  const [status, setStatus] = useState("pending");
  const [items, setItems] = useState([{ productId: "", quantity: 1, _price: 0, _unit: "pcs" }]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientsRes, productsRes] = await Promise.all([
          API.get("/clients"),
          API.get("/products"),
        ]);
        setClients(clientsRes.data.data);
        setProducts(productsRes.data.data);
      } catch (err) {
        setError("Failed to load clients and products lists for bill creation.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddItemRow = () => {
    setItems((prev) => [...prev, { productId: "", quantity: 1, _price: 0, _unit: "pcs" }]);
  };

  const handleRemoveItemRow = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;

        const updated = { ...item, [field]: value };

        // If product changes, automatically populate pricing and unit from database list
        if (field === "productId") {
          const productObj = products.find((p) => p._id === value);
          if (productObj) {
            updated._price = productObj.price;
            updated._unit = productObj.unit || "pcs";
          } else {
            updated._price = 0;
            updated._unit = "pcs";
          }
        }
        return updated;
      })
    );
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item._price) || 0;
      const qty = parseInt(item.quantity) || 0;
      return sum + price * qty;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!clientId) {
      setError("Please select a client.");
      return;
    }

    const filteredItems = items.filter((item) => item.productId !== "");
    if (filteredItems.length === 0) {
      setError("Please add at least one valid product line item.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const billData = {
        clientId,
        issueDate,
        dueDate,
        status,
        items: filteredItems.map((item) => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
        })),
      };

      const res = await API.post("/bills", billData);
      navigate(`/bills/${res.data.data.bill._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate bill invoice.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div className="loader"></div>
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Configuring secure invoice templates...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Invoice Builder</h1>
          <p style={styles.subtitle}>Draft new statements, map line structures, and select status parameters</p>
        </div>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {clients.length === 0 ? (
        <div className="glass-panel" style={styles.emptyState}>
          <FiUser size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
          <h3>No Clients Registered</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
            You must register a client before preparing any invoice.
          </p>
          <Link to="/clients" className="btn btn-primary" style={{ marginTop: "16px" }}>
            Create Client Profile
          </Link>
        </div>
      ) : products.length === 0 ? (
        <div className="glass-panel" style={styles.emptyState}>
          <FiLayers size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
          <h3>Product Catalog Empty</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
            Create products in the inventory registry before launching builders.
          </p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: "16px" }}>
            Build Catalog List
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={styles.formContainer}>
          {/* Form left */}
          <div className="glass-panel" style={styles.leftPanel}>
            <h2 style={styles.panelTitle}>Invoice Details</h2>

            <div className="form-group">
              <label htmlFor="clientId">Select Recipient Client *</label>
              <select
                id="clientId"
                className="form-input"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                required
              >
                <option value="">-- Choose Client --</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.email})
                  </option>
                ))}
              </select>
            </div>

            <div style={styles.twoColumn}>
              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="issueDate">Issue Date *</label>
                <input
                  type="date"
                  id="issueDate"
                  className="form-input"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ flex: 1 }}>
                <label htmlFor="dueDate">Due Date *</label>
                <input
                  type="date"
                  id="dueDate"
                  className="form-input"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="status">Initial Status</label>
              <select
                id="status"
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="draft">Draft</option>
              </select>
            </div>

            {/* Line Items builder */}
            <div style={{ marginTop: "30px" }}>
              <div style={styles.itemHeaderRow}>
                <h3 style={styles.panelTitle}>Billing Line Items</h3>
                <button type="button" className="btn btn-secondary" style={{ padding: "8px 16px" }} onClick={handleAddItemRow}>
                  <FiPlus size={14} /> Add Line
                </button>
              </div>

              <div style={styles.itemsList}>
                {items.map((item, idx) => (
                  <div key={idx} style={styles.itemRow}>
                    <div style={{ flex: 3 }}>
                      <label style={styles.itemRowLabel}>Product / Service</label>
                      <select
                        className="form-input"
                        value={item.productId}
                        onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                        required
                      >
                        <option value="">-- Pick Product --</option>
                        {products.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.name} ({formatCurrency(p.price)} / {p.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div style={{ flex: 1, minWidth: "70px" }}>
                      <label style={styles.itemRowLabel}>Quantity</label>
                      <input
                        type="number"
                        min="1"
                        className="form-input"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ flex: 1.2 }}>
                      <label style={styles.itemRowLabel}>Unit Price</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formatCurrency(item._price)}
                        disabled
                      />
                    </div>

                    <div style={{ flex: 1.2 }}>
                      <label style={styles.itemRowLabel}>Subtotal</label>
                      <input
                        type="text"
                        className="form-input"
                        style={{ color: "var(--accent-blue)", fontWeight: "600" }}
                        value={formatCurrency(item._price * item.quantity)}
                        disabled
                      />
                    </div>

                    <button
                      type="button"
                      style={styles.deleteRowBtn}
                      onClick={() => handleRemoveItemRow(idx)}
                      disabled={items.length === 1}
                      title="Remove Row"
                    >
                      <FiTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form right (Summary block) */}
          <div className="glass-panel" style={styles.rightPanel}>
            <h2 style={styles.panelTitle}>Invoice Summary</h2>

            <div style={styles.summaryList}>
              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Client Recipient</span>
                <span style={styles.summaryVal}>
                  {clientId ? clients.find((c) => c._id === clientId)?.name : "Not selected"}
                </span>
              </div>

              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Total Line Items</span>
                <span style={styles.summaryVal}>{items.filter((i) => i.productId).length}</span>
              </div>

              <div style={styles.summaryRow}>
                <span style={styles.summaryLabel}>Status Assignment</span>
                <span className={`status-badge ${status}`} style={{ fontSize: "0.8rem", padding: "4px 10px" }}>
                  {status}
                </span>
              </div>

              <div style={styles.divider}></div>

              <div style={{ ...styles.summaryRow, margin: "20px 0" }}>
                <span style={styles.totalLabel}>Total Due</span>
                <span style={styles.totalValue}>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>

            <div style={styles.summaryActions}>
              <button
                type="submit"
                className="btn btn-primary"
                style={styles.actionBtnFull}
                disabled={submitting}
              >
                {submitting ? "Signing Invoices..." : "⚡ Generate Statement"}
              </button>
              <Link to="/bills" className="btn btn-secondary" style={styles.actionBtnFull}>
                Cancel Builder
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

const styles = {
  header: {
    marginBottom: "35px",
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
  formContainer: {
    display: "flex",
    gap: "30px",
    alignItems: "flex-start",
  },
  leftPanel: {
    flex: 2,
    padding: "30px",
  },
  rightPanel: {
    flex: 1,
    padding: "30px",
    position: "sticky",
    top: "30px",
  },
  panelTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "20px",
  },
  twoColumn: {
    display: "flex",
    gap: "16px",
  },
  itemHeaderRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  itemsList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  itemRow: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-end",
    background: "rgba(255, 255, 255, 0.01)",
    border: "1px solid var(--glass-border)",
    padding: "16px",
    borderRadius: "var(--border-radius-md)",
  },
  itemRowLabel: {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: "600",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    marginBottom: "6px",
  },
  deleteRowBtn: {
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#f87171",
    cursor: "pointer",
    padding: "12px",
    borderRadius: "var(--border-radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "var(--transition-smooth)",
  },
  summaryList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    margin: "20px 0",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.95rem",
  },
  summaryLabel: {
    color: "var(--text-secondary)",
  },
  summaryVal: {
    color: "#ffffff",
    fontWeight: "600",
  },
  divider: {
    height: "1px",
    background: "var(--glass-border)",
    width: "100%",
  },
  totalLabel: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#ffffff",
  },
  totalValue: {
    fontSize: "1.4rem",
    fontWeight: "800",
    color: "var(--accent-emerald)",
  },
  actionBtnFull: {
    width: "100%",
  },
  summaryActions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
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
};

export default CreateBill;
