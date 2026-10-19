import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../services/api";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenParam);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ success: false, message: "", error: "" });

  const performVerification = async (verifyToken) => {
    if (!verifyToken) return;
    setLoading(true);
    setStatus({ success: false, message: "", error: "" });

    try {
      const res = await api.post("/api/auth/verify-email", { token: verifyToken });
      setStatus({ success: true, message: res.message, error: "" });
    } catch (err) {
      setStatus({
        success: false,
        message: "",
        error: err.message || "Email verification failed or token expired."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tokenParam) {
      performVerification(tokenParam);
    }
  }, [tokenParam]);

  const handleSubmit = (e) => {
    e.preventDefault();
    performVerification(token);
  };

  return (
    <div style={{ padding: "60px 0", minHeight: "80vh", display: "flex", alignItems: "center" }}>
      <div className="container" style={{ maxWidth: "440px" }}>
        <div className="card" style={{ padding: "32px", textAlign: "center" }}>
          <div style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            backgroundColor: status.success ? "var(--success-bg)" : "var(--light-primary)",
            color: status.success ? "var(--success)" : "var(--primary-blue)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px"
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {status.success ? (
                <polyline points="20 6 9 17 4 12"></polyline>
              ) : (
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              )}
            </svg>
          </div>

          <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "8px" }}>
            Email Verification
          </h1>

          {loading ? (
            <p style={{ color: "var(--secondary-text)", fontSize: "14px", margin: "20px 0" }}>
              Verifying your email token...
            </p>
          ) : status.success ? (
            <div>
              <div className="alert alert-success" style={{ textAlign: "left", marginTop: "16px" }}>
                {status.message}
              </div>
              <Link to="/signin" className="btn btn-primary" style={{ width: "100%", marginTop: "12px" }}>
                Sign In to Your Account
              </Link>
            </div>
          ) : (
            <div>
              {status.error && (
                <div className="alert alert-error" style={{ textAlign: "left", marginTop: "16px" }}>
                  {status.error}
                </div>
              )}

              <p style={{ fontSize: "14px", color: "var(--secondary-text)", marginBottom: "20px" }}>
                Enter the verification token from your confirmation email.
              </p>

              <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
                <div className="form-group">
                  <label className="form-label" htmlFor="token">
                    Verification Token
                  </label>
                  <input
                    id="token"
                    type="text"
                    className="form-input"
                    placeholder="Paste token here"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  disabled={loading || !token.trim()}
                >
                  Verify Email
                </button>
              </form>
            </div>
          )}

          <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
            <Link to="/signin" style={{ fontSize: "14px", color: "var(--secondary-text)" }}>
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
