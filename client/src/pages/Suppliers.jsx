import React, { useState, useEffect } from "react";
import API from "../utils/api";
import { FiPlus, FiEdit2, FiTrash2, FiMail, FiPhone, FiMapPin, FiX, FiUsers, FiLayers } from "react-icons/fi";
import { FaRupeeSign } from "react-icons/fa";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Supplier CRUD Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({ name: "", contactPerson: "", email: "", phone: "", address: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  // Restocking Modal states
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [activeSupplier, setActiveSupplier] = useState(null);
  const [restockProductId, setRestockProductId] = useState("");
  const [restockQty, setRestockQty] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [restockError, setRestockError] = useState("");
  const [restockSaving, setRestockSaving] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [suppliersRes, productsRes] = await Promise.all([
        API.get("/suppliers"),
        API.get("/products")
      ]);
      setSuppliers(suppliersRes.data.data);
      setProducts(productsRes.data.data);
    } catch (err) {
      setError("Failed to fetch suppliers or product list.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormData({ name: "", contactPerson: "", email: "", phone: "", address: "" });
    setFormError("");
    setShowModal(true);
  };

  const handleOpenEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSupplier(null);
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      setFormError("Supplier Name is required.");
      return;
    }

    setFormError("");
    setSaving(true);

    try {
      if (editingSupplier) {
        // Edit Supplier
        const res = await API.patch(`/suppliers/${editingSupplier._id}`, formData);
        setSuppliers((prev) =>
          prev.map((s) => (s._id === editingSupplier._id ? res.data.data : s))
        );
      } else {
        // Create Supplier
        const res = await API.post("/suppliers", formData);
        setSuppliers((prev) => [res.data.data, ...prev]);
      }
      handleCloseModal();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save supplier details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (!window.confirm("Are you sure you want to delete this supplier?")) {
      return;
    }

    try {
      await API.delete(`/suppliers/${supplierId}`);
      setSuppliers((prev) => prev.filter((s) => s._id !== supplierId));
    } catch (err) {
      alert("Failed to delete supplier.");
      console.error(err);
    }
  };

  // Restocking handlers
  const handleOpenRestockModal = (supplier) => {
    setActiveSupplier(supplier);
    setRestockProductId("");
    setRestockQty("");
    setPurchasePrice("");
    setRestockError("");
    setShowRestockModal(true);
  };

  const handleRestockProductChange = (productId) => {
    setRestockProductId(productId);
    const prod = products.find((p) => p._id === productId);
    if (prod) {
      setPurchasePrice(prod.costPrice !== undefined ? prod.costPrice.toString() : prod.price.toString());
    } else {
      setPurchasePrice("");
    }
  };

  const handleRestockSubmit = async (e) => {
    e.preventDefault();
    if (!restockProductId || !restockQty || parseFloat(restockQty) <= 0) {
      setRestockError("Please select a product and enter a positive quantity.");
      return;
    }

    setRestockSaving(true);
    setRestockError("");

    try {
      await API.post(`/suppliers/restock/${restockProductId}`, {
        supplierId: activeSupplier._id,
        quantity: parseFloat(restockQty),
        purchasePrice: parseFloat(purchasePrice || 0)
      });

      // Refresh products to show updated stock levels
      const productsRes = await API.get("/products");
      setProducts(productsRes.data.data);

      setShowRestockModal(false);
      setActiveSupplier(null);
      alert("Inventory restocked successfully!");
    } catch (err) {
      setRestockError(err.response?.data?.message || "Failed to process restocking order.");
    } finally {
      setRestockSaving(false);
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
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Fetching supplier registry...</p>
      </div>
    );
  }

  return (
    <>
      <div className="animate-fade-in">
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Suppliers Directory</h1>
            <p style={styles.subtitle}>Coordinate wholesalers, manage vendors, and restock store inventory</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <FiPlus size={16} />
            <span>Add Supplier</span>
          </button>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        {suppliers.length === 0 ? (
          <div className="glass-panel" style={styles.emptyState}>
            <FiUsers size={48} style={{ color: "var(--text-muted)", marginBottom: "16px" }} />
            <h3>No Suppliers Found</h3>
            <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Create supplier profiles to coordinate bulk restocking orders.</p>
            <button className="btn btn-primary" onClick={handleOpenAddModal} style={{ marginTop: "16px" }}>
              Add Supplier
            </button>
          </div>
        ) : (
          <div style={styles.grid}>
            {suppliers.map((supplier) => (
              <div key={supplier._id} className="glass-panel glass-panel-hover" style={styles.card}>
                <div style={styles.cardHeader}>
                  <div style={styles.avatar}>
                    {supplier.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div style={styles.actions}>
                    <button style={styles.iconBtn} onClick={() => handleOpenEditModal(supplier)} title="Edit Supplier">
                      <FiEdit2 size={14} />
                    </button>
                    <button style={{ ...styles.iconBtn, color: "#f87171" }} onClick={() => handleDeleteSupplier(supplier._id)} title="Delete Supplier">
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 style={styles.cardName}>{supplier.name}</h3>
                {supplier.contactPerson && (
                  <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "-12px", marginBottom: "4px" }}>
                    Contact Person: {supplier.contactPerson}
                  </p>
                )}

                <div style={styles.cardDetails}>
                  {supplier.email && (
                    <div style={styles.detailRow}>
                      <FiMail size={14} style={styles.detailIcon} />
                      <span style={styles.detailText}>{supplier.email}</span>
                    </div>
                  )}
                  {supplier.phone && (
                    <div style={styles.detailRow}>
                      <FiPhone size={14} style={styles.detailIcon} />
                      <span style={styles.detailText}>{supplier.phone}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div style={styles.detailRow}>
                      <FiMapPin size={14} style={styles.detailIcon} />
                      <span style={styles.detailText}>{supplier.address}</span>
                    </div>
                  )}
                </div>

                <div style={styles.cardActionsRow}>
                  <button
                    className="btn btn-primary"
                    style={{ padding: "8px 12px", fontSize: "0.8rem", width: "100%" }}
                    onClick={() => handleOpenRestockModal(supplier)}
                  >
                    ⚡ Restock Products
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Supplier CRUD Modal */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel animate-fade-in" style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <h2>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</h2>
              <button style={styles.modalCloseBtn} onClick={handleCloseModal}>
                <FiX size={20} />
              </button>
            </div>

            {formError && <div style={styles.errorAlert}>{formError}</div>}

            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label htmlFor="name">Supplier Name *</label>
                <input
                  type="text"
                  id="name"
                  className="form-input"
                  placeholder="e.g. Reliance Wholesalers"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="contactPerson">Contact Person</label>
                <input
                  type="text"
                  id="contactPerson"
                  className="form-input"
                  placeholder="e.g. Ramesh Kumar"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  className="form-input"
                  placeholder="e.g. contact@wholesaler.com"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="text"
                  id="phone"
                  className="form-input"
                  placeholder="e.g. +91 99999 88888"
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
                  placeholder="e.g. Sector 15, Warehouse Hub"
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

      {/* Supplier Restocking Modal */}
      {showRestockModal && activeSupplier && (
        <div style={styles.modalOverlay}>
          <div className="glass-panel animate-fade-in" style={styles.modalContainer}>
            <div style={styles.modalHeader}>
              <h2>Inventory Restocking</h2>
              <button style={styles.modalCloseBtn} onClick={() => { setShowRestockModal(false); setActiveSupplier(null); }}>
                <FiX size={20} />
              </button>
            </div>

            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Order restocking from <strong>{activeSupplier.name}</strong> to automatically increment catalog inventory counts.
            </p>

            {restockError && <div style={styles.errorAlert}>{restockError}</div>}

            <form onSubmit={handleRestockSubmit}>
              <div className="form-group">
                <label htmlFor="restockProduct">Select Product *</label>
                <select
                  id="restockProduct"
                  className="form-input"
                  value={restockProductId}
                  onChange={(e) => handleRestockProductChange(e.target.value)}
                  required
                >
                  <option value="">-- Choose Product --</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} (Current Stock: {p.stockQuantity} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.twoColumn}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="restockQty">Quantity *</label>
                  <input
                    type="number"
                    id="restockQty"
                    className="form-input"
                    placeholder="e.g. 100"
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group" style={{ flex: 1 }}>
                  <label htmlFor="purchasePrice">Purchase Price (Per Unit)</label>
                  <div style={styles.inputWithPrefix}>
                    <FaRupeeSign size={12} style={styles.prefixIcon} />
                    <input
                      type="number"
                      id="purchasePrice"
                      step="0.01"
                      className="form-input"
                      style={{ paddingLeft: "32px" }}
                      placeholder="0.00"
                      value={purchasePrice}
                      onChange={(e) => setPurchasePrice(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => { setShowRestockModal(false); setActiveSupplier(null); }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={restockSaving}>
                  {restockSaving ? "Restocking..." : "Log Restock"}
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
    margin: 0,
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

export default Suppliers;
