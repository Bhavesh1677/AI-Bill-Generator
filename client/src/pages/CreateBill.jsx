import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/api";
import { FiPlus, FiTrash, FiUser, FiLayers, FiSearch, FiShoppingCart, FiMinus } from "react-icons/fi";

const CreateBill = () => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // POS State
  const [selectedClientId, setSelectedClientId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [basket, setBasket] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const navigate = useNavigate();

  const categories = [
    "All",
    "Fruits & Vegetables",
    "Dairy & Eggs",
    "Bakery & Bread",
    "Beverages",
    "Snacks & Sweets",
    "Grains & Pulses",
    "Packaged Food",
    "Household",
    "Personal Care",
    "Other"
  ];

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
        setError("Failed to load clients and products lists for POS checkout.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToBasket = (product) => {
    if (product.stockQuantity <= 0) {
      setError(`Warning: ${product.name} is out of stock!`);
      return;
    }

    setBasket((prev) => {
      const existing = prev.find((item) => item.product._id === product._id);
      if (existing) {
        if (existing.quantity >= product.stockQuantity) {
          setError(`Warning: Cannot add more than available stock (${product.stockQuantity} units) for ${product.name}.`);
          return prev;
        }
        setError("");
        return prev.map((item) =>
          item.product._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      setError("");
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, change) => {
    setBasket((prev) => {
      const item = prev.find((i) => i.product._id === productId);
      if (!item) return prev;

      const newQty = item.quantity + change;
      if (newQty <= 0) {
        return prev.filter((i) => i.product._id !== productId);
      }

      if (newQty > item.product.stockQuantity) {
        setError(`Warning: Cannot add more than available stock (${item.product.stockQuantity} units) for ${item.product.name}.`);
        return prev;
      }

      setError("");
      return prev.map((i) => (i.product._id === productId ? { ...i, quantity: newQty } : i));
    });
  };

  const handleRemoveFromBasket = (productId) => {
    setBasket((prev) => prev.filter((item) => item.product._id !== productId));
  };

  const calculateTotal = () => {
    return basket.reduce((sum, item) => sum + item.quantity * item.product.price, 0);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!selectedClientId) {
      setError("Please select a customer before checking out.");
      return;
    }
    if (basket.length === 0) {
      setError("Please add at least one item to the basket.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const checkoutData = {
        clientId: selectedClientId,
        paymentMethod,
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // default 15 days
        items: basket.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          unitPrice: item.product.price,
          billingUnit: item.product.unit,
          brandName: item.product.brandName || "",
          size: item.product.size || "1",
        })),
      };

      const res = await API.post("/bills", checkoutData);
      navigate(`/bills/${res.data.data.bill._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to finalize POS checkout.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.brandName && product.brandName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Launching cashier checkout terminal...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={styles.posContainer}>
      {/* Top POS header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Cashier Terminal (POS)</h1>
          <p style={styles.subtitle}>Select items, manage customer baskets, and process grocery checkouts</p>
        </div>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      <div style={styles.mainLayout}>
        {/* Left Side: Category tabs & product search grid */}
        <div style={styles.catalogSection}>
          <div className="glass-panel" style={styles.searchBarWrapper}>
            <div style={styles.searchInputContainer}>
              <FiSearch size={18} style={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search products by name or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={styles.searchInput}
              />
            </div>

            {/* Category tabs */}
            <div style={styles.categoryTabs}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    ...styles.categoryTabBtn,
                    ...(selectedCategory === cat ? styles.activeCategoryTab : {}),
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div style={styles.productGrid}>
            {filteredProducts.map((p) => {
              const inBasket = basket.find((item) => item.product._id === p._id);
              const isLowStock = p.stockQuantity <= p.minStockLevel;
              const isOutOfStock = p.stockQuantity <= 0;

              return (
                <div key={p._id} className="glass-panel" style={styles.productCard}>
                  <div style={styles.productCardHeader}>
                    <span style={styles.productCategory}>{p.category || "Other"}</span>
                    <span
                      style={{
                        ...styles.stockBadge,
                        color: isOutOfStock
                          ? "#f87171"
                          : isLowStock
                          ? "var(--accent-orange)"
                          : "var(--accent-emerald)",
                        background: isOutOfStock
                          ? "rgba(239,68,68,0.1)"
                          : isLowStock
                          ? "rgba(249,115,22,0.1)"
                          : "rgba(16,185,129,0.1)",
                      }}
                    >
                      {isOutOfStock ? "Out of Stock" : `${p.stockQuantity} left`}
                    </span>
                  </div>

                  <h3 style={styles.productName}>{p.name}</h3>
                  <p style={styles.productBrand}>{p.brandName || "Generic"}</p>

                  <div style={styles.productCardFooter}>
                    <div style={styles.priceContainer}>
                      <span style={styles.productPrice}>{formatCurrency(p.price)}</span>
                      <span style={styles.productUnit}>/{p.unit}</span>
                    </div>

                    <button
                      onClick={() => handleAddToBasket(p)}
                      disabled={isOutOfStock}
                      style={{
                        ...styles.addBtn,
                        opacity: isOutOfStock ? 0.5 : 1,
                      }}
                    >
                      {inBasket ? `In Basket (${inBasket.quantity})` : "+ Add"}
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProducts.length === 0 && (
              <div style={styles.noResults}>
                <FiLayers size={36} style={{ color: "var(--text-muted)", marginBottom: "8px" }} />
                <p>No products match your search/filters.</p>
                <Link to="/products" className="btn btn-secondary" style={{ marginTop: "12px" }}>
                  Add Product to Catalog
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Customer basket summary and checkout */}
        <div className="glass-panel" style={styles.basketSection}>
          <div style={styles.basketHeader}>
            <FiShoppingCart size={20} style={{ color: "var(--accent-blue)" }} />
            <h2 style={styles.basketTitle}>Customer Basket</h2>
          </div>

          <form onSubmit={handleCheckout} style={styles.basketForm}>
            {/* Customer select */}
            <div className="form-group">
              <label htmlFor="clientSelect" style={styles.basketLabel}>
                Customer Profile *
              </label>
              <select
                id="clientSelect"
                className="form-input"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
                required
                style={styles.basketSelect}
              >
                <option value="">-- Choose Customer --</option>
                {clients.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} {c.phone ? `(${c.phone})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Selected items list */}
            <div style={styles.basketItemsList}>
              <h3 style={styles.itemsListTitle}>Items</h3>
              {basket.length === 0 ? (
                <div style={styles.emptyBasket}>
                  <p>Basket is empty. Select products from the left to start.</p>
                </div>
              ) : (
                basket.map((item) => (
                  <div key={item.product._id} style={styles.basketItemRow}>
                    <div style={styles.basketItemInfo}>
                      <span style={styles.basketItemName}>{item.product.name}</span>
                      <span style={styles.basketItemPrice}>
                        {formatCurrency(item.product.price)} x {item.quantity}
                      </span>
                    </div>

                    <div style={styles.basketItemActions}>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.product._id, -1)}
                        style={styles.qtyBtn}
                      >
                        <FiMinus size={12} />
                      </button>
                      <span style={styles.qtyText}>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.product._id, 1)}
                        style={styles.qtyBtn}
                      >
                        <FiPlus size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveFromBasket(item.product._id)}
                        style={styles.removeBtn}
                      >
                        <FiTrash size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Divider */}
            <div style={styles.divider}></div>

            {/* Payment Method Selector */}
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label style={styles.basketLabel}>Payment Method</label>
              <div style={styles.paymentMethodGroup}>
                {["Cash", "Card", "UPI", "Store Credit"].map((method) => (
                  <label
                    key={method}
                    style={{
                      ...styles.paymentOption,
                      border: paymentMethod === method ? "1.5px solid var(--accent-blue)" : "1px solid var(--glass-border)",
                      background: paymentMethod === method ? "rgba(59, 130, 246, 0.08)" : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method}
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                      style={{ display: "none" }}
                    />
                    {method}
                  </label>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Grand Total</span>
              <span style={styles.totalVal}>{formatCurrency(calculateTotal())}</span>
            </div>

            {/* Actions */}
            <button
              type="submit"
              className="btn btn-primary"
              style={styles.checkoutBtn}
              disabled={submitting || basket.length === 0}
            >
              {submitting ? "Processing checkout..." : "⚡ Complete & Generate Bill"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

const styles = {
  posContainer: {
    paddingBottom: "40px",
  },
  header: {
    marginBottom: "24px",
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
  mainLayout: {
    display: "flex",
    gap: "24px",
    alignItems: "flex-start",
  },
  catalogSection: {
    flex: 1.5,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  searchBarWrapper: {
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  searchInputContainer: {
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
    background: "rgba(8, 12, 20, 0.6)",
    border: "1px solid var(--glass-border)",
    borderRadius: "var(--border-radius-md)",
    padding: "12px 16px 12px 42px",
    color: "#ffffff",
    fontSize: "0.95rem",
    outline: "none",
  },
  categoryTabs: {
    display: "flex",
    gap: "8px",
    overflowX: "auto",
    paddingBottom: "4px",
  },
  categoryTabBtn: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid var(--glass-border)",
    borderRadius: "20px",
    padding: "6px 16px",
    color: "var(--text-secondary)",
    fontSize: "0.85rem",
    fontWeight: "500",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.2s ease",
  },
  activeCategoryTab: {
    background: "var(--accent-blue)",
    borderColor: "var(--accent-blue)",
    color: "#ffffff",
  },
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
  },
  productCard: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    minHeight: "160px",
  },
  productCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  productCategory: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
  },
  stockBadge: {
    fontSize: "0.72rem",
    fontWeight: "600",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  productName: {
    fontSize: "1.05rem",
    fontWeight: "700",
    color: "#ffffff",
    margin: "0 0 4px 0",
  },
  productBrand: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    margin: "0 0 16px 0",
  },
  productCardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceContainer: {
    display: "flex",
    alignItems: "baseline",
  },
  productPrice: {
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "var(--accent-blue)",
  },
  productUnit: {
    fontSize: "0.75rem",
    color: "var(--text-secondary)",
  },
  addBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--glass-border)",
    borderRadius: "var(--border-radius-sm)",
    padding: "6px 12px",
    color: "#ffffff",
    fontSize: "0.85rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  noResults: {
    gridColumn: "1 / -1",
    textAlign: "center",
    padding: "60px 20px",
    color: "var(--text-muted)",
  },
  basketSection: {
    flex: 1.1,
    padding: "24px",
    position: "sticky",
    top: "24px",
  },
  basketHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
  },
  basketTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#ffffff",
    margin: 0,
  },
  basketForm: {
    display: "flex",
    flexDirection: "column",
  },
  basketLabel: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "var(--text-secondary)",
    marginBottom: "6px",
    display: "block",
  },
  basketSelect: {
    width: "100%",
  },
  basketItemsList: {
    margin: "20px 0",
    maxHeight: "300px",
    overflowY: "auto",
    paddingRight: "4px",
  },
  itemsListTitle: {
    fontSize: "0.9rem",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    marginBottom: "10px",
    letterSpacing: "0.5px",
  },
  emptyBasket: {
    padding: "30px 10px",
    textAlign: "center",
    color: "var(--text-muted)",
    fontSize: "0.85rem",
  },
  basketItemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  basketItemInfo: {
    display: "flex",
    flexDirection: "column",
  },
  basketItemName: {
    fontSize: "0.92rem",
    fontWeight: "600",
    color: "#ffffff",
  },
  basketItemPrice: {
    fontSize: "0.8rem",
    color: "var(--text-secondary)",
    marginTop: "2px",
  },
  basketItemActions: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  qtyBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    border: "1px solid var(--glass-border)",
    color: "#ffffff",
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  qtyText: {
    fontSize: "0.9rem",
    color: "#ffffff",
    minWidth: "16px",
    textAlign: "center",
  },
  removeBtn: {
    background: "transparent",
    border: "none",
    color: "#f87171",
    cursor: "pointer",
    padding: "4px",
    marginLeft: "4px",
  },
  divider: {
    height: "1px",
    background: "var(--glass-border)",
    width: "100%",
    margin: "12px 0",
  },
  paymentMethodGroup: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "10px",
  },
  paymentOption: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "10px",
    borderRadius: "var(--border-radius-sm)",
    cursor: "pointer",
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#ffffff",
    userSelect: "none",
    transition: "all 0.2s",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "24px 0",
  },
  totalLabel: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#ffffff",
  },
  totalVal: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "var(--accent-emerald)",
  },
  checkoutBtn: {
    width: "100%",
    padding: "14px",
    fontSize: "1rem",
    fontWeight: "700",
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
