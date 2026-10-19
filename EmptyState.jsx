import React from "react";
import { Link } from "react-router-dom";

export default function EmptyState({ title, description, actionText, actionLink, onAction }) {
  return (
    <div className="card" style={{
      textAlign: "center",
      padding: "48px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        width: "56px",
        height: "56px",
        borderRadius: "50%",
        backgroundColor: "var(--light-primary)",
        color: "var(--primary-blue)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: "16px"
      }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>

      <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
        {title}
      </h3>
      <p style={{ fontSize: "14px", color: "var(--secondary-text)", maxWidth: "420px", marginBottom: "24px" }}>
        {description}
      </p>

      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionText}
        </Link>
      )}

      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary">
          {actionText}
        </button>
      )}
    </div>
  );
}
