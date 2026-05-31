import React, { useState, useEffect } from "react";
import API from "../utils/api";
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiLayers, FiX } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: "", brandName: "", size: "1", price: "", unit: "pieces" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/products");
      setProducts(res.data.data);
    } catch (err) {
      setError("Failed to fetch product catalog.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: "", brandName: "", size: "1", price: "", unit: "pieces" });
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brandName: product.brandName || "",
      size: product.size !== undefined ? product.size.toString() : "1",
      price: product.price,
      unit: product.unit || "pieces",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.size) {
      setFormError("Name, Price, and Size are required fields.");
      return;
    }

    if (isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setFormError("Price must be a valid positive number.");
      return;
    }

    if (isNaN(formData.size) || parseFloat(formData.size) <= 0) {
      setFormError("Size must be a valid positive number.");
      return;
    }

    setFormError("");
    setSaving(true);

    try {
      const parsedData = { 
        ...formData, 
        price: parseFloat(formData.price),
        size: parseFloat(formData.size)
      };
      if (editingProduct) {
        // Edit Product
        const res = await API.patch(`/products/${editingProduct._id}`, parsedData);
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProduct._id ? res.data.data : p))
        );
      } else {
        // Create Product
        const res = await API.post("/products", parsedData);
        setProducts((prev) => [res.data.data, ...prev]);
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save product details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product from the inventory catalog?")) {
      return;
    }

    try {
      await API.delete(`/products/${productId}`);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      alert("Failed to delete product details.");
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
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Fetching inventory catalog...</p>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Product Inventory</h1>
          <p style={styles.subtitle}>Structure catalog entries, specify pricing tiers, and configure standard unit metrics</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAddModal}>
          <FiPlus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {error && <div style={styles.errorAlert}>{error}</div>}

      {products.length === 0 ? (
        <div className="glass-panel" style={styles.emptyState}>
          <FiLayers size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
          <h3>No Products Registered</h3>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Click 'Add Product' to establish inventory pricing indexes.</p>
          <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ marginTop: "16px" }}>
            Add Product
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {products.map((product) => (
            <div key={product._id} className="glass-panel glass-panel-hover" style={styles.card}>
              <div style={styles.cardHeader}>
                <div style={styles.priceTag}>
                  {formatCurrency(product.price)}
                  <span style={styles.unitText}>/ {product.size || "1"} {product.unit}</span>
                </div>
                <div style={styles.actions}>
                  <button style={styles.iconBtn} onClick={() => handleOpenEditModal(product)} title="Edit Product">
                    <FiEdit2 size={14} />
                  </button>
                  <button style={{ ...styles.iconBtn, color: "#f87171" }} onClick={() => handleDeleteProduct(product._id)} title="Delete Product">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={{ marginTop: "8px" }}>
                <h3 style={styles.cardName}>{product.name}</h3>
                {product.brandName && (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "-4px", marginBottom: "4px" }}>
                    Brand: {product.brandName}
                  </p>
                )}
                {product.description && (
                  <p style={styles.cardDesc}>{product.description}</p>
                )}
              </div>

              <div style={styles.badgeRow}>
                <div style={styles.badge}>
                  <FiTag size={12} />
                  <span>Pack Size: {product.size || "1"} {product.unit || "pieces"}</span>
                </div>
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
              <h2>{editingProduct ? "Edit Product" : "Add Product"}</h2>
              <button style={styles.modalCloseBtn} onClick={handleCloseModal}>
                <FiX size={20} />
              </button>
            </div>

            {formError && <div style={styles.errorAlert}>{formError}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="name">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  placeholder="e.g. Software Consulting or Steel Screws"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>


              <div style={styles.twoColumn}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="brandName">Product Brand Name</label>
                  <input
                    type="text"
                    id="brandName"
                    className="form-input"
                    placeholder="e.g. Parimal or Sawastik"
                    value={formData.brandName}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="price">Unit Price (INR) *</label>
                  <div style={styles.inputWithPrefix}>
                    <FaRupeeSign size={12} style={styles.prefixIcon} />
                    <input
                      type="number"
                      id="price"
                      step="0.01"
                      className="form-input"
                      style={{ paddingLeft: "32px" }}
                      placeholder="0.00"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={styles.twoColumn}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="size">Product Size *</label>
                  <input
                    type="number"
                    step="any"
                    min="0.001"
                    id="size"
                    className="form-input"
                    placeholder="e.g. 30, 1, 5"
                    value={formData.size}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="unit">Unit Metric *</label>
                  <select
                    id="unit"
                    className="form-input"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="pieces">pieces</option>
                    <option value="kg">kg</option>
                    <option value="g">g</option>
                    <option value="litre">litre</option>
                    <option value="ml">ml</option>
                  </select>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Product"}
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
    justifyContent: "space-between",
    gap: "16px",
    minHeight: "200px",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  priceTag: {
    fontSize: "1.2rem",
    fontWeight: "800",
    color: "var(--accent-emerald)",
    display: "inline-flex",
    alignItems: "baseline",
    gap: "4px",
  },
  unitText: {
    fontSize: "0.75rem",
    color: "var(--text-muted)",
    fontWeight: "500",
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
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "8px",
  },
  cardDesc: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
    lineHeight: "1.4",
    display: "-webkit-box",
    WebkitLineClamp: "3",
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  badgeRow: {
    display: "flex",
    marginTop: "auto",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 10px",
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid var(--glass-border)",
    borderRadius: "20px",
    fontSize: "0.75rem",
    color: "var(--text-secondary)",
    fontWeight: "500",
    textTransform: "uppercase",
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
    maxWidth: "500px",
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
  twoColumn: {
    display: "flex",
    gap: "16px",
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
};

export default Products;
