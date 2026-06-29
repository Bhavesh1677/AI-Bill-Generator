import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import { FiFileText, FiUsers, FiClock, FiEye, FiArrowRight, FiBox, FiAlertTriangle, FiTrendingUp } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

const Dashboard = () => {
  const [bills, setBills] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    totalProfit: 0,
    realizedProfit: 0,
    unsoldStockValueCost: 0,
    unsoldStockValueSelling: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [billsRes, clientsRes, productsRes, statsRes] = await Promise.all([
          API.get("/bills"),
          API.get("/clients"),
          API.get("/products"),
          API.get("/bills/dashboard-stats"),
        ]);
        setBills(billsRes.data.data);
        setClients(clientsRes.data.data);
        setProducts(productsRes.data.data);
        setStats(statsRes.data.data);
      } catch (err) {
        setError("Failed to load dashboard metrics. Ensure server is running.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute grocery metrics
  const totalSales = bills
    .filter((b) => b.status === "paid")
    .reduce((sum, b) => sum + b.total, 0);

  const outstandingKhata = clients.reduce((sum, c) => sum + (c.outstandingBalance || 0), 0);

  const lowStockCount = products.filter((p) => p.stockQuantity <= p.minStockLevel).length;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
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
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Aggregating grocery store datasets...</p>
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
          <h1 style={styles.title}>Store Dashboard</h1>
          <p style={styles.subtitle}>Overview of active sales, inventory stock levels, and customer credit ledgers</p>
        </div>
        <Link to="/bills/create" className="btn btn-primary">
          ⚡ Open POS Terminal
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div style={styles.statsGrid}>
        <div className="glass-panel glass-panel-hover" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(16, 185, 129, 0.12)", color: "var(--accent-emerald)" }}>
            <FaRupeeSign size={20} />
          </div>
          <div>
            <p style={styles.statLabel}>Total Sales</p>
            <h3 style={{ ...styles.statValue, color: "var(--accent-emerald)" }}>{formatCurrency(totalSales)}</h3>
            <p style={styles.statDesc}>Successful POS cashouts</p>
          </div>
        </div>

        <Link to="/reports/profit-loss" className="glass-panel glass-panel-hover" style={{ ...styles.statCard, textDecoration: "none", cursor: "pointer" }}>
          <div style={{ ...styles.iconWrapper, background: "rgba(139, 92, 246, 0.12)", color: "#a78bfa" }}>
            <FiTrendingUp size={22} />
          </div>
          <div>
            <p style={styles.statLabel}>Total Profit</p>
            <h3 style={{ ...styles.statValue, color: "#a78bfa" }}>{formatCurrency(stats.totalProfit)}</h3>
            <p style={styles.statDesc}>Realized: {formatCurrency(stats.realizedProfit)}</p>
          </div>
        </Link>

        <Link to="/inventory/unsold-stock" className="glass-panel glass-panel-hover" style={{ ...styles.statCard, textDecoration: "none", cursor: "pointer" }}>
          <div style={{ ...styles.iconWrapper, background: "rgba(6, 182, 212, 0.12)", color: "#22d3ee" }}>
            <FiBox size={22} />
          </div>
          <div>
            <p style={styles.statLabel}>Unsold Stock Value</p>
            <h3 style={{ ...styles.statValue, color: "#22d3ee" }}>{formatCurrency(stats.unsoldStockValueCost)}</h3>
            <p style={styles.statDesc}>Selling: {formatCurrency(stats.unsoldStockValueSelling)}</p>
          </div>
        </Link>

        <div className="glass-panel glass-panel-hover" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(239, 68, 68, 0.12)", color: "#f87171" }}>
            <FiClock size={22} />
          </div>
          <div>
            <p style={styles.statLabel}>Outstanding Credit</p>
            <h3 style={{ ...styles.statValue, color: "#f87171" }}>{formatCurrency(outstandingKhata)}</h3>
            <p style={styles.statDesc}>Total customer Khata balance</p>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(245, 158, 11, 0.12)", color: "var(--accent-orange)" }}>
            <FiAlertTriangle size={22} />
          </div>
          <div>
            <p style={styles.statLabel}>Low Stock Items</p>
            <h3 style={{ ...styles.statValue, color: "var(--accent-orange)" }}>{lowStockCount}</h3>
            <p style={styles.statDesc}>Requires restocking</p>
          </div>
        </div>

        <div className="glass-panel glass-panel-hover" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(59, 130, 246, 0.12)", color: "var(--accent-blue)" }}>
            <FiUsers size={22} />
          </div>
          <div>
            <p style={styles.statLabel}>Customers</p>
            <h3 style={{ ...styles.statValue, color: "#ffffff" }}>{clients.length}</h3>
            <p style={styles.statDesc}>Active Khata profiles</p>
          </div>
        </div>
      </div>

      {/* Recent POS Orders Table */}
      <div className="glass-panel" style={styles.tablePanel}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Recent POS Orders</h2>
          <Link to="/bills" style={styles.tableHeaderLink}>
            <span>View All Transactions</span>
            <FiArrowRight size={14} />
          </Link>
        </div>

        {bills.length === 0 ? (
          <div style={styles.emptyState}>
            <FiFileText size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <h3>No POS Transactions Yet</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Start checking out customers to populate transaction summaries.</p>
            <Link to="/bills/create" className="btn btn-primary" style={{ marginTop: "16px" }}>
              Launch Cashier POS
            </Link>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order Number</th>
                  <th style={styles.th}>Customer</th>
                  <th style={styles.th}>Date</th>
                  <th style={styles.th}>Payment Method</th>
                  <th style={styles.th}>Total Amount</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bills.slice(0, 5).map((bill) => (
                  <tr key={bill._id} className="table-row-hover" style={styles.tr}>
                    <td style={{ ...styles.td, fontWeight: "600", color: "#ffffff" }}>{bill.billNumber}</td>
                    <td style={styles.td}>{bill.clientId?.name || "Walk-in Customer"}</td>
                    <td style={styles.td}>{new Date(bill.issueDate).toLocaleDateString()}</td>
                    <td style={styles.td}>
                      <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: "600" }}>
                        {bill.paymentMethod || "Cash"}
                      </span>
                    </td>
                    <td style={{ ...styles.td, fontWeight: "700", color: "var(--accent-blue)" }}>
                      {formatCurrency(bill.total)}
                    </td>
                    <td style={styles.td}>
                      <span className={`status-badge ${getStatusColor(bill.status)}`}>
                        {bill.status}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <Link to={`/bills/${bill._id}`} style={styles.actionBtn} title="View Details">
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
