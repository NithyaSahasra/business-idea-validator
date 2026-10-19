import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import ResearchStages from "../components/ResearchStages";

export default function Research() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);
  const pollIntervalRef = useRef(null);

  const fetchStatus = async () => {
    try {
      const data = await api.get(`/api/research/${jobId}/status`);
      setJob(data);
      setError("");

      if (data.status === "completed" && data.report_id) {
        clearInterval(pollIntervalRef.current);
        // Automatically redirect to report after short confirmation pause
        setTimeout(() => {
          navigate(`/reports/${data.report_id}`);
        }, 1200);
      } else if (data.status === "failed") {
        clearInterval(pollIntervalRef.current);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch research progress.");
      clearInterval(pollIntervalRef.current);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Start 3-second polling
    pollIntervalRef.current = setInterval(fetchStatus, 3000);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [jobId]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      const data = await api.post(`/api/research/${jobId}/retry`, {});
      setJob(data);
      // Resume polling
      pollIntervalRef.current = setInterval(fetchStatus, 3000);
    } catch (err) {
      setError(err.message || "Failed to retry research job.");
    } finally {
      setRetrying(false);
    }
  };

  if (loading && !job) {
    return (
      <div style={{ padding: "80px 0", textAlign: "center" }}>
        <div style={{
          width: "40px",
          height: "40px",
          border: "3px solid var(--border)",
          borderTopColor: "var(--primary-blue)",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
          margin: "0 auto 16px"
        }}></div>
        <p style={{ color: "var(--secondary-text)" }}>Connecting to research pipeline...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "48px 0", backgroundColor: "var(--secondary-bg)", minHeight: "90vh" }}>
      <div className="container" style={{ maxWidth: "760px" }}>
        {/* Navigation Breadcrumbs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--secondary-text)", marginBottom: "20px" }}>
          <Link to="/reports">My Reports</Link>
          <span>/</span>
          <span>Research Job #{jobId}</span>
        </div>

        {/* Header Card */}
        <div className="card" style={{ padding: "28px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <h1 style={{ fontSize: "24px", fontWeight: 800 }}>
                  {job?.idea_name || `Researching Idea #${jobId}`}
                </h1>
                <span className={`badge ${
                  job?.status === "completed" ? "badge-success" :
                  job?.status === "failed" ? "badge-error" : "badge-primary"
                }`}>
                  {job?.status || "queued"}
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--secondary-text)", marginTop: "6px" }}>
                {job?.idea_description}
              </p>
            </div>

            {job?.status === "completed" && job?.report_id && (
              <Link to={`/reports/${job.report_id}`} className="btn btn-primary">
                View Generated Report
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </Link>
            )}
          </div>
        </div>

        {/* Error / Failure Banner with Safe Retry */}
        {job?.status === "failed" && (
          <div className="alert alert-error" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ fontWeight: 700 }}>Research Interrupted</div>
              <div style={{ fontSize: "13px", marginTop: "2px" }}>
                {job.error_message || "An unexpected error occurred during research execution."}
              </div>
            </div>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: "var(--error-border)", color: "var(--error)" }}
            >
              {retrying ? "Retrying..." : "Safe Retry Research"}
            </button>
          </div>
        )}

        {/* Active Stages Timeline */}
        <div className="card" style={{ padding: "28px" }}>
          <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "20px" }}>
            Autonomous Pipeline Progress
          </h2>

          <ResearchStages
            currentStage={job?.current_stage || "understanding_idea"}
            status={job?.status || "queued"}
          />

          <div style={{
            marginTop: "24px",
            paddingTop: "16px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "12px",
            color: "var(--secondary-text)"
          }}>
            <span>Polling status every 3 seconds</span>
            <span>Attempts: {job?.attempt_count || 0}</span>
          </div>
        </div>

        {/* Back Link */}
        <div style={{ textAlign: "center", marginTop: "28px" }}>
          <Link to="/reports" style={{ fontSize: "14px", color: "var(--secondary-text)" }}>
            ← Return to My Reports
          </Link>
        </div>
      </div>
    </div>
  );
}
