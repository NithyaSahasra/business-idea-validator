import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api } from "../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tokenParam = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token.trim()) {
      setError("Reset token is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
      setError("Password must contain at least one letter and one number.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/api/auth/reset-password", {
        token: token.trim(),
        password,
        confirm_password: confirmPassword,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to reset password. The link may have expired or already been used.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "60px 0", minHeight: "80vh", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: "420px" }}>
        <div className="card" style={{ padding: "32px" }}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 800 }}>Create New Password</h1>
            <p style={{ fontSize: "14px", color: "var(--secondary-text)", marginTop: "4px" }}>
              Please enter and confirm your new secure password.
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {success ? (
            <div>
              <div className="alert alert-success">
                Your password has been reset successfully. All previous sessions have been revoked.
              </div>
              <Link to="/signin" className="btn btn-primary" style={{ width: "100%", marginTop: "16px" }}>
                Sign In with New Password
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {!tokenParam && (
                <div className="form-group">
                  <label className="form-label" htmlFor="token">
                    Reset Token
                  </label>
                  <input
                    id="token"
                    type="text"
                    className="form-input"
                    placeholder="Paste reset token here"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="password">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  className="form-input"
                  placeholder="Min 8 chars, letter & number"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="confirmPassword">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  className="form-input"
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", marginTop: "8px" }}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </form>
          )}

          <div style={{ textAlign: "center", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <Link to="/signin" style={{ fontSize: "14px", color: "var(--secondary-text)" }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
