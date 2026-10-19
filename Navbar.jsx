import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header style={{
      borderBottom: "1px solid var(--border)",
      backgroundColor: "#FFFFFF",
      position: "sticky",
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: "64px"
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          textDecoration: "none",
          fontWeight: 800,
          fontSize: "18px",
          color: "var(--main-text)"
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "var(--primary-blue)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF"
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <span>IdeaLens</span>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link
            to="/"
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: isActive("/") ? "var(--primary-blue)" : "var(--secondary-text)",
              textDecoration: "none"
            }}
          >
            Home
          </Link>

          {user && (
            <>
              <Link
                to="/validate"
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: isActive("/validate") ? "var(--primary-blue)" : "var(--secondary-text)",
                  textDecoration: "none"
                }}
              >
                Analyze Idea
              </Link>
              <Link
                to="/reports"
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: isActive("/reports") ? "var(--primary-blue)" : "var(--secondary-text)",
                  textDecoration: "none"
                }}
              >
                My Reports
              </Link>
            </>
          )}
        </nav>

        {/* Auth / Profile Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user ? (
            <div style={{ position: "relative" }} ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  border: "1px solid var(--border)",
                  backgroundColor: "var(--secondary-bg)",
                  color: "var(--main-text)",
                  fontSize: "13px",
                  fontWeight: 600
                }}
              >
                <div style={{
                  width: "24px",
                  height: "24px",
                  borderRadius: "50%",
                  backgroundColor: "var(--primary-blue)",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700
                }}>
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                </div>
                <span>{user.full_name.split(" ")[0]}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>

              {dropdownOpen && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  marginTop: "8px",
                  width: "220px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  boxShadow: "var(--shadow-lg)",
                  padding: "8px 0",
                  zIndex: 200
                }}>
                  <div style={{ padding: "8px 16px", borderBottom: "1px solid var(--border)" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--main-text)" }}>
                      {user.full_name}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--secondary-text)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {user.email}
                    </div>
                    {!user.is_email_verified && (
                      <span className="badge badge-warning" style={{ marginTop: "6px", fontSize: "10px" }}>
                        Unverified Email
                      </span>
                    )}
                  </div>

                  <Link
                    to="/reports"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: "block",
                      padding: "8px 16px",
                      fontSize: "13px",
                      color: "var(--main-text)",
                      textDecoration: "none"
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--secondary-bg)")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                  >
                    My Reports
                  </Link>

                  <Link
                    to="/validate"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: "block",
                      padding: "8px 16px",
                      fontSize: "13px",
                      color: "var(--main-text)",
                      textDecoration: "none"
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--secondary-bg)")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                  >
                    New Validation
                  </Link>

                  <div style={{ borderTop: "1px solid var(--border)", margin: "4px 0" }}></div>

                  <button
                    onClick={handleSignOut}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 16px",
                      fontSize: "13px",
                      color: "var(--error)",
                      background: "none",
                      border: "none",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = "var(--error-bg)")}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/signin" className="btn btn-secondary btn-sm">
                Sign In
              </Link>
              <Link to="/signup" className="btn btn-primary btn-sm">
                Analyze My Idea
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
