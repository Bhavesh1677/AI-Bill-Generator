import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import { FiPlus, FiEye, FiSearch, FiSliders, FiFileText } from "react-icons/fi";

const Bills = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchBills = async () => {
    try {
      setLoading(true);
      const res = await API.get("/bills");
      setBills(res.data.data);
    } catch (err) {
      setError("Failed to fetch invoice history list.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "paid";
      case "pending":
        return "pending";
      case "draft":
        return "draft";
      default:
        return "unpaid";
    }
  };

  // Perform client side search & status filtering
  const filteredBills = bills.filter((bill) => {
    const matchesSearch =
      bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bill.clientId?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (bill.clientId?.email || "").toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || bill.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div className="loader"></div>
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Populating billing databases...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Invoice Registry</h1>
          <p style={styles.subtitle}>Audit outstanding logs, filter statuses, and launch bill configurations</p>
        </div>
        <Link to="/bills/create" className="btn btn-primary">
          <FiPlus size={16} />
          <span>New Invoice</span>
        </Link>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {/* Filter Options Panel */}
      <div className="glass-panel" style={styles.filterPanel}>
        <div style={styles.searchBox}>
          <FiSearch size={18} style={styles.searchIcon} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: "42px" }}
            placeholder="Search by Bill ID, Client name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={styles.filterOptions}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            <FiSliders size={14} />
            <span>Status:</span>
          </div>

          <div style={styles.tabs}>
            {["all", "pending", "paid", "unpaid", "draft"].map((tab) => (
              <button
                key={tab}
                style={{
                  ...styles.tabBtn,
                  ...(statusFilter === tab ? styles.tabBtnActive : {}),
                }}
                onClick={() => setStatusFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredBills.length === 0 ? (
        <div className="glass-panel" style={styles.emptyState}>
          <FiFileText size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
          <h3>No Invoices Found</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
            {bills.length === 0 ? "You haven't created any bills yet." : "No bills match the active filters."}
          </p>
          {bills.length === 0 && (
            <Link to="/bills/create" className="btn btn-primary" style={{ marginTop: "16px" }}>
              Launch Builder
            </Link>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: "0 20px" }}>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Bill Number</th>
                  <th style={styles.th}>Client</th>
                  <th style={styles.th}>Issue Date</th>
                  <th style={styles.th}>Due Date</th>
                  <th style={styles.th}>Total Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={{ ...styles.th, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.map((bill) => (
                  <tr key={bill._id} className="table-row-hover" style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: "600", color: "#ffffff" }}>{bill.billNumber}</td>
                    <td style={styles.td}>
                      <div>
                        <p style={{ fontWeight: "600", color: "#ffffff" }}>{bill.clientId?.name || "Deleted Client"}</p>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{bill.clientId?.email}</p>
                      </div>
                    </td>
                    <td style={styles.td}>{new Date(bill.issueDate).toLocaleDateString()}</td>
                    <td style={styles.td}>{new Date(bill.dueDate).toLocaleDateString()}</td>
                    <td style={{ ...styles.td, fontWeight: "700", color: "var(--accent-blue)" }}>
                      {formatCurrency(bill.total)}
                    </td>
                    <td style={styles.td}>
                      <span className={`status-badge ${getStatusBadge(bill.status)}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: "right" }}>
                      <Link to={`/bills/${bill._id}`} style={styles.actionBtn} title="View Statement">
                        <FiEye size={14} />
                        <span style={{ fontSize: "0.85rem", fontWeight: "600" }}>View</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
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
  filterPanel: {
    display: "flex",
    gap: "24px",
    padding: "24px",
    marginBottom: "30px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  searchBox: {
    position: "relative",
    flex: 1,
    minWidth: "260px",
  },
  searchIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
  },
  filterOptions: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  tabs: {
    display: "flex",
    background: "rgba(8, 12, 20, 0.4)",
    padding: "4px",
    borderRadius: "10px",
    border: "1px solid var(--glass-border)",
  },
  tabBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-secondary)",
    cursor: "pointer",
    padding: "6px 14px",
    borderRadius: "8px",
    fontWeight: "600",
    fontSize: "0.85rem",
    textTransform: "capitalize",
    transition: "var(--transition-smooth)",
  },
  tabBtnActive: {
    background: "var(--accent-blue)",
    color: "#ffffff",
    boxShadow: "0 2px 10px rgba(59, 130, 246, 0.25)",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  th: {
    padding: "16px",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    borderBottom: "1px solid var(--glass-border)",
  },
  tr: {
    borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
  },
  td: {
    padding: "18px 16px",
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "var(--border-radius-md)",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-secondary)",
    textDecoration: "none",
    cursor: "pointer",
    transition: "var(--transition-smooth)",
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

export default Bills;
