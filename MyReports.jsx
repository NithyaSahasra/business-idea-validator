import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import EmptyState from "../components/EmptyState";

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({ open: false, item: null, deleting: false });

  const fetchReports = async () => {
    try {
      const data = await api.get("/api/reports");
      setReports(data);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load your reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const confirmDelete = async () => {
    if (!deleteModal.item || !deleteModal.item.id) return;
    setDeleteModal(prev => ({ ...prev, deleting: true }));

    try {
      await api.delete(`/api/reports/${deleteModal.item.id}`);
      setReports(prev => prev.filter(r => r.id !== deleteModal.item.id));
      setDeleteModal({ open: false, item: null, deleting: false });
    } catch (err) {
      alert(err.message || "Failed to delete report.");
      setDeleteModal(prev => ({ ...prev, deleting: false }));
    }
  };

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
        <p style={{ color: "var(--secondary-text)" }}>Loading saved validation reports...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "48px 0", backgroundColor: "var(--secondary-bg)", minHeight: "90vh" }}>
      <div className="container" style={{ maxWidth: "960px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 800 }}>My Validation Reports</h1>
            <p style={{ fontSize: "14px", color: "var(--secondary-text)", marginTop: "4px" }}>
              Track and review all evidence-backed business idea validations.
            </p>
          </div>

          <Link to="/validate" className="btn btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Validate New Idea
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {reports.length === 0 ? (
          <EmptyState
            title="No Validation Reports Yet"
            description="You haven't submitted any business ideas for validation yet. Submit your first concept to receive a complete competitor, market demand, and pricing report."
            actionText="Analyze Your First Idea"
            actionLink="/validate"
          />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {reports.map((item) => {
              const isCompleted = item.status === "completed" && item.id;
              const formattedDate = new Date(item.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <div
                  key={item.job_id}
                  className="card"
                  style={{
                    padding: "20px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "16px"
                  }}
                >
                  <div style={{ flex: 1, minWidth: "260px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "17px", fontWeight: 700 }}>
                        {item.idea_name}
                      </h3>
                      <span className={`badge ${
                        item.status === "completed" ? "badge-success" :
                        item.status === "failed" ? "badge-error" : "badge-primary"
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <p style={{
                      fontSize: "13px",
                      color: "var(--secondary-text)",
                      marginTop: "4px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical"
                    }}>
                      {item.idea_description}
                    </p>

                    <div style={{ fontSize: "12px", color: "var(--muted-text)", marginTop: "8px" }}>
                      Submitted on {formattedDate}
                    </div>
                  </div>

                  {/* Opportunity Score Column */}
                  <div style={{ textAlign: "center", padding: "0 16px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--secondary-text)" }}>
                      OPPORTUNITY
                    </div>
                    {item.opportunity_score !== null && item.opportunity_score !== undefined ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "2px" }}>
                        <span style={{ fontSize: "20px", fontWeight: 800, color: item.opportunity_score >= 70 ? "var(--success)" : "var(--primary-blue)" }}>
                          {item.opportunity_score}
                        </span>
                        <span style={{ fontSize: "11px", color: "var(--secondary-text)" }}>/100</span>
                        {item.score_status === "provisional" && (
                          <span className="badge badge-warning" style={{ fontSize: "10px", padding: "1px 6px" }}>
                            Provisional
                          </span>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontSize: "13px", color: "var(--muted-text)", marginTop: "4px" }}>
                        {item.status === "failed" ? "Failed" : "In Progress"}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {isCompleted ? (
                      <Link to={`/reports/${item.id}`} className="btn btn-secondary btn-sm">
                        View Report
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </Link>
                    ) : (
                      <Link to={`/research/${item.job_id}`} className="btn btn-secondary btn-sm">
                        View Progress
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="9 18 15 12 9 6"></polyline>
                        </svg>
                      </Link>
                    )}

                    {isCompleted && (
                      <button
                        onClick={() => setDeleteModal({ open: true, item, deleting: false })}
                        className="btn btn-secondary btn-sm"
                        style={{ color: "var(--error)", borderColor: "var(--border)" }}
                        title="Delete report"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.open && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--main-text)" }}>
                Delete Validation Report
              </h3>
              <p style={{ fontSize: "14px", color: "var(--secondary-text)", marginTop: "8px", lineHeight: 1.5 }}>
                Are you sure you want to delete the report for <strong>"{deleteModal.item?.idea_name}"</strong>?
                This will permanently remove the idea, associated research job, and retrieved sources. This action cannot be undone.
              </p>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "24px" }}>
                <button
                  onClick={() => setDeleteModal({ open: false, item: null, deleting: false })}
                  className="btn btn-secondary btn-sm"
                  disabled={deleteModal.deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn btn-danger btn-sm"
                  disabled={deleteModal.deleting}
                >
                  {deleteModal.deleting ? "Deleting..." : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
