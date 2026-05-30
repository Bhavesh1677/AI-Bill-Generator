import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../utils/api";
import { FiPrinter, FiTrash2, FiArrowLeft, FiClock, FiFileText, FiCheckCircle } from "react-icons/fi";

const BillDetail = () => {
  const { id } = useParams();
  const [bill, setBill] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusUpdating, setStatusUpdating] = useState(false);

  const navigate = useNavigate();

  const fetchBillDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/bills/${id}`);
      setBill(res.data.data.bill);
      setItems(res.data.data.items);
    } catch (err) {
      setError("Failed to locate invoice statement. Ensure references exist.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBillDetails();
  }, [id]);

  const handleStatusChange = async (e) => {
    const nextStatus = e.target.value;
    setStatusUpdating(true);
    try {
      await API.patch(`/bills/${id}`, { status: nextStatus });
      setBill((prev) => ({ ...prev, status: nextStatus }));
    } catch (err) {
      alert("Failed to modify invoice status.");
      console.error(err);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDeleteBill = async () => {
    if (!window.confirm("Are you sure you want to permanently void and delete this invoice?")) {
      return;
    }

    try {
      await API.delete(`/bills/${id}`);
      navigate("/bills");
    } catch (err) {
      alert("Failed to delete invoice document.");
      console.error(err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
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
        <p style={{ marginTop: "12px", color: "var(--text-secondary)" }}>Populating billing details...</p>
      </div>
    );
  }

  if (error || !bill) {
    return (
      <div style={styles.centerContainer}>
        <div style={styles.errorBox}>
          <p>{error || "Invoice details not found."}</p>
          <Link to="/bills" className="btn btn-primary" style={{ marginTop: "12px" }}>
            Return to Bills
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in print-page-container">
      {/* Detail actions top panel */}
      <div style={styles.topActions} className="no-print">
        <Link to="/bills" style={styles.backBtn}>
          <FiArrowLeft size={16} />
          <span>Back to Invoices</span>
        </Link>

        <div style={styles.actionGroup}>
          <div className="form-group" style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600" }}>Change Status:</label>
            <select
              className="form-input"
              style={{ width: "120px", padding: "8px 12px" }}
              value={bill.status}
              onChange={handleStatusChange}
              disabled={statusUpdating}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <button className="btn btn-secondary" onClick={handlePrint}>
            <FiPrinter size={16} />
            <span>Print Invoice</span>
          </button>

          <button className="btn btn-danger" style={{ padding: "10px 16px" }} onClick={handleDeleteBill}>
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main invoice sheet */}
      <div className="glass-panel invoice-sheet" style={styles.sheet}>
        {/* Invoice Banner Header */}
        <div style={styles.sheetHeader}>
          <div>
            <div style={styles.brandRow}>
              <div style={styles.logoIcon}>⚡</div>
              <h2 style={styles.logoText}>Antigravity Bill</h2>
            </div>
            <p style={styles.issuerText}>Issued by: {bill.userId?.name || "Biller Profile"}</p>
            <p style={styles.issuerSubText}>{bill.userId?.email}</p>
          </div>

          <div style={{ textAlign: "right" }}>
            <h1 style={styles.billNumber}>{bill.billNumber}</h1>
            <span className={`status-badge ${getStatusBadge(bill.status)}`} style={{ marginTop: "10px" }}>
              {bill.status}
            </span>
          </div>
        </div>

        <div style={styles.divider}></div>

        {/* Address Cards */}
        <div style={styles.addressSection}>
          <div style={styles.addressCard}>
            <h4 style={styles.addressTitle}>Bill To:</h4>
            {bill.clientId ? (
              <>
                <p style={styles.clientName}>{bill.clientId.name}</p>
                <p style={styles.addressLine}>{bill.clientId.email}</p>
                {bill.clientId.phone && <p style={styles.addressLine}>Phone: {bill.clientId.phone}</p>}
                {bill.clientId.address && <p style={styles.addressLine}>{bill.clientId.address}</p>}
              </>
            ) : (
              <p style={{ ...styles.addressLine, color: "var(--accent-coral)", fontWeight: "600" }}>[Client Profile Deleted]</p>
            )}
          </div>

          <div style={styles.metaCard}>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Issue Date:</span>
              <span style={styles.metaVal}>{new Date(bill.issueDate).toLocaleDateString()}</span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Due Date:</span>
              <span style={{ ...styles.metaVal, color: "var(--accent-amber)" }}>
                {new Date(bill.dueDate).toLocaleDateString()}
              </span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Payment Terms:</span>
              <span style={styles.metaVal}>Net 15</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <div style={{ marginTop: "40px" }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={styles.th}>Product / Service</th>
                <th style={styles.th}>Description</th>
                <th style={{ ...styles.th, textAlign: "center" }}>Qty</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Unit Price</th>
                <th style={{ ...styles.th, textAlign: "right" }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} style={styles.tr}>
                  <td style={{ ...styles.td, fontWeight: "600", color: "#ffffff" }} className="print-dark-text">
                    {item.productId?.name || "Deleted Product Item"}
                  </td>
                  <td style={styles.td}>
                    {item.productId?.description || "Catalogue entry specifications."}
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}>{item.quantity}</td>
                  <td style={{ ...styles.td, textAlign: "right" }}>{formatCurrency(item.unitPrice)}</td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: "600", color: "#ffffff" }} className="print-dark-text">
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Balance aggregates */}
        <div style={styles.totalSection}>
          <div style={styles.termsNotes}>
            <h4 style={{ ...styles.addressTitle, marginBottom: "8px" }}>Terms & Notes</h4>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: "1.4" }}>
              Please remit payments by the specified due date. Late balances will accumulate standard finance interest
              charges. Thank you for doing business with us!
            </p>
          </div>

          <div style={styles.totalBlock}>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Subtotal:</span>
              <span style={styles.totalVal}>{formatCurrency(bill.total)}</span>
            </div>
            <div style={styles.totalRow}>
              <span style={styles.totalLabel}>Taxes & VAT (0%):</span>
              <span style={styles.totalVal}>$0.00</span>
            </div>
            <div style={{ ...styles.divider, margin: "12px 0" }}></div>
            <div style={styles.totalRow}>
              <span style={{ ...styles.totalLabel, fontSize: "1.1rem", color: "#ffffff" }} className="print-dark-text">Total Due:</span>
              <span style={styles.grandValue}>{formatCurrency(bill.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  topActions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "30px",
    gap: "16px",
    flexWrap: "wrap",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "600",
  },
  actionGroup: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  sheet: {
    padding: "50px",
    background: "rgba(15, 21, 36, 0.7)",
  },
  sheetHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "16px",
  },
  logoIcon: {
    fontSize: "1.4rem",
    background: "rgba(59, 130, 246, 0.15)",
    width: "36px",
    height: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "8px",
    color: "var(--accent-blue)",
  },
  logoText: {
    fontSize: "1.25rem",
    fontWeight: "800",
    color: "#ffffff",
  },
  issuerText: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#ffffff",
  },
  issuerSubText: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
  },
  billNumber: {
    fontSize: "1.8rem",
    fontWeight: "800",
    color: "var(--accent-blue)",
  },
  divider: {
    height: "1px",
    background: "var(--glass-border)",
    width: "100%",
    margin: "30px 0",
  },
  addressSection: {
    display: "flex",
    justifyContent: "space-between",
    gap: "40px",
    flexWrap: "wrap",
  },
  addressCard: {
    flex: 1,
    minWidth: "220px",
  },
  metaCard: {
    width: "260px",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid var(--glass-border)",
    borderRadius: "var(--border-radius-md)",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  addressTitle: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "12px",
  },
  clientName: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "6px",
  },
  addressLine: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
    marginBottom: "4px",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.9rem",
  },
  metaLabel: {
    color: "var(--text-secondary)",
  },
  metaVal: {
    color: "#ffffff",
    fontWeight: "600",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
  },
  tableHeaderRow: {
    borderBottom: "2px solid var(--glass-border)",
  },
  th: {
    padding: "12px 16px",
    fontSize: "0.8rem",
    fontWeight: "600",
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  tr: {
    borderBottom: "1px solid var(--glass-border)",
  },
  td: {
    padding: "16px",
    fontSize: "0.95rem",
    color: "var(--text-secondary)",
  },
  totalSection: {
    display: "flex",
    justifyContent: "space-between",
    gap: "40px",
    marginTop: "40px",
    flexWrap: "wrap-reverse",
  },
  termsNotes: {
    flex: 1.2,
    minWidth: "250px",
  },
  totalBlock: {
    width: "280px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.95rem",
  },
  totalLabel: {
    color: "var(--text-secondary)",
  },
  totalVal: {
    color: "#ffffff",
    fontWeight: "600",
  },
  grandValue: {
    fontSize: "1.4rem",
    fontWeight: "800",
    color: "var(--accent-emerald)",
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
  },
};

// Global print specific stylesheets injected into window header
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    @media print {
      body {
        background: #ffffff !important;
        color: #000000 !important;
      }
      .no-print {
        display: none !important;
      }
      aside {
        display: none !important;
      }
      .main-content {
        margin-left: 0 !important;
        padding: 0 !important;
        width: 100% !important;
      }
      .invoice-sheet {
        background: #ffffff !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        color: #000000 !important;
      }
      .print-page-container {
        padding: 0 !important;
      }
      .print-dark-text {
        color: #000000 !important;
      }
      td, th {
        color: #000000 !important;
        border-bottom-color: #dddddd !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default BillDetail;
