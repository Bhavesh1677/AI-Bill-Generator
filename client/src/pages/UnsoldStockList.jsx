import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../utils/api";
import { FiArrowLeft, FiSearch, FiLayers, FiAlertCircle, FiBox, FiTrendingUp, FiArrowDownRight, FiInbox } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

const UnsoldStockList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchInventoryData = async () => {
      try {
        setLoading(true);
        const res = await API.get("/products");
        // Sort products by total cost valuation descending
        const sortedProducts = (res.data.data || []).sort((a, b) => {
          const valA = (a.stockQuantity || 0) * (a.costPrice || 0);
          const valB = (b.stockQuantity || 0) * (b.costPrice || 0);
          return valB - valA;
        });
        setProducts(sortedProducts);
      } catch (err) {
        setError("Failed to load inventory valuation. Ensure server is running.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchInventoryData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  // Get categories list dynamically
  const categories = ["All", ...new Set(products.map((p) => p.category).filter(Boolean))];

  // Filter items that have stockQuantity > 0
  const getFilteredItems = () => {
    let filtered = products.filter((p) => (p.stockQuantity || 0) > 0);

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.brandName && p.brandName.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const filteredItems = getFilteredItems();

  // Summary Metrics calculations
  const totalStockItemsCount = filteredItems.reduce((sum, p) => sum + (p.stockQuantity || 0), 0);
  const totalCostValuation = filteredItems.reduce((sum, p) => sum + (p.stockQuantity || 0) * (p.costPrice || 0), 0);
  const totalRetailValuation = filteredItems.reduce((sum, p) => sum + (p.stockQuantity || 0) * (p.price || 0), 0);
  const potentialProfit = Number((totalRetailValuation - totalCostValuation).toFixed(2));
  const potentialMargin = totalRetailValuation > 0 ? Number(((potentialProfit / totalRetailValuation) * 100).toFixed(2)) : 0;

  if (loading) {
    return (
      <div style={styles.centerContainer}>
        <div className="loader"></div>
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Auditing warehouse inventory valuations...</p>
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
          <h1 style={styles.title}>Unsold Stock Valuation</h1>
          <p style={styles.subtitle}>
            Monitor active product inventory valuations, cost liabilities, and expected retail profit margins.
          </p>
        </div>
      </div>

      {/* Date Filter Toolbar */}
      <div className="glass-panel" style={styles.toolbar}>
        <div style={styles.toolbarLeft}>
          <FiLayers size={18} style={{ color: "var(--text-muted)" }} />
          <span style={styles.toolbarLabel}>Filter Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={styles.selectInput}
          >
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.toolbarRight}>
          <div style={styles.searchWrapper}>
            <FiSearch style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search product name or brand..."
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
            <FiBox size={20} />
          </div>
          <div>
            <p style={styles.statLabel}>Unsold Quantity</p>
            <h3 style={{ ...styles.statValue, color: "var(--accent-blue)" }}>
              {totalStockItemsCount}
            </h3>
            <p style={styles.statDesc}>Total pieces in warehouse</p>
          </div>
        </div>

        <div className="glass-panel" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(6, 182, 212, 0.12)", color: "#22d3ee" }}>
            <FaRupeeSign size={20} />
          </div>
          <div>
            <p style={styles.statLabel}>Cost Valuation</p>
            <h3 style={{ ...styles.statValue, color: "#22d3ee" }}>
              {formatCurrency(totalCostValuation)}
            </h3>
            <p style={styles.statDesc}>Capital tied up in stock</p>
          </div>
        </div>

        <div className="glass-panel" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(16, 185, 129, 0.12)", color: "var(--accent-emerald)" }}>
            <FaRupeeSign size={20} />
          </div>
          <div>
            <p style={styles.statLabel}>Expected Retail Value</p>
            <h3 style={{ ...styles.statValue, color: "var(--accent-emerald)" }}>
              {formatCurrency(totalRetailValuation)}
            </h3>
            <p style={styles.statDesc}>Potential gross revenue</p>
          </div>
        </div>

        <div className="glass-panel" style={styles.statCard}>
          <div style={{ ...styles.iconWrapper, background: "rgba(139, 92, 246, 0.12)", color: "#a78bfa" }}>
            <FiTrendingUp size={20} />
          </div>
          <div>
            <p style={styles.statLabel}>Expected Yield Profit</p>
            <h3 style={{ ...styles.statValue, color: "#a78bfa" }}>
              {formatCurrency(potentialProfit)}
            </h3>
            <p style={styles.statDesc}>Potential margin: {potentialMargin}%</p>
          </div>
        </div>
      </div>

      {/* Main Stock Table Panel */}
      <div className="glass-panel" style={styles.tablePanel}>
        <div style={styles.tableHeader}>
          <h2 style={styles.tableTitle}>Warehouse Inventory Stock Valuation</h2>
        </div>

        {filteredItems.length === 0 ? (
          <div style={styles.emptyState}>
            <FiInbox size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <h3>No Unsold Stock Available</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Either all products are sold out or your filters are too restrictive.</p>
          </div>
        ) : (
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Product Name</th>
                  <th style={styles.th}>Brand</th>
                  <th style={styles.th}>Category</th>
                  <th style={styles.th}>Stock level</th>
                  <th style={styles.th}>Cost Price</th>
                  <th style={styles.th}>Selling Price</th>
                  <th style={styles.th}>Cost Valuation</th>
                  <th style={styles.th}>Selling Valuation</th>
                  <th style={styles.th}>Yield Profit</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => {
                  const itemCostValue = (item.stockQuantity || 0) * (item.costPrice || 0);
                  const itemRetailValue = (item.stockQuantity || 0) * (item.price || 0);
                  const itemYield = Number((itemRetailValue - itemCostValue).toFixed(2));
                  const isLowStock = item.stockQuantity <= (item.minStockLevel || 10);

                  return (
                    <tr key={item._id} className="table-row-hover" style={styles.tr}>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#ffffff" }}>
                        <div>{item.name}</div>
                        {isLowStock && (
                          <div style={styles.lowStockBadge}>
                            <FiAlertCircle size={11} style={{ marginRight: "3px" }} />
                            <span>Low Stock Alert</span>
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>{item.brandName || "-"}</td>
                      <td style={styles.td}>
                        <span style={styles.categoryTag}>{item.category}</span>
                      </td>
                      <td style={{ ...styles.td, fontWeight: "600", color: isLowStock ? "var(--accent-orange)" : "#ffffff" }}>
                        {item.stockQuantity} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{item.unit || "pcs"}</span>
                      </td>
                      <td style={styles.td}>{formatCurrency(item.costPrice || 0)}</td>
                      <td style={styles.td}>{formatCurrency(item.price || 0)}</td>
                      <td style={{ ...styles.td, fontWeight: "600", color: "#ffffff" }}>
                        {formatCurrency(itemCostValue)}
                      </td>
                      <td style={styles.td}>{formatCurrency(itemRetailValue)}</td>
                      <td style={{ ...styles.td, fontWeight: "700", color: "var(--accent-emerald)" }}>
                        {formatCurrency(itemYield)}
                      </td>
                    </tr>
                  );
                })}
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
  selectInput: {
    padding: "8px 14px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid var(--glass-border)",
    borderRadius: "8px",
    color: "#ffffff",
    fontSize: "0.85rem",
    fontWeight: "600",
    outline: "none",
    cursor: "pointer",
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
  tableHeader: {
    borderBottom: "1px solid var(--glass-border)",
    marginBottom: "20px",
    paddingBottom: "12px",
  },
  tableTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#ffffff",
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
  categoryTag: {
    display: "inline-block",
    padding: "2px 8px",
    fontSize: "0.8rem",
    borderRadius: "4px",
    background: "rgba(6, 182, 212, 0.04)",
    border: "1px solid rgba(6, 182, 212, 0.15)",
    color: "#22d3ee",
    fontWeight: "600",
  },
  lowStockBadge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "1px 6px",
    fontSize: "0.7rem",
    borderRadius: "4px",
    background: "rgba(245, 158, 11, 0.1)",
    border: "1px solid rgba(245, 158, 11, 0.2)",
    color: "var(--accent-orange)",
    fontWeight: "600",
    marginTop: "4px",
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

export default UnsoldStockList;
