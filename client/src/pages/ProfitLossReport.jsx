import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import { FiArrowLeft, FiSearch, FiTrendingUp, FiBox, FiPercent, FiCalendar, FiFileText } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

const ProfitLossReport = () => {
  const [data, setData] = useState({
    summary: {
      totalRevenue: 0,
      realizedRevenue: 0,
      totalCOGS: 0,
      realizedCOGS: 0,
      totalProfit: 0,
      realizedProfit: 0,
      totalMargin: 0,
    },
    bills: [],
    products: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [dateRange, setDateRange] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("bills"); // 'bills' or 'products'

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const res = await API.get("/bills/profit-loss-report");
        setData(res.data.data);
      } catch (err) {
        setError("Failed to load profit and loss analytics. Ensure server is running.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Filter logic based on Date range and Search query
  const getFilteredBills = () => {
    let filtered = [...data.bills];

    // Date range filtering
    const now = new Date();
    if (dateRange === "7days") {
      const limitDate = new Date(now.setDate(now.getDate() - 7));
      filtered = filtered.filter((b) => new Date(b.issueDate) >= limitDate);
    } else if (dateRange === "30days") {
      const limitDate = new Date(now.setDate(now.getDate() - 30));
      filtered = filtered.filter((b) => new Date(b.issueDate) >= limitDate);
    } else if (dateRange === "thismonth") {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      filtered = filtered.filter((b) => new Date(b.issueDate) >= firstDayOfMonth);
    }

    // Search query filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.billNumber.toLowerCase().includes(query) ||
          b.customerName.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const getFilteredProducts = () => {
    let filtered = [...data.products];

    // Search query filtering
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.brandName.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredBills = getFilteredBills();
  const filteredProducts = getFilteredProducts();

  // Re-calculate summaries based on active filtered transactions
  const activeRevenue = filteredBills.reduce((sum, b) => sum + b.revenue, 0);
  const activeCOGS = filteredBills.reduce((sum, b) => sum + b.cogs, 0);
  const activeProfit = Number((activeRevenue - activeCOGS).toFixed(2));
  const activeMargin = activeRevenue > 0 ? Number(((activeProfit / activeRevenue) * 100).toFixed(2)) : 0;

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div className="loader"></div>
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Synthesizing ledger P&L reporting datasets...</p>
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
    <div className="animate-fade-in" style={{ paddingBottom: "40px" }}>
      {/* Header section */}
      <div style={styles.header}>
        <div>
          <Link to="/dashboard" style={styles.backLink}>
            <FiArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>
          <h1 style={styles.title}>Profit & Loss Report</h1>
          <p style={styles.subtitle}>
            Analyze revenues, cost of goods sold (COGS), margins, and product profit yields.
          </p>
        </div>
      </div>

      {/* Date Filter Toolbar */}
      <div className="glass-panel" style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <FiCalendar size={18} style={{ color: "var(--text-muted)" }} />
          <span style={styles.toolbarLabel}>Filter Period:</span>
          <div style={styles.filterGroup}>
            {[
              { id: "all", label: "All Time" },
              { id: "thismonth", label: "This Month" },
              { id: "30days", label: "Last 30 Days" },
              { id: "7days", label: "Last 7 Days" },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setDateRange(opt.id)}
                style={{
                  ...styles.filterBtn,
                  ...(dateRange === opt.id ? styles.filterBtnActive : {}),
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div style={styles.toolbarRight}>
          <div style={styles.searchWrapper}>
            <FiSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder={activeTab === "bills" ? "Search bill number or customer..." : "Search product, brand, or category..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div style={styles.statsGrid}>
        <div className="glass-panel" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(59, 130, 246, 0.12)", color: "var(--accent-blue)" }}>
            <FaRupeeSign size={20} />
          </div>
          <div>
            <p style={styles.statLabel}>Revenue (Sales)</p>
            <h3 style={{ ...styles.statValue, color: "var(--accent-blue)" }}>
              {formatCurrency(activeRevenue)}
            </h3>
            <p style={styles.statDesc}>
              Realized (Paid): {formatCurrency(
                filteredBills.filter(b => b.status === "paid").reduce((sum, b) => sum + b.revenue, 0)
              )}
            </p>
          </div>
        </div>

        <div className="glass-panel" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(245, 158, 11, 0.12)", color: "var(--accent-orange)" }}>
            <FiBox size={20} />
          </div>
          <div>
            <p style={styles.statLabel}>Cost of Goods Sold (COGS)</p>
            <h3 style={{ ...styles.statValue, color: "var(--accent-orange)" }}>
              {formatCurrency(activeCOGS)}
            </h3>
            <p style={styles.statDesc}>Inventory purchase expenses</p>
          </div>
        </div>

        <div className="glass-panel" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(16, 185, 129, 0.12)", color: "var(--accent-emerald)" }}>
            <FiTrendingUp size={20} />
          </div>
          <div>
            <p style={styles.statLabel}>Gross Profit</p>
            <h3 style={{ ...styles.statValue, color: "var(--accent-emerald)" }}>
              {formatCurrency(activeProfit)}
            </h3>
            <p style={styles.statDesc}>
              Realized Profit: {formatCurrency(
                filteredBills.filter(b => b.status === "paid").reduce((sum, b) => sum + b.profit, 0)
              )}
            </p>
          </div>
        </div>

        <div className="glass-panel" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(139, 92, 246, 0.12)", color: "#a78bfa" }}>
            <FiPercent size={20} />
          </div>
          <div>
            <p style={styles.statLabel}>Profit Margin</p>
            <h3 style={{ ...styles.statValue, color: "#a78bfa" }}>
              {activeMargin}%
            </h3>
            <p style={styles.statDesc}>Average profit ratio on sales</p>
          </div>
        </div>
      </div>

      {/* Main Reports Table Panel */}
      <div className="glass-panel" style={styles.tablePanel}>
        {/* Tab switchers */}
        <div style={styles.tabsHeader}>
          <div style={styles.tabsList}>
            <button
              onClick={() => {
                setActiveTab("bills");
                setSearchQuery("");
              }}
              style={{
                ...styles.tabBtn,
                ...(activeTab === "bills" ? styles.tabBtnActive : {}),
              }}
            >
              Sales P&L Ledgers ({filteredBills.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("products");
                setSearchQuery("");
              }}
              style={{
                ...styles.tabBtn,
                ...(activeTab === "products" ? styles.tabBtnActive : {}),
              }}
            >
              Product Yield Performance ({filteredProducts.length})
            </button>
          </div>
        </div>

        {/* Tab A: Bills detailed list */}
        {activeTab === "bills" && (
          filteredBills.length === 0 ? (
            <div style={styles.emptyState}>
              <FiFileText size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
              <h3>No Transactions Match Filters</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Adjust your search query or calendar periods.</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Bill Number</th>
                    <th style={styles.th}>Customer</th>
                    <th style={styles.th}>Date</th>
                    <th style={styles.th}>Payment</th>
                    <th style={styles.th}>Revenue</th>
                    <th style={styles.th}>COGS (Expenses)</th>
                    <th style={styles.th}>Net Profit</th>
                    <th style={styles.th}>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBills.map((bill) => (
                    <tr key={bill._id} className="table-row-hover" style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#ffffff" }}>
                        <Link to={`/bills/${bill._id}`} style={styles.billLink}>
                          {bill.billNumber}
                        </Link>
                      </td>
                      <td style={styles.td}>{bill.customerName}</td>
                      <td style={styles.td}>{new Date(bill.issueDate).toLocaleDateString()}</td>
                      <td style={styles.td}>
                        <span style={styles.paymentMethodTag}>{bill.paymentMethod}</span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#ffffff" }}>
                        {formatCurrency(bill.revenue)}
                      </td>
                      <td style={styles.td}>{formatCurrency(bill.cogs)}</td>
                      <td style={{ ...styles.td, fontWeight: "700", color: bill.profit >= 0 ? "var(--accent-emerald)" : "#f87171" }}>
                        {formatCurrency(bill.profit)}
                      </td>
                      <td style={{ ...styles.td, fontWeight: "600", color: bill.margin >= 30 ? "var(--accent-emerald)" : bill.margin >= 15 ? "var(--accent-blue)" : "var(--text-secondary)" }}>
                        {bill.margin}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}

        {/* Tab B: Product Performance detailed list */}
        {activeTab === "products" && (
          filteredProducts.length === 0 ? (
            <div style={styles.emptyState}>
              <FiBox size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
              <h3>No Products Match Filters</h3>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Adjust your product search query.</p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Product Name</th>
                    <th style={styles.th}>Brand</th>
                    <th style={styles.th}>Category</th>
                    <th style={styles.th}>Qty Sold</th>
                    <th style={styles.th}>Revenue</th>
                    <th style={styles.th}>COGS (Buying Cost)</th>
                    <th style={styles.th}>Net Profit</th>
                    <th style={styles.th}>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p, idx) => (
                    <tr key={idx} className="table-row-hover" style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#ffffff" }}>{p.name}</td>
                      <td style={styles.td}>{p.brandName || "-"}</td>
                      <td style={styles.td}>
                        <span style={styles.categoryTag}>{p.category}</span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#ffffff" }}>{p.quantitySold}</td>
                      <td style={styles.td}>{formatCurrency(p.revenue)}</td>
                      <td style={styles.td}>{formatCurrency(p.cogs)}</td>
                      <td style={{ ...styles.td, fontWeight: "700", color: p.profit >= 0 ? "var(--accent-emerald)" : "#f87171" }}>
                        {formatCurrency(p.profit)}
                      </td>
                      <td style={{ ...styles.td, fontWeight: "600", color: p.margin >= 30 ? "var(--accent-emerald)" : p.margin >= 15 ? "var(--accent-blue)" : "var(--text-secondary)" }}>
                        {p.margin}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

const styles = {
  header: {
    marginBottom: "30px",
  },
  backLink: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "var(--accent-blue)",
    textDecoration: "none",
    fontSize: "0.9rem",
    fontWeight: "600",
    marginBottom: "16px",
    transition: "var(--transition-smooth)",
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
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 24px",
    marginBottom: "24px",
    gap: "16px",
    flexWrap: "wrap",
  },
  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },
  toolbarLabel: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "var(--text-secondary)",
  },
  filterGroup: {
    display: "flex",
    background: "rgba(255, 255, 255, 0.03)",
    padding: "4px",
    borderRadius: "8px",
    border: "1px solid var(--glass-border)",
  },
  filterBtn: {
    padding: "6px 14px",
    background: "none",
    border: "none",
    color: "var(--text-secondary)",
    fontSize: "0.85rem",
    fontWeight: "600",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "var(--transition-smooth)",
  },
  filterBtnActive: {
    background: "var(--accent-blue)",
    color: "#ffffff",
    boxShadow: "0 0 10px rgba(59, 130, 246, 0.25)",
  },
  toolbarRight: {
    flexGrow: 1,
    maxWidth: "400px",
    width: "100%",
  },
  searchWrapper: {
    position: "relative",
    width: "100%",
  },
  searchIcon: {
    position: "absolute",
    left: "14px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-muted)",
  },
  searchInput: {
    width: "100%",
    padding: "10px 16px 10px 42px",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid var(--glass-border)",
    borderRadius: "var(--border-radius-md)",
    color: "#ffffff",
    fontSize: "0.9rem",
    outline: "none",
    transition: "var(--transition-smooth)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
    marginBottom: "35px",
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
    padding: "24px",
  },
  tabsHeader: {
    borderBottom: "1px solid var(--glass-border)",
    marginBottom: "20px",
    paddingBottom: "8px",
  },
  tabsList: {
    display: "flex",
    gap: "8px",
  },
  tabBtn: {
    padding: "10px 20px",
    background: "none",
    border: "none",
    color: "var(--text-muted)",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
    position: "relative",
    transition: "var(--transition-smooth)",
  },
  tabBtnActive: {
    color: "var(--accent-blue)",
    background: "rgba(59, 130, 246, 0.05)",
    borderRadius: "var(--border-radius-md)",
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
  billLink: {
    color: "var(--accent-blue)",
    textDecoration: "none",
    fontWeight: "600",
  },
  paymentMethodTag: {
    display: "inline-block",
    padding: "2px 8px",
    fontSize: "0.8rem",
    borderRadius: "4px",
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-secondary)",
    fontWeight: "600",
  },
  categoryTag: {
    display: "inline-block",
    padding: "2px 8px",
    fontSize: "0.8rem",
    borderRadius: "4px",
    background: "rgba(59, 130, 246, 0.04)",
    border: "1px solid rgba(59, 130, 246, 0.15)",
    color: "var(--accent-blue)",
    fontWeight: "600",
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
    padding: "60px 20px",
  },
};

export default ProfitLossReport;
