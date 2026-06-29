import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setSubmitting(true);

    const result = await register(name, email, password);
    setSubmitting(false);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGlow}></div>
      <div className="glass-panel animate-fade-in" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoIcon}>⚡</div>
          <h2 style={styles.title}>Get Started</h2>
          <p style={styles.subtitle}>Create your free billing account in seconds</p>
        </div>

        {error && <div style={styles.errorAlert}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              className="form-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign In instead
          </Link>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--bg-primary)",
    overflow: "hidden",
    padding: "20px",
  },
  backgroundGlow: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
    top: "30%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 1,
    pointerEvents: "none",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    padding: "30px 40px",
    zIndex: 2,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    marginBottom: "24px",
  },
  logoIcon: {
    fontSize: "1.8rem",
    background: "rgba(59, 130, 246, 0.15)",
    width: "48px",
    height: "48px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "12px",
    color: "var(--accent-blue)",
    boxShadow: "0 0 15px rgba(59, 130, 246, 0.25)",
    marginBottom: "16px",
  },
  title: {
    fontSize: "1.6rem",
    fontWeight: "700",
    color: "#ffffff",
    marginBottom: "6px",
  },
  subtitle: {
    fontSize: "0.88rem",
    color: "var(--text-secondary)",
    textAlign: "center",
  },
  submitBtn: {
    width: "100%",
    marginTop: "10px",
  },
  errorAlert: {
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.25)",
    color: "#f87171",
    padding: "12px 16px",
    borderRadius: "var(--border-radius-md)",
    fontSize: "0.9rem",
    fontWeight: "500",
    marginBottom: "20px",
    animation: "fadeIn 0.3s ease-out",
  },
  footer: {
    fontSize: "0.9rem",
    color: "var(--text-secondary)",
    textAlign: "center",
    marginTop: "20px",
  },
  link: {
    color: "var(--accent-blue)",
    fontWeight: "600",
    textDecoration: "none",
    transition: "var(--transition-smooth)",
  },
};

export default Signup;
