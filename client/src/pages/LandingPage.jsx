import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiArrowRight, FiCheck, FiCpu, FiUsers, FiBox, FiTrendingUp, FiShoppingBag, FiLayers } from "react-icons/fi";

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const features = [
    {
      icon: <FiShoppingBag size={24} />,
      title: "Fast POS Checkout",
      desc: "Process custom cart checkouts in seconds. Search, select, and process walk-in or regular customer transactions seamlessly."
    },
    {
      icon: <FiUsers size={24} />,
      title: "Digital Khata Ledger",
      desc: "Track store credits and payments for loyal shoppers. Record cash repayments, outstanding debts, and limit extensions with one click."
    },
    {
      icon: <FiBox size={24} />,
      title: "Inventory stock management",
      desc: "Real-time stock level monitoring. Highlight low-stock or out-of-stock items dynamically before running out of inventory."
    },
    {
      icon: <FiCpu size={24} />,
      title: "Supplier restock integration",
      desc: "Coordinate with wholesalers and log bulk purchase restock events to immediately reconcile inventory records."
    },
    {
      icon: <FiTrendingUp size={24} />,
      title: "Sales & margin analytics",
      desc: "Review daily sales metrics, compute net margins based on cost prices, and analyze walk-in vs ledger transaction modes."
    },
    {
      icon: <FiLayers size={24} />,
      title: "Offline-First styling",
      desc: "Sleek, blur-morphic dark design tailored to look premium on local convenience screens and high-resolution monitors."
    }
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "₹0",
      desc: "Ideal for single-cashier local mom-and-pop grocery stores.",
      features: [
        "Up to 50 Products",
        "Basic POS Checkout",
        "Digital Khata for 10 Customers",
        "Standard Stock Level Badges",
        "Community Support"
      ],
      cta: "Get Started Free",
      popular: false
    },
    {
      name: "Supermarket Pro",
      price: "₹899",
      period: "/month",
      desc: "For growing retail businesses and mid-sized departmental stores.",
      features: [
        "Unlimited Products",
        "Category Grid & Fast Barcode POS",
        "Unlimited Customer Credit Ledgers",
        "Supplier restock portal",
        "Profit margin calculators",
        "Priority 24/7 Support"
      ],
      cta: "Unlock Pro Power",
      popular: true
    },
    {
      name: "Enterprise Multi-Store",
      price: "Custom",
      desc: "For chains needing multi-register sync and wholesale operations.",
      features: [
        "Everything in Pro",
        "Multi-Store Inventory Sync",
        "Advanced Supplier Purchase API",
        "Dedicated Server Hosting",
        "Custom SSL & Branding",
        "Dedicated Account Manager"
      ],
      cta: "Contact Enterprise",
      popular: false
    }
  ];

  return (
    <div style={styles.page}>
      {/* Navbar Header */}
      <header style={styles.navHeader}>
        <div style={styles.brandContainer}>
          <img src="/logo.png" alt="Logo" style={styles.logoIcon} />
          <span style={styles.brandName}>Store POS</span>
        </div>
        <div style={styles.navLinks}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#pricing" style={styles.navLink}>Pricing</a>
          {user ? (
            <Link to="/dashboard" className="btn btn-primary" style={styles.navCta}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" style={styles.loginBtn}>Sign In</Link>
              <Link to="/signup" className="btn btn-primary" style={styles.navCta}>
                Register Free
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroGlow}></div>
        <div style={styles.heroContent}>
          <div style={styles.pillBadge}>
            🚀 Transformed for Grocery Store Managers
          </div>
          <h1 style={styles.heroTitle}>
            Modern POS & Credit Ledger <br />
            <span style={styles.gradientText}>For Smart Retailers</span>
          </h1>
          <p style={styles.heroSubtitle}>
            Consolidate your point-of-sale checkout, customer credit registers (Khata), real-time stock limits, and wholesale supplier ordering under one unified, premium dashboard.
          </p>

          <div style={styles.heroCtas}>
            {user ? (
              <button onClick={() => navigate("/dashboard")} className="btn btn-primary" style={styles.primaryCta}>
                <span>Enter Workspace</span>
                <FiArrowRight size={18} />
              </button>
            ) : (
              <>
                <button onClick={() => navigate("/signup")} className="btn btn-primary" style={styles.primaryCta}>
                  <span>Start Free Trial</span>
                  <FiArrowRight size={18} />
                </button>
                <button onClick={() => navigate("/login")} style={styles.secondaryCta}>
                  Live Demo
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic Graphic Preview */}
        <div style={styles.previewContainer} className="hero-preview-hover">
          <div style={styles.previewHeader}>
            <div style={styles.previewDotRed}></div>
            <div style={styles.previewDotYellow}></div>
            <div style={styles.previewDotGreen}></div>
            <span style={styles.previewTitle}>Store POS - Cashier Interface</span>
          </div>
          <div style={styles.previewBody}>
            <div style={styles.dummyPOS}>
              <div style={styles.dummyLeft}>
                <div style={styles.dummySearch}>Search groceries...</div>
                <div style={styles.dummyGrid}>
                  <div style={styles.dummyProductCard}>🥛 Milk (Dairy)</div>
                  <div style={styles.dummyProductCard}>🍎 Apples (Fresh)</div>
                  <div style={styles.dummyProductCard}>🍞 Bread (Bakery)</div>
                  <div style={styles.dummyProductCard}>🍪 Cookies (Snacks)</div>
                </div>
              </div>
              <div style={styles.dummyRight}>
                <div style={styles.dummyCartHeader}>Order Basket</div>
                <div style={styles.dummyCartItem}>1x Organic Milk - ₹60</div>
                <div style={styles.dummyCartItem}>2x Sweet Apples - ₹120</div>
                <div style={styles.dummyCartTotal}>Total: ₹180</div>
                <div style={styles.dummyPayMethod}>
                  <span style={styles.activePay}>Store Credit (Khata)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" style={styles.featuresSection}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={styles.sectionTitle}>Engineered for Retail Excellence</h2>
          <p style={styles.sectionSubtitle}>Say goodbye to notebook calculations. Manage your general store digitally.</p>
        </div>

        <div style={styles.featuresGrid}>
          {features.map((feat, idx) => (
            <div key={idx} className="glass-panel glass-panel-hover" style={styles.featureCard}>
              <div style={styles.featureIcon}>{feat.icon}</div>
              <h3 style={styles.featureTitle}>{feat.title}</h3>
              <p style={styles.featureDesc}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" style={styles.pricingSection}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <h2 style={styles.sectionTitle}>Simple, Transparent Pricing</h2>
          <p style={styles.sectionSubtitle}>Start managing your store for free, and scale features as you expand.</p>
        </div>

        <div style={styles.pricingGrid}>
          {pricingTiers.map((tier, idx) => (
            <div
              key={idx}
              className={`glass-panel ${tier.popular ? "pricing-popular-glow" : ""}`}
              style={{
                ...styles.pricingCard,
                border: tier.popular ? "1px solid var(--accent-blue)" : "1px solid var(--glass-border)"
              }}
            >
              {tier.popular && <span style={styles.popularBadge}>Most Popular</span>}
              <h3 style={styles.pricingName}>{tier.name}</h3>
              <p style={styles.pricingDesc}>{tier.desc}</p>
              <div style={styles.priceRow}>
                <span style={styles.priceVal}>{tier.price}</span>
                {tier.period && <span style={styles.pricePeriod}>{tier.period}</span>}
              </div>

              <div style={styles.pricingFeaturesList}>
                {tier.features.map((f, i) => (
                  <div key={i} style={styles.pricingFeatureItem}>
                    <FiCheck size={16} style={{ color: "var(--accent-emerald)", flexShrink: 0 }} />
                    <span style={{ color: "var(--text-secondary)" }}>{f}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => navigate(user ? "/dashboard" : "/signup")}
                className={`btn ${tier.popular ? "btn-primary" : "btn-secondary"}`}
                style={{ width: "100%", marginTop: "auto" }}
              >
                {tier.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Footer Section */}
      <section style={styles.ctaBanner}>
        <div style={styles.bannerGlow}></div>
        <h2 style={styles.bannerTitle}>Ready to Digitalize Your Store?</h2>
        <p style={styles.bannerSubtitle}>
          Join thousands of smart retailers tracking daily sales and maintaining online customer ledgers.
        </p>
        <button
          onClick={() => navigate(user ? "/dashboard" : "/signup")}
          className="btn btn-primary"
          style={{ padding: "14px 28px", fontSize: "1rem" }}
        >
          {user ? "Go to Dashboard" : "Register Free Account"}
        </button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <p>© 2026 Store POS System. Crafted by Antigravity Team. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

const styles = {
  page: {
    backgroundColor: "#060911",
    color: "#ffffff",
    fontFamily: "'Outfit', sans-serif",
    minHeight: "100vh",
    overflowX: "hidden",
  },
  navHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "24px 6%",
    background: "rgba(6, 9, 17, 0.7)",
    backdropFilter: "blur(12px)",
    position: "sticky",
    top: 0,
    zIndex: 500,
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  brandContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    objectFit: "contain",
  },
  brandName: {
    fontSize: "1.25rem",
    fontWeight: "800",
    letterSpacing: "0.5px",
    background: "linear-gradient(135deg, #ffffff 40%, var(--text-secondary) 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  navLink: {
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "500",
    transition: "color 0.2s ease",
  },
  loginBtn: {
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "0.95rem",
    fontWeight: "600",
    marginRight: "8px",
  },
  navCta: {
    padding: "8px 18px",
    fontSize: "0.9rem",
  },
  hero: {
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "100px 20px 80px 20px",
    zIndex: 10,
  },
  heroGlow: {
    position: "absolute",
    width: "50vw",
    height: "50vw",
    background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 60%)",
    top: "10%",
    zIndex: -1,
  },
  heroContent: {
    maxWidth: "800px",
    marginBottom: "50px",
  },
  pillBadge: {
    display: "inline-block",
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    color: "var(--accent-blue)",
    borderRadius: "20px",
    padding: "6px 16px",
    fontSize: "0.85rem",
    fontWeight: "600",
    marginBottom: "24px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  heroTitle: {
    fontSize: "3.2rem",
    fontWeight: "900",
    lineHeight: "1.15",
    color: "#ffffff",
    letterSpacing: "-1px",
  },
  gradientText: {
    background: "linear-gradient(135deg, var(--accent-blue) 0%, #10b981 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "1.15rem",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
    marginTop: "20px",
    marginBottom: "35px",
  },
  heroCtas: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
  },
  primaryCta: {
    padding: "14px 28px",
    fontSize: "1rem",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  secondaryCta: {
    background: "rgba(255, 255, 255, 0.04)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "8px",
    color: "#ffffff",
    padding: "14px 28px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  previewContainer: {
    width: "90%",
    maxWidth: "960px",
    background: "rgba(10, 15, 30, 0.8)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "16px",
    boxShadow: "0 25px 60px rgba(0, 0, 0, 0.5)",
    overflow: "hidden",
    textAlign: "left",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  previewHeader: {
    background: "rgba(255, 255, 255, 0.03)",
    padding: "12px 20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
  },
  previewDotRed: { width: "10px", height: "10px", borderRadius: "50%", background: "#f87171" },
  previewDotYellow: { width: "10px", height: "10px", borderRadius: "50%", background: "#fbbf24" },
  previewDotGreen: { width: "10px", height: "10px", borderRadius: "50%", background: "#34d399" },
  previewTitle: {
    fontSize: "0.8rem",
    color: "var(--text-muted)",
    marginLeft: "10px",
    fontWeight: "500",
  },
  previewBody: {
    padding: "24px",
    background: "#080c14",
  },
  dummyPOS: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  dummyLeft: {
    flex: 2,
    minWidth: "260px",
  },
  dummySearch: {
    background: "rgba(255, 255, 255, 0.03)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    padding: "10px 16px",
    borderRadius: "8px",
    color: "var(--text-muted)",
    fontSize: "0.85rem",
    marginBottom: "16px",
  },
  dummyGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  dummyProductCard: {
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    padding: "14px",
    borderRadius: "8px",
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
  },
  dummyRight: {
    flex: 1,
    minWidth: "200px",
    background: "rgba(255, 255, 255, 0.02)",
    border: "1px solid rgba(255, 255, 255, 0.05)",
    padding: "16px",
    borderRadius: "12px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  dummyCartHeader: {
    fontWeight: "700",
    fontSize: "0.95rem",
    borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
    paddingBottom: "8px",
  },
  dummyCartItem: {
    fontSize: "0.85rem",
    color: "var(--text-secondary)",
  },
  dummyCartTotal: {
    fontWeight: "700",
    fontSize: "1rem",
    color: "var(--accent-emerald)",
    marginTop: "auto",
    paddingTop: "8px",
    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
  },
  dummyPayMethod: {
    marginTop: "8px",
  },
  activePay: {
    background: "rgba(59, 130, 246, 0.15)",
    border: "1px solid rgba(59, 130, 246, 0.25)",
    color: "var(--accent-blue)",
    padding: "4px 10px",
    borderRadius: "6px",
    fontSize: "0.75rem",
    fontWeight: "600",
  },
  featuresSection: {
    padding: "100px 6%",
    background: "linear-gradient(to bottom, #060911, #080c15)",
    borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
  },
  sectionTitle: {
    fontSize: "2.4rem",
    fontWeight: "800",
    color: "#ffffff",
  },
  sectionSubtitle: {
    fontSize: "1rem",
    color: "var(--text-secondary)",
    marginTop: "8px",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
  },
  featureCard: {
    padding: "32px",
  },
  featureIcon: {
    color: "var(--accent-blue)",
    background: "rgba(59, 130, 246, 0.1)",
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  featureTitle: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "10px",
  },
  featureDesc: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
    lineHeight: "1.6",
  },
  pricingSection: {
    padding: "100px 6%",
    background: "#080c15",
  },
  pricingGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "30px",
    maxWidth: "1000px",
    margin: "0 auto",
  },
  pricingCard: {
    padding: "40px 30px",
    display: "flex",
    flexDirection: "column",
    position: "relative",
    minHeight: "480px",
  },
  popularBadge: {
    position: "absolute",
    top: "16px",
    right: "16px",
    background: "var(--accent-blue)",
    color: "#ffffff",
    fontSize: "0.75rem",
    fontWeight: "700",
    padding: "4px 10px",
    borderRadius: "20px",
    textTransform: "uppercase",
  },
  pricingName: {
    fontSize: "1.4rem",
    fontWeight: "800",
    color: "#ffffff",
    margin: 0,
  },
  pricingDesc: {
    fontSize: "0.88rem",
    color: "var(--text-secondary)",
    marginTop: "8px",
    marginBottom: "24px",
    lineHeight: "1.4",
  },
  priceRow: {
    display: "flex",
    alignItems: "baseline",
    gap: "4px",
    marginBottom: "30px",
  },
  priceVal: {
    fontSize: "2.6rem",
    fontWeight: "900",
    color: "#ffffff",
  },
  pricePeriod: {
    fontSize: "0.9rem",
    color: "var(--text-muted)",
    fontWeight: "600",
  },
  pricingFeaturesList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "40px",
  },
  pricingFeatureItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "0.9rem",
  },
  ctaBanner: {
    position: "relative",
    padding: "100px 20px",
    textAlign: "center",
    background: "radial-gradient(ellipse at center, rgba(59, 130, 246, 0.08) 0%, transparent 60%)",
    overflow: "hidden",
    borderTop: "1px solid rgba(255, 255, 255, 0.03)",
  },
  bannerGlow: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "rgba(16, 185, 129, 0.05)",
    borderRadius: "50%",
    top: "-50px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: -1,
  },
  bannerTitle: {
    fontSize: "2.5rem",
    fontWeight: "850",
    color: "#ffffff",
    marginBottom: "16px",
  },
  bannerSubtitle: {
    fontSize: "1.1rem",
    color: "var(--text-secondary)",
    maxWidth: "600px",
    margin: "0 auto 35px auto",
    lineHeight: "1.5",
  },
  footer: {
    padding: "40px 20px",
    textAlign: "center",
    borderTop: "1px solid rgba(255, 255, 255, 0.03)",
    background: "#060911",
  },
};

// Inject custom landing CSS animations
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.type = "text/css";
  styleSheet.innerText = `
    .hero-preview-hover:hover {
      transform: translateY(-8px) scale(1.01);
      border-color: rgba(59, 130, 246, 0.25) !important;
      box-shadow: 0 35px 80px rgba(59, 130, 246, 0.15) !important;
    }
    .pricing-popular-glow {
      box-shadow: 0 0 30px rgba(59, 130, 246, 0.15) !important;
    }
    nav a:hover {
      color: #ffffff !important;
    }
  `;
  document.head.appendChild(styleSheet);
}

export default LandingPage;
