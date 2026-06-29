import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../utils/api";
import { FiPrinter, FiTrash2, FiArrowLeft } from "react-icons/fi";

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
    if (id) {
      fetchBillDetails();
    }
  }, [id]);

  const handleStatusChange = async (e) => {
    const nextStatus = e.target.value;
    setStatusUpdating(true);
    try {
      await API.patch(`/bills/${id}/status`, { status: nextStatus });
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
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
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

  const upiId = bill.userId?.upiId;
  const totalQtySum = items.reduce((sum, item) => sum + (item.billingQuantity !== undefined ? item.billingQuantity : item.quantity || 0), 0);
  
  const formatSizeWithUnit = (size, unit) => {
    if (!size) return "-";
    const sizeStr = size.toString().trim();
    if (/[a-zA-Z]$/.test(sizeStr)) {
      return sizeStr;
    }
    const displayUnit = unit || "";
    return `${sizeStr}${displayUnit}`.trim();
  };

  const issueDateFormatted = new Date(bill.issueDate).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "numeric",
    year: "numeric"
  });
  const dueDateFormatted = bill.dueDate 
    ? new Date(bill.dueDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "numeric",
        year: "numeric"
      })
    : "N/A";

  return (
    <div className="animate-fade-in print-page-container" style={{ paddingBottom: "50px" }}>
      {/* Detail actions top panel */}
      <div style={styles.topActions} className="no-print">
        <Link to="/bills" style={styles.backBtn}>
          <FiArrowLeft size={16} />
          <span>Back to Bills</span>
        </Link>

        <div style={styles.actionGroup}>
          <div className="form-group" style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <label style={{ margin: 0, fontSize: "0.85rem", fontWeight: "600", color: "#fff" }}>Change Status:</label>
            <select
              className="form-input"
              style={{ width: "120px", padding: "8px 12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", borderRadius: "8px" }}
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

          <button className="btn btn-secondary" onClick={handlePrint} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <FiPrinter size={16} />
            <span>Print Bill</span>
          </button>

          <button className="btn btn-danger" style={{ padding: "10px 16px", display: "inline-flex", alignItems: "center" }} onClick={handleDeleteBill}>
            <FiTrash2 size={16} />
          </button>
        </div>
      </div>

      {/* Main Modern Minimalist Bill Sheet */}
      <div className="invoice-sheet-modern" style={styles.sheet}>
        
        {/* HEADER SECTION */}
        <div style={styles.headerRow}>
          <div>
            {bill.userId?.businessLogo ? (
              <img
                src={bill.userId.businessLogo}
                alt={bill.userId?.businessName || "Business Logo"}
                style={styles.logoImage}
              />
            ) : (
              <h1 style={styles.invoiceTitle}>INVOICE</h1>
            )}
            <span style={styles.invoiceNumber}>#{bill.billNumber}</span>
          </div>

          <div style={styles.datesContainer}>
            <div style={styles.dateBlock}>
              <span style={styles.metaLabel}>DATE</span>
              <span style={styles.metaValue}>{issueDateFormatted}</span>
            </div>
            <div style={styles.dateBlock}>
              <span style={styles.metaLabel}>DUE DATE</span>
              <span style={styles.metaValue}>{dueDateFormatted}</span>
            </div>
          </div>
        </div>

        <div style={styles.divider}></div>

        {/* ADDRESSES SECTION */}
        <div style={styles.addressesRow}>
          {/* FROM seller */}
          <div style={styles.addressBlock}>
            <span style={styles.addressLabel}>FROM</span>
            <h4 style={styles.addressName}>{bill.userId?.businessName || bill.userId?.name || "Biller Profile"}</h4>
            {bill.userId?.businessName && (
              <p style={styles.addressSubtext}>Owner: {bill.userId?.name}</p>
            )}
            <p style={styles.addressSubtext}>{bill.userId?.address || "No address provided"}</p>
            <p style={styles.addressSubtext}>{bill.userId?.phone && `Mobile: ${bill.userId?.phone}`}</p>
            <p style={styles.addressSubtext}>{bill.userId?.email}</p>
          </div>

          {/* BILLED TO client */}
          <div style={styles.addressBlock}>
            <span style={styles.addressLabel}>BILLED TO</span>
            {bill.clientId ? (
              <>
                <h4 style={styles.addressName}>{bill.clientId.businessName || bill.clientId.name}</h4>
                {bill.clientId.businessName && (
                  <p style={styles.addressSubtext}>Contact: {bill.clientId.name}</p>
                )}
                {bill.clientId.address && (
                  <p style={styles.addressSubtext}>{bill.clientId.address}</p>
                )}
                {bill.clientId.phone && (
                  <p style={styles.addressSubtext}>Mobile: {bill.clientId.phone}</p>
                )}
              </>
            ) : bill.customerName ? (
              <>
                <h4 style={styles.addressName}>{bill.customerName}</h4>
                {bill.customerPhone && (
                  <p style={styles.addressSubtext}>Mobile: {bill.customerPhone}</p>
                )}
              </>
            ) : (
              <h4 style={styles.addressName}>Walk-in Customer</h4>
            )}
          </div>
        </div>

        {/* ITEMS TABLE SECTION */}
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeaderRow}>
                <th style={{ ...styles.th, textAlign: "left", width: "40%" }}>ITEM</th>
                <th style={{ ...styles.th, textAlign: "left", width: "15%" }}>BRAND NAME</th>
                <th style={{ ...styles.th, textAlign: "center", width: "10%" }}>SIZE</th>
                <th style={{ ...styles.th, textAlign: "center", width: "10%" }}>TOTAL QTY</th>
                <th style={{ ...styles.th, textAlign: "right", width: "10%" }}>RATE</th>
                <th style={{ ...styles.th, textAlign: "right", width: "15%" }}>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} style={styles.tr}>
                  <td style={{ ...styles.td, textAlign: "left", fontWeight: "600" }}>
                    {item.productId?.name || "Deleted Product Item"}
                  </td>
                  <td style={{ ...styles.td, textAlign: "left" }}>
                    {item.brandName || "-"}
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    {formatSizeWithUnit(item.size, item.billingUnit || item.productId?.unit)}
                  </td>
                  <td style={{ ...styles.td, textAlign: "center" }}>
                    {item.billingQuantity !== undefined ? item.billingQuantity : item.quantity}
                  </td>
                  <td style={{ ...styles.td, textAlign: "right" }}>
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td style={{ ...styles.td, textAlign: "right", fontWeight: "600" }}>
                    {formatCurrency(item.subtotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAYMENT & TOTALS SECTION */}
        <div style={styles.totalsSection}>
          {/* UPI Payment Box (Left side) */}
          <div style={styles.paymentBox}>
            <div style={styles.paymentBoxCard}>
              {upiId ? (
                <div style={styles.qrPaymentContainerOnly}>
                  <div style={styles.qrImageWrapperOnly}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
                        `upi://pay?pa=${upiId}&pn=${encodeURIComponent(bill.userId?.name || "Merchant")}&am=${bill.total}&cu=INR`
                      )}`} 
                      alt="UPI QR Code" 
                      style={styles.qrCodeImageOnly} 
                    />
                  </div>
                </div>
              ) : (
                <span style={styles.paymentBoxPlaceholder}>UPI ID not configured. Configure in profile settings.</span>
              )}
            </div>
          </div>

          {/* Shaded Totals Container (Right side) */}
          <div style={styles.totalsContainer}>
            <div style={styles.totalsRow}>
              <span style={styles.totalsLabel}>Total Items</span>
              <span style={styles.totalsValue}>{items.length}</span>
            </div>
            <div style={styles.totalsRow}>
              <span style={styles.totalsLabel}>Total Quantity</span>
              <span style={styles.totalsValue}>{totalQtySum}</span>
            </div>
            <div style={styles.totalsDivider}></div>
            <div style={styles.totalsRow}>
              <span style={{ ...styles.totalsLabel, fontWeight: "700" }}>Total Due</span>
              <span style={styles.grandTotalValue}>{formatCurrency(bill.total)}</span>
            </div>
          </div>
        </div>

        {/* NOTES SECTION */}
        <div style={styles.notesSection}>
          <span style={styles.notesLabel}>NOTES</span>
          <p style={styles.notesText}>Thank you for your business!</p>
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
    background: "#ffffff",
    color: "#1e293b",
    display: "flex",
    flexDirection: "column",
    gap: "35px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px -5px rgba(0,0,0,0.15)",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: "850px",
    margin: "0 auto",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  logoImage: {
    maxHeight: "65px",
    maxWidth: "200px",
    objectFit: "contain",
    marginBottom: "4px",
    display: "block",
  },
  invoiceTitle: {
    fontSize: "2.25rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.5px",
  },
  invoiceNumber: {
    fontSize: "0.875rem",
    color: "#64748b",
    fontWeight: "600",
    marginTop: "2px",
    display: "block",
  },
  datesContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    textAlign: "right",
  },
  dateBlock: {
    display: "flex",
    flexDirection: "column",
  },
  metaLabel: {
    fontSize: "0.68rem",
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: "1px",
  },
  metaValue: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#334155",
    marginTop: "2px",
  },
  divider: {
    height: "1px",
    background: "#e2e8f0",
    width: "100%",
    margin: "5px 0",
  },
  addressesRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
  },
  addressBlock: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
  },
  addressLabel: {
    fontSize: "0.68rem",
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: "1.2px",
    marginBottom: "6px",
    display: "block",
  },
  addressName: {
    fontSize: "1rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 2px 0",
  },
  addressSubtext: {
    fontSize: "0.85rem",
    color: "#64748b",
    margin: 0,
    lineHeight: "1.4",
  },
  tableContainer: {
    width: "100%",
    marginTop: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  tableHeaderRow: {
    borderBottom: "1px solid #cbd5e1",
  },
  th: {
    padding: "8px 0 12px 0",
    fontSize: "0.68rem",
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: "1.2px",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "16px 0",
    fontSize: "0.875rem",
    color: "#334155",
  },
  totalsSection: {
    display: "flex",
    justifyContent: "space-between",
    gap: "30px",
    alignItems: "flex-start",
    width: "100%",
    marginTop: "10px",
  },
  paymentBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "45%",
  },
  paymentBoxLabel: {
    fontSize: "0.68rem",
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: "1.2px",
  },
  paymentBoxCard: {
    background: "#f1f5f9",
    borderRadius: "8px",
    padding: "16px",
    display: "flex",
    alignItems: "center",
  },
  paymentBoxValue: {
    fontSize: "0.9rem",
    fontWeight: "700",
    color: "#0f172a",
    fontFamily: "monospace",
    wordBreak: "break-all",
  },
  paymentBoxPlaceholder: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    fontStyle: "italic",
  },
  qrPaymentContainerOnly: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  qrImageWrapperOnly: {
    background: "#ffffff",
    padding: "6px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "132px",
    height: "132px",
  },
  qrCodeImageOnly: {
    width: "120px",
    height: "120px",
    display: "block",
  },
  totalsContainer: {
    background: "#f8fafc",
    borderRadius: "8px",
    padding: "18px 20px",
    width: "45%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  totalsRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "0.875rem",
  },
  totalsLabel: {
    color: "#64748b",
    fontWeight: "500",
  },
  totalsValue: {
    color: "#334155",
    fontWeight: "600",
  },
  totalsDivider: {
    height: "1px",
    background: "#cbd5e1",
    margin: "4px 0",
  },
  grandTotalValue: {
    fontSize: "1.15rem",
    fontWeight: "800",
    color: "#2563eb",
  },
  notesSection: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    marginTop: "10px",
  },
  notesLabel: {
    fontSize: "0.68rem",
    fontWeight: "800",
    color: "#64748b",
    letterSpacing: "1.2px",
  },
  notesText: {
    fontSize: "0.875rem",
    color: "#64748b",
    margin: 0,
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
      @page {
        margin: 0;
      }
      body {
        background: #ffffff !important;
        color: #1e293b !important;
        padding: 1.6cm !important;
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
      .invoice-sheet-modern {
        background: #ffffff !important;
        border: none !important;
        box-shadow: none !important;
        padding: 0 !important;
        color: #1e293b !important;
        margin: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      .print-page-container {
        padding: 0 !important;
      }
    }
  `;
  document.head.appendChild(styleSheet);
}

export default BillDetail;
