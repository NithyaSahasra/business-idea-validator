import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignUp() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState(null);

  const validate = () => {
    const errs = {};
    if (!formData.full_name.trim() || formData.full_name.length < 2) {
      errs.full_name = "Full name is required (min 2 characters).";
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = "Please enter a valid email address.";
    }
    if (!formData.password || formData.password.length < 8) {
      errs.password = "Password must be at least 8 characters long.";
    } else if (!/[A-Za-z]/.test(formData.password) || !/\d/.test(formData.password)) {
      errs.password = "Password must contain at least one letter and one number.";
    }
    if (formData.password !== formData.confirm_password) {
      errs.confirm_password = "Passwords do not match.";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const res = await signup(formData);
      setSuccessInfo(res);
    } catch (err) {
      setErrors({ form: err.message || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "60px 0", minHeight: "80vh", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: "440px" }}>
        <div className="card" style={{ padding: "32px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800 }}>Create Your Account</h1>
            <p style={{ fontSize: "14px", color: "var(--secondary-text)", marginTop: "4px" }}>
              Start validating your business ideas with real market evidence.
            </p>
          </div>

          {errors.form && (
            <div className="alert alert-error">
              {errors.form}
            </div>
          )}

          {successInfo ? (
            <div>
              <div className="alert alert-success">
                {successInfo.message}
              </div>

              {successInfo.dev_token && (
                <div style={{
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--light-primary)",
                  border: "1px solid var(--primary-border)",
                  marginBottom: "20px"
                }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--primary-blue)" }}>
                    LOCAL DEVELOPMENT SHORTCUT
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--main-text)", marginTop: "4px" }}>
                    Email delivery is simulated in development mode.
                  </p>
                  <Link
                    to={`/verify-email?token=${successInfo.dev_token}`}
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: "10px", display: "inline-block" }}
                  >
                    Click to Verify Email Instantly
                  </Link>
                </div>
              )}

              <p style={{ fontSize: "14px", color: "var(--secondary-text)", textAlign: "center" }}>
                Already verified? <Link to="/signin" style={{ fontWeight: 600 }}>Sign In</Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="full_name">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  id="full_name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Morgan"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
                {errors.full_name && <div className="form-error">{errors.full_name}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="form-input"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  Password <span className="required">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="At least 8 characters with letter & number"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {errors.password && <div className="form-error">{errors.password}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirm_password">
                  Confirm Password <span className="required">*</span>
                </label>
                <input
                  id="confirm_password"
                  type="password"
                  className="form-input"
                  placeholder="Repeat your password"
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                />
                {errors.confirm_password && <div className="form-error">{errors.confirm_password}</div>}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "8px" }}
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
            <span style={{ fontSize: "14px", color: "var(--secondary-text)" }}>
              Already have an account?{" "}
            </span>
            <Link to="/signin" style={{ fontSize: "14px", fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
