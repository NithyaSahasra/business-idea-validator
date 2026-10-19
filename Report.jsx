import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../services/api";
import ScoreGauge from "../components/ScoreGauge";
import SourceLink from "../components/SourceLink";

export default function Report() {
  const { reportId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await api.get(`/api/reports/${reportId}`);
        setReport(data);
      } catch (err) {
        setError(err.message || "Failed to load report.");
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportId]);

  if (loading) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center" }}>
        <div style={{
          width: "36px",
          height: "36px",
          border: "3px solid var(--border)",
          borderTopColor: "var(--primary-blue)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px"
        }}></div>
        <p style={{ color: "var(--secondary-text)" }}>Loading validation report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container" style={{ padding: "60px 0", maxWidth: "600px" }}>
        <div className="alert alert-error">
          {error || "Report not found or you do not have permission to view it."}
        </div>
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <Link to="/reports" className="btn btn-secondary">Return to My Reports</Link>
        </div>
      </div>
    );
  }

  const { idea, structured_report: sr, sources } = report;
  const formattedDate = new Date(report.created_at).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "competitors", label: `Competitors (${sr?.competitors?.length || 0})` },
    { id: "market", label: "Market Demand" },
    { id: "audience", label: "Target Audience" },
    { id: "pricing", label: "Pricing & Positioning" },
    { id: "sources", label: `Sources (${sources?.length || 0})` },
  ];

  return (
    <div style={{ padding: "40px 0 80px", backgroundColor: "var(--secondary-bg)", minHeight: "95vh" }}>
      <div className="container" style={{ maxWidth: "1000px" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--secondary-text)", marginBottom: "16px" }}>
          <Link to="/reports">My Reports</Link>
          <span>/</span>
          <span>{idea.name}</span>
        </div>

        {/* Header Section */}
        <div className="card" style={{ padding: "28px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "20px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <h1 style={{ fontSize: "28px", fontWeight: 800 }}>{idea.name}</h1>
                <span className="badge badge-success">Validation Complete</span>
                {idea.category && (
                  <span className="badge badge-neutral">{idea.category}</span>
                )}
              </div>
              <p style={{ fontSize: "15px", color: "var(--secondary-text)", marginTop: "6px", maxWidth: "650px" }}>
                {idea.description}
              </p>
              <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "var(--muted-text)", marginTop: "12px", flexWrap: "wrap" }}>
                <span>Geography: <strong>{idea.geography}</strong></span>
                <span>•</span>
                <span>Target: <strong>{idea.target_audience}</strong></span>
                <span>•</span>
                <span>Researched on: <strong>{formattedDate}</strong></span>
              </div>
            </div>

            <Link to="/validate" className="btn btn-secondary btn-sm">
              Validate Another Idea
            </Link>
          </div>

          {/* Opportunity Score Gauge */}
          <div style={{ marginTop: "24px" }}>
            <ScoreGauge
              score={report.opportunity_score}
              scoreStatus={report.score_status}
              dimensionAssessments={sr?.dimension_assessments || []}
            />
          </div>
        </div>

        {/* Tab Navigation Bar */}
        <div style={{
          display: "flex",
          gap: "4px",
          borderBottom: "1px solid var(--border)",
          marginBottom: "24px",
          overflowX: "auto",
          whiteSpace: "nowrap"
        }}>
          {tabs.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "10px 18px",
                  fontSize: "14px",
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--primary-blue)" : "var(--secondary-text)",
                  borderBottom: isActive ? "2px solid var(--primary-blue)" : "2px solid transparent",
                  backgroundColor: "transparent",
                  borderTop: "none",
                  borderLeft: "none",
                  borderRight: "none",
                  cursor: "pointer"
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Executive Summary */}
            <div className="card">
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
                Executive Summary
              </h2>
              <p style={{ fontSize: "15px", color: "var(--main-text)", lineHeight: 1.6 }}>
                {sr.executive_summary}
              </p>
            </div>

            {/* Key Findings */}
            <div className="card">
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}>
                Key Evidence-Based Findings
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {sr.key_findings.map((finding, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <div style={{
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      backgroundColor: "var(--light-primary)",
                      color: "var(--primary-blue)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "11px",
                      fontWeight: 700,
                      flexShrink: 0,
                      marginTop: "2px"
                    }}>{idx + 1}</div>
                    <p style={{ fontSize: "14px", color: "var(--main-text)", lineHeight: 1.5 }}>
                      {finding}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunities & Risks Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
              <div className="card" style={{ borderLeft: "4px solid var(--success)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--success)", marginBottom: "12px" }}>
                  Key Opportunities
                </h3>
                <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", color: "var(--main-text)" }}>
                  {sr.opportunities.map((opp, i) => (
                    <li key={i}>{opp}</li>
                  ))}
                </ul>
              </div>

              <div className="card" style={{ borderLeft: "4px solid var(--warning)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--warning)", marginBottom: "12px" }}>
                  Risks & Uncertainties
                </h3>
                <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", color: "var(--main-text)" }}>
                  {sr.risks.map((risk, i) => (
                    <li key={i}>{risk}</li>
                  ))}
                  {sr.unknowns.map((unk, i) => (
                    <li key={`unk-${i}`} style={{ color: "var(--secondary-text)" }}>
                      <em>Unknown:</em> {unk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommended Next Steps */}
            <div className="card">
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "14px" }}>
                Recommended Actionable Next Steps
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {sr.next_steps.map((step, idx) => (
                  <div key={idx} style={{
                    padding: "12px 16px",
                    backgroundColor: "var(--secondary-bg)",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    fontSize: "14px"
                  }}>
                    <strong>Step {idx + 1}:</strong> {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPETITORS */}
        {activeTab === "competitors" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {sr.competitors.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "32px" }}>
                <p style={{ color: "var(--secondary-text)" }}>
                  No direct competitors identified from retrieved web sources.
                </p>
              </div>
            ) : (
              sr.competitors.map((comp, idx) => (
                <div key={idx} className="card" style={{ padding: "24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700 }}>
                          {comp.name}
                        </h3>
                        <span className={`badge ${comp.competitor_type === "direct" ? "badge-primary" : "badge-neutral"}`}>
                          {comp.competitor_type}
                        </span>
                      </div>
                      <p style={{ fontSize: "14px", color: "var(--secondary-text)", marginTop: "4px" }}>
                        {comp.description}
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {comp.website_url && (
                        <a
                          href={comp.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          Visit Website
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </a>
                      )}
                      {comp.pricing_url && (
                        <a
                          href={comp.pricing_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                        >
                          Verified Pricing
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  <div style={{ fontSize: "13px", color: "var(--main-text)", marginBottom: "16px" }}>
                    <strong>Target Customers:</strong> {comp.target_customers}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "16px" }}>
                    <div style={{ backgroundColor: "var(--secondary-bg)", padding: "12px", borderRadius: "var(--radius-sm)" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--success)", marginBottom: "6px" }}>
                        Strengths
                      </div>
                      <ul style={{ paddingLeft: "16px", fontSize: "13px", color: "var(--main-text)" }}>
                        {comp.strengths.map((str, i) => <li key={i}>{str}</li>)}
                      </ul>
                    </div>

                    <div style={{ backgroundColor: "var(--secondary-bg)", padding: "12px", borderRadius: "var(--radius-sm)" }}>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--error)", marginBottom: "6px" }}>
                        Weaknesses & Gaps
                      </div>
                      <ul style={{ paddingLeft: "16px", fontSize: "13px", color: "var(--main-text)" }}>
                        {comp.weaknesses.map((weak, i) => <li key={i}>{weak}</li>)}
                      </ul>
                    </div>
                  </div>

                  {comp.source_ids?.length > 0 && (
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                      <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--secondary-text)" }}>Evidence Sources:</span>
                      {comp.source_ids.map(sid => (
                        <SourceLink key={sid} sourceId={sid} sources={sources} />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: MARKET DEMAND */}
        {activeTab === "market" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card">
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
                Qualitative Demand Signals
              </h2>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                {sr.market_demand.qualitative_signals.map((sig, i) => <li key={i}>{sig}</li>)}
              </ul>
            </div>

            <div className="card">
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
                Customer Pain Points & Frustrations
              </h2>
              <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                {sr.market_demand.pain_points.map((pt, i) => <li key={i}>{pt}</li>)}
              </ul>
            </div>

            <div className="card">
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
                Relevant Search Queries & Discussions
              </h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {sr.market_demand.relevant_keywords.map((kw, i) => (
                  <span key={i} className="badge badge-neutral" style={{ fontSize: "13px", padding: "4px 12px" }}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {sr.market_demand.evidence_limitations?.length > 0 && (
              <div className="alert alert-warning">
                <div>
                  <strong>Evidence Limitations:</strong>
                  <ul style={{ paddingLeft: "16px", marginTop: "4px" }}>
                    {sr.market_demand.evidence_limitations.map((lim, i) => <li key={i}>{lim}</li>)}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: TARGET AUDIENCE */}
        {activeTab === "audience" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card">
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
                Primary Customer Segment
              </h2>
              <p style={{ fontSize: "15px", fontWeight: 600, color: "var(--primary-blue)" }}>
                {sr.target_audience_analysis.primary_segment}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
              <div className="card">
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "10px" }}>
                  Audience Needs & Pain Points
                </h3>
                <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                  {sr.target_audience_analysis.needs.map((need, i) => <li key={i}>{need}</li>)}
                </ul>
              </div>

              <div className="card">
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "10px" }}>
                  Potential Early Adopters
                </h3>
                <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                  {sr.target_audience_analysis.early_adopters.map((adopter, i) => <li key={i}>{adopter}</li>)}
                </ul>
              </div>
            </div>

            {sr.target_audience_analysis.assumptions_and_personas?.length > 0 && (
              <div className="card" style={{ borderLeft: "4px solid var(--primary-blue)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--primary-blue)", marginBottom: "10px" }}>
                  Explicit Assumptions & Inferred Personas
                </h3>
                <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                  {sr.target_audience_analysis.assumptions_and_personas.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PRICING & POSITIONING */}
        {activeTab === "pricing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card">
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
                Competitor Pricing Landscape
              </h2>
              <p style={{ fontSize: "15px", lineHeight: 1.6 }}>
                {sr.pricing_analysis.competitor_pricing_summary}
              </p>
            </div>

            <div className="card">
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
                Differentiation Opportunities
              </h2>
              <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                {sr.pricing_analysis.differentiation_opportunities.map((opp, i) => <li key={i}>{opp}</li>)}
              </ul>
            </div>

            <div className="card" style={{ backgroundColor: "var(--light-primary)", borderColor: "var(--primary-border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span className="badge badge-primary">ESTIMATES & HYPOTHESES</span>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--main-text)" }}>
                  Suggested Pricing Hypotheses
                </h3>
              </div>
              <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", color: "var(--main-text)" }}>
                {sr.pricing_analysis.pricing_hypotheses.map((hyp, i) => <li key={i}>{hyp}</li>)}
              </ul>
            </div>

            <div className="card">
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "12px" }}>
                Positioning Recommendations
              </h2>
              <ul style={{ paddingLeft: "18px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px" }}>
                {sr.pricing_analysis.positioning_recommendations.map((pos, i) => <li key={i}>{pos}</li>)}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 6: SOURCES */}
        {activeTab === "sources" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <p style={{ fontSize: "14px", color: "var(--secondary-text)" }}>
              All sources retrieved and preserved during the autonomous research workflow. Every link is verified against search results.
            </p>

            {sources.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "32px" }}>
                <p style={{ color: "var(--secondary-text)" }}>No external web sources retrieved for this job.</p>
              </div>
            ) : (
              sources.map((s) => {
                const retDate = new Date(s.retrieved_at).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div key={s.id} className="card" style={{ padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "var(--primary-blue)",
                          backgroundColor: "var(--light-primary)",
                          padding: "2px 8px",
                          borderRadius: "4px"
                        }}>
                          Source #{s.id}
                        </span>
                        <h4 style={{ fontSize: "15px", fontWeight: 700 }}>{s.title}</h4>
                      </div>

                      <span className="badge badge-neutral" style={{ textTransform: "capitalize" }}>
                        {s.source_type}
                      </span>
                    </div>

                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "13px",
                        color: "var(--primary-blue)",
                        wordBreak: "break-all",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        marginBottom: "10px"
                      }}
                    >
                      <span>{s.url}</span>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                        <polyline points="15 3 21 3 21 9"></polyline>
                        <line x1="10" y1="14" x2="21" y2="3"></line>
                      </svg>
                    </a>

                    <div style={{
                      padding: "12px",
                      backgroundColor: "var(--secondary-bg)",
                      borderRadius: "var(--radius-sm)",
                      fontSize: "13px",
                      color: "var(--main-text)",
                      lineHeight: 1.5
                    }}>
                      {s.evidence_summary}
                    </div>

                    <div style={{ fontSize: "11px", color: "var(--muted-text)", marginTop: "8px" }}>
                      Retrieved on {retDate} {s.relevance_score ? `• Relevance: ${(s.relevance_score * 100).toFixed(0)}%` : ""}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
