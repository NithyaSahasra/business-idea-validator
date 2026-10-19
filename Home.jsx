import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();
  const ctaLink = user ? "/validate" : "/signup";

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: "80px 0 60px",
        textAlign: "center",
        borderBottom: "1px solid var(--border)",
        background: "linear-gradient(180deg, #FFFFFF 0%, var(--secondary-bg) 100%)"
      }}>
        <div className="container" style={{ maxWidth: "800px" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "4px 12px",
            borderRadius: "9999px",
            backgroundColor: "var(--light-primary)",
            border: "1px solid var(--primary-border)",
            color: "var(--primary-blue)",
            fontSize: "12px",
            fontWeight: 700,
            marginBottom: "24px"
          }}>
            <span>EVIDENCE-BACKED VALIDATION</span>
          </div>

          <h1 style={{
            fontSize: "44px",
            fontWeight: 800,
            color: "var(--main-text)",
            letterSpacing: "-0.02em",
            marginBottom: "20px"
          }}>
            Validate Your Next Big Idea
          </h1>

          <p style={{
            fontSize: "18px",
            color: "var(--secondary-text)",
            lineHeight: 1.6,
            marginBottom: "36px"
          }}>
            IdeaLens crawls real web data, analyzes competitors, extracts customer complaints,
            and synthesizes evidence-backed validation reports before you invest time or money.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
            <Link to={ctaLink} className="btn btn-primary btn-lg">
              Analyze My Idea
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12"></line>
                <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
            </Link>

            <Link to="/signin" className="btn btn-secondary btn-lg">
              Sign In to My Reports
            </Link>
          </div>
        </div>
      </section>

      {/* Illustrative Sample Report Preview (Clearly Identified as Example) */}
      <section style={{ padding: "60px 0", borderBottom: "1px solid var(--border)", backgroundColor: "#FFFFFF" }}>
        <div className="container" style={{ maxWidth: "960px" }}>
          <div style={{
            padding: "8px 16px",
            backgroundColor: "var(--secondary-bg)",
            border: "1px dashed var(--border)",
            borderRadius: "var(--radius-sm)",
            fontSize: "12px",
            fontWeight: 700,
            color: "var(--secondary-text)",
            textAlign: "center",
            marginBottom: "20px"
          }}>
            ILLUSTRATIVE PREVIEW — SAMPLE VALIDATION REPORT
          </div>

          <div className="card" style={{ border: "1px solid var(--border)", padding: "28px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
              <div>
                <span className="badge badge-primary" style={{ marginBottom: "8px" }}>EdTech / SaaS</span>
                <h3 style={{ fontSize: "22px", fontWeight: 800 }}>CampusPrep: Automated Quizlet Alternative</h3>
                <p style={{ fontSize: "14px", color: "var(--secondary-text)", marginTop: "4px" }}>
                  AI study assistant generating interactive quizzes directly from university lecture PDFs.
                </p>
              </div>

              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "8px 16px",
                backgroundColor: "var(--secondary-bg)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border)"
              }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--secondary-text)" }}>OPPORTUNITY SCORE</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--success)" }}>78 / 100</div>
                </div>
                <span className="badge badge-success">Evidence Backed</span>
              </div>
            </div>

            <div style={{ padding: "16px", backgroundColor: "var(--secondary-bg)", borderRadius: "var(--radius-sm)", marginBottom: "20px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--main-text)", marginBottom: "6px" }}>Executive Summary</div>
              <p style={{ fontSize: "14px", color: "var(--main-text)", lineHeight: 1.5 }}>
                Strong evidence of customer pain point: students spend 15+ hours manually converting lecture slides.
                Incumbents like Quizlet have restricted free flashcards, creating clear willingness-to-pay for targeted, automated tools.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>
              <div style={{ border: "1px solid var(--border)", padding: "14px", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--primary-blue)" }}>KEY COMPETITOR FOUND</div>
                <div style={{ fontSize: "14px", fontWeight: 600, marginTop: "4px" }}>Quizlet Plus ($35.99/yr)</div>
                <div style={{ fontSize: "12px", color: "var(--secondary-text)", marginTop: "2px" }}>
                  Verified pricing page retrieved. Weakness: lacks direct course syllabus synchronization.
                </div>
              </div>

              <div style={{ border: "1px solid var(--border)", padding: "14px", borderRadius: "var(--radius-sm)" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--success)" }}>CUSTOMER COMPLAINT SIGNAL</div>
                <div style={{ fontSize: "14px", fontWeight: 600, marginTop: "4px" }}>Reddit r/college Forum Analysis</div>
                <div style={{ fontSize: "12px", color: "var(--secondary-text)", marginTop: "2px" }}>
                  Over 140 students actively discussing dissatisfaction with paywalled flashcard features.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Descriptions */}
      <section style={{ padding: "80px 0", backgroundColor: "var(--secondary-bg)" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "600px", margin: "0 auto 48px" }}>
            <h2 style={{ fontSize: "30px", fontWeight: 800, marginBottom: "12px" }}>
              Rigorous, Evidence-Linked Research
            </h2>
            <p style={{ fontSize: "16px", color: "var(--secondary-text)" }}>
              No generic advice or hallucinated metrics. Every insight is tied to real web sources and transparent methodology.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px" }}>
            {/* Feature 1 */}
            <div className="card" style={{ padding: "24px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "var(--light-primary)",
                color: "var(--primary-blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Competitor Analysis</h3>
              <p style={{ fontSize: "14px", color: "var(--secondary-text)", lineHeight: 1.5 }}>
                Identifies both direct competitors and indirect substitutes, crawling live websites, features, and weaknesses.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card" style={{ padding: "24px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "var(--light-primary)",
                color: "var(--primary-blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Market Demand</h3>
              <p style={{ fontSize: "14px", color: "var(--secondary-text)", lineHeight: 1.5 }}>
                Gathers qualitative demand signals, practitioner discussions, pain points, and credible industry research.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card" style={{ padding: "24px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "var(--light-primary)",
                color: "var(--primary-blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Target Audience</h3>
              <p style={{ fontSize: "14px", color: "var(--secondary-text)", lineHeight: 1.5 }}>
                Evaluates primary user segments, early adopters, characteristics, and explicitly flags assumptions.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="card" style={{ padding: "24px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "var(--light-primary)",
                color: "var(--primary-blue)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px"
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h3 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>Pricing & Positioning</h3>
              <p style={{ fontSize: "14px", color: "var(--secondary-text)", lineHeight: 1.5 }}>
                Discovers verified competitor pricing pages and suggests testable monetization hypotheses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: "80px 0", backgroundColor: "#FFFFFF" }}>
        <div className="container" style={{ maxWidth: "860px" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <h2 style={{ fontSize: "30px", fontWeight: 800, marginBottom: "12px" }}>
              How IdeaLens Works
            </h2>
            <p style={{ fontSize: "16px", color: "var(--secondary-text)" }}>
              Three straightforward steps from idea to evidence-linked validation report.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-blue)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                flexShrink: 0
              }}>1</div>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: 700 }}>Submit Your Idea</h4>
                <p style={{ fontSize: "14px", color: "var(--secondary-text)", marginTop: "4px" }}>
                  Provide your business name, target problem, intended audience, and market geography.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-blue)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                flexShrink: 0
              }}>2</div>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: 700 }}>Durable Autonomous Web Research</h4>
                <p style={{ fontSize: "14px", color: "var(--secondary-text)", marginTop: "4px" }}>
                  A persistent background worker queries live web data via Tavily, storing raw sources and citations in MySQL.
                </p>
              </div>
            </div>

            <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "var(--primary-blue)",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                flexShrink: 0
              }}>3</div>
              <div>
                <h4 style={{ fontSize: "16px", fontWeight: 700 }}>Evidence-Linked Validation Report</h4>
                <p style={{ fontSize: "14px", color: "var(--secondary-text)", marginTop: "4px" }}>
                  Review your saved report with clickable competitor links, structured insights, and a deterministic Opportunity Score.
                </p>
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: "48px" }}>
            <Link to={ctaLink} className="btn btn-primary btn-lg">
              Analyze My Idea Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
