import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import { FiDollarSign, FiFileText, FiUsers, FiClock, FiEye, FiArrowRight } from "react-icons/fi";

const Dashboard = () => {
  const [bills, setBills] = useState([]);
  const [clientCount, setClientCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [billsRes, clientsRes] = await Promise.all([
          API.get("/bills"),
          API.get("/clients"),
        ]);
        setBills(billsRes.data.data);
        setClientCount(clientsRes.data.data.length);
      } catch (err) {
        setError("Failed to load dashboard metrics. Ensure server is running.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute metrics
  const totalRevenue = bills
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + b.total, 0);

  const pendingRevenue = bills
    .filter((b) => b.status === "pending")
    .reduce((sum, b) => sum + b.total, 0);

  const unpaidRevenue = bills
    .filter((b) => b.status === "unpaid" || b.status === "overdue")
    .reduce((sum, b) => sum + b.total, 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusColor = (status) => {
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

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div className="loader"></div>
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Analyzing billing datasets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.errorBox}>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()} style={{ marginTop: "12px" }}>
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Workspace Overview</h1>
          <p style={styles.subtitle}>Track client portfolios, invoice registries, and general cashflows</p>
        </div>
        <Link to="/bills/create" className="btn btn-primary">
          ⚡ Create New Bill
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div style={styles.statsGrid}>
        <div className="glass-panel glass-panel-hover" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(16, 185, 129, 0.12)", color: "var(--accent-emerald)" }}>
            <FiDollarSign size={22} />
          </div>
          <div>
            <p style={styles.statLabel}>Total Revenue</p>
            <h3 style={{ ...styles.statValue, color: "var(--accent-emerald)" }}>{formatCurrency(totalRevenue)}</h3>
            <p style={styles.statDesc}>Cleared collections</p>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(245, 158, 11, 0.12)", color: "var(--accent-amber)" }}>
            <FiClock size={22} />
          </div>
          <div>
            <p style={styles.statLabel}>Pending Clearances</p>
            <h3 style={{ ...styles.statValue, color: "var(--accent-amber)" }}>{formatCurrency(pendingRevenue)}</h3>
            <p style={styles.statDesc}>Awaiting approvals</p>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(239, 68, 68, 0.12)", color: "var(--accent-coral)" }}>
            <FiDollarSign size={22} />
          </div>
          <div>
            <p style={styles.statLabel}>Unpaid Balances</p>
            <h3 style={{ ...styles.statValue, color: "var(--accent-coral)" }}>{formatCurrency(unpaidRevenue)}</h3>
            <p style={styles.statDesc}>Outstanding debts</p>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(59, 130, 246, 0.12)", color: "var(--accent-blue)" }}>
            <FiUsers size={22} />
          </div>
          <div>
            <p style={styles.statLabel}>Client Registry</p>
            <h3 style={{ ...styles.statValue, color: "#ffffff" }}>{clientCount}</h3>
            <p style={styles.statDesc}>Active profiles</p>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="glass-panel" style={styles.tablePanel}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Recent Bills</h2>
          <Link to="/bills" style={styles.tableHeaderLink}>
            <span>View All</span>
            <FiArrowRight size={14} />
          </Link>
        </div>

        {bills.length === 0 ? (
          <div style={styles.emptyState}>
            <FiFileText size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <h3>No Bills Registered Yet</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Create your first bill to launch cashflow metrics.</p>
            <Link to="/bills/create" className="btn btn-primary" style={{ marginTop: "16px" }}>
              Build Invoices
            </Link>
          </div>
        ) : (
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
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.slice(0, 5).map((bill) => (
                  <tr key={bill._id} className="table-row-hover" style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: "600", color: "#ffffff" }}>{bill.billNumber}</td>
                    <td style={styles.td}>{bill.clientId?.name || "Deleted Client"}</td>
                    <td style={styles.td}>{new Date(bill.issueDate).toLocaleDateString()}</td>
                    <td style={styles.td}>{new Date(bill.dueDate).toLocaleDateString()}</td>
                    <td style={{ ...styles.td, fontWeight: "700", color: "var(--accent-blue)" }}>
                      {formatCurrency(bill.total)}
                    </td>
                    <td style={styles.td}>
                      <span className={`status-badge ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <Link to={`/bills/${bill._id}`} style={styles.actionBtn} title="View Invoice">
                        <FiEye size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
    marginBottom: "40px",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "24px",
  },
  iconWrapper: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statLabel: {
    fontSize: "0.85rem",
    fontWeight: "500",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statValue: {
    fontSize: "1.6rem",
    fontWeight: "800",
    margin: "4px 0 2px 0",
  },
  statDesc: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
  },
  tablePanel: {
    padding: "30px",
  },
  tableHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  tableTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#ffffff",
  },
  tableHeaderLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    color: "var(--accent-blue)",
    textDecoration: "none",
    fontWeight: "600",
    fontSize: "0.9rem",
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
    padding: "12px 16px",
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
    padding: "16px",
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-secondary)",
    cursor: "pointer",
    transition: "var(--transition-smooth)",
  },
  centerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
  },
  errorBox: {
    background: "rgba(239, 68, 68, 0.08)",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    color: "#f87171",
    padding: "24px 32px",
    borderRadius: "var(--border-radius-lg)",
    textAlign: "center",
    maxWidth: "400px",
  },
  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
  },
};

// Add custom row hover and loader css globally
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    .table-row-hover:hover {
      background: rgba(255, 255, 255, 0.015);
    }
    .table-row-hover a:hover {
      color: #ffffff !important;
      background: var(--accent-blue) !important;
      border-color: var(--accent-blue) !important;
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.25);
    }
    .loader {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(59, 130, 246, 0.1);
      border-top-color: var(--accent-blue);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default Dashboard;
