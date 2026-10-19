import React from "react";

const STAGES = [
  { key: "understanding_idea", label: "Understanding Idea", desc: "Analyzing core problem, category, and target audience" },
  { key: "finding_competitors", label: "Finding Competitors", desc: "Crawling web for direct competitors and alternative solutions" },
  { key: "researching_customer_needs", label: "Researching Customer Needs", desc: "Extracting customer complaints, pain points, and forum discussions" },
  { key: "checking_market_demand", label: "Checking Market Demand", desc: "Gathering market indicators and industry research" },
  { key: "analyzing_pricing", label: "Analyzing Pricing", desc: "Inspecting competitor pricing tiers and monetization models" },
  { key: "preparing_report", label: "Preparing Report", desc: "Synthesizing evidence and computing deterministic score" }
];

export default function ResearchStages({ currentStage, status }) {
  const currentIdx = STAGES.findIndex(s => s.key === currentStage);
  const activeIdx = currentIdx === -1 ? 0 : currentIdx;
  const isCompleted = status === "completed";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {STAGES.map((stage, idx) => {
        let isDone = isCompleted || idx < activeIdx;
        let isActive = !isCompleted && idx === activeIdx && status !== "failed";
        let isPending = !isCompleted && idx > activeIdx;
        let isFailed = status === "failed" && idx === activeIdx;

        return (
          <div
            key={stage.key}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "16px",
              padding: "14px 18px",
              borderRadius: "var(--radius-md)",
              border: isActive ? "1px solid var(--primary-border)" : "1px solid var(--border)",
              backgroundColor: isActive ? "var(--light-primary)" : isDone ? "#FFFFFF" : "var(--secondary-bg)",
              opacity: isPending ? 0.6 : 1,
              transition: "all 0.2s ease"
            }}
          >
            {/* Step Icon */}
            <div style={{
              width: "28px",
              height: "28px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: 700,
              backgroundColor: isDone ? "var(--success)" : isActive ? "var(--primary-blue)" : isFailed ? "var(--error)" : "var(--border)",
              color: isDone || isActive || isFailed ? "#FFFFFF" : "var(--secondary-text)",
              flexShrink: 0
            }}>
              {isDone ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              ) : isFailed ? (
                <span>✕</span>
              ) : isActive ? (
                <div style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  backgroundColor: "#FFFFFF",
                  animation: "pulse 1.2s infinite ease-in-out"
                }}></div>
              ) : (
                <span>{idx + 1}</span>
              )}
            </div>

            {/* Stage Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: isActive ? "var(--primary-blue)" : isDone ? "var(--main-text)" : "var(--secondary-text)"
                }}>
                  {stage.label}
                </span>

                {isDone && (
                  <span style={{ fontSize: "12px", color: "var(--success)", fontWeight: 600 }}>Completed</span>
                )}
                {isActive && (
                  <span style={{ fontSize: "12px", color: "var(--primary-blue)", fontWeight: 600 }}>In Progress...</span>
                )}
              </div>
              <p style={{ fontSize: "12px", color: "var(--secondary-text)", marginTop: "2px" }}>
                {stage.desc}
              </p>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(0.8); opacity: 0.7; }
          50% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
