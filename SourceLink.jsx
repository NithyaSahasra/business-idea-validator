import React from "react";

export default function SourceLink({ sourceId, sources = [] }) {
  const source = sources.find(s => s.id === sourceId);

  if (!source) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
          fontSize: "11px",
          color: "var(--secondary-text)",
          backgroundColor: "var(--secondary-bg)",
          padding: "2px 8px",
          borderRadius: "4px",
          border: "1px solid var(--border)"
        }}
      >
        Source #{sourceId}
      </span>
    );
  }

  return (
    <a
      href={source.url}
      target="_blank"
      rel="noopener noreferrer"
      title={source.title}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "11px",
        fontWeight: 600,
        color: "var(--primary-blue)",
        backgroundColor: "var(--light-primary)",
        padding: "2px 8px",
        borderRadius: "4px",
        border: "1px solid var(--primary-border)",
        textDecoration: "none",
        verticalAlign: "middle",
        marginRight: "4px"
      }}
    >
      <span>#{source.id} {source.source_type}</span>
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
        <polyline points="15 3 21 3 21 9"></polyline>
        <line x1="10" y1="14" x2="21" y2="3"></line>
      </svg>
    </a>
  );
}
