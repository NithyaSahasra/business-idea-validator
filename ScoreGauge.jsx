import React, { useState } from "react";

export default function ScoreGauge({ score, scoreStatus, dimensionAssessments = [] }) {
  const [showExplanation, setShowExplanation] = useState(false);

  let color = "var(--primary-blue)";
  let verdict = "Moderate Opportunity";

  if (score === null || score === undefined || scoreStatus === "unavailable") {
    color = "var(--secondary-text)";
    verdict = "Score Unavailable";
  } else if (score >= 70) {
    color = "var(--success)";
    verdict = "Strong Opportunity";
  } else if (score >= 50) {
    color = "var(--primary-blue)";
    verdict = "Viable with Risks";
  } else {
    color = "var(--warning)";
    verdict = "High Risk / Limited Signals";
  }

  return (
    <div className="card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px" }}>
        {/* Score Number Display */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            border: `4px solid ${color}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            backgroundColor: "var(--secondary-bg)"
          }}>
            <span style={{ fontSize: "24px", fontWeight: 800, color: "var(--main-text)", lineHeight: 1 }}>
              {score !== null && score !== undefined ? score : "--"}
            </span>
            <span style={{ fontSize: "10px", color: "var(--secondary-text)", fontWeight: 600 }}>/ 100</span>
          </div>

          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Opportunity Score</h3>
              {scoreStatus === "provisional" && (
                <span className="badge badge-warning" title="Less than 3 credible sources retrieved; score is capped at 60">
                  Provisional
                </span>
              )}
              {scoreStatus === "calculated" && (
                <span className="badge badge-success">
                  Evidence Backed
                </span>
              )}
              {scoreStatus === "unavailable" && (
                <span className="badge badge-neutral">
                  Unavailable
                </span>
              )}
            </div>
            <p style={{ fontSize: "13px", color: "var(--secondary-text)", marginTop: "2px" }}>
              {verdict} — Deterministic evaluation across 5 weighted dimensions.
            </p>
          </div>
        </div>

        {/* Action to show methodology */}
        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="btn btn-secondary btn-sm"
          style={{ fontSize: "12px" }}
        >
          {showExplanation ? "Hide Methodology" : "View Methodology"}
        </button>
      </div>

      {/* Dimension Breakdown Accordion */}
      {showExplanation && (
        <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: "13px", color: "var(--secondary-text)", marginBottom: "12px" }}>
            The Opportunity Score is calculated deterministically by combining five fixed dimensions.
            If fewer than 3 credible sources are found, the score is capped at 60 and flagged as provisional.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
            {dimensionAssessments.map((dim, idx) => (
              <div
                key={idx}
                style={{
                  padding: "12px",
                  borderRadius: "var(--radius-sm)",
                  backgroundColor: "var(--secondary-bg)",
                  border: "1px solid var(--border)"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--main-text)" }}>
                    {dim.dimension}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--primary-blue)" }}>
                    {dim.score}/100
                  </span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--secondary-text)", marginTop: "2px" }}>
                  Weight: {dim.weight}%
                </div>
                <p style={{ fontSize: "12px", color: "var(--main-text)", marginTop: "6px", lineHeight: "1.4" }}>
                  {dim.justification}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
