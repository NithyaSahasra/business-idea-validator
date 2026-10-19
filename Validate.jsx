import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function Validate() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    problem: "",
    target_audience: "",
    geography: "",
    category: "",
    business_model: "",
    known_competitors: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim() || formData.name.length < 3) {
      errs.name = "Business idea name must be at least 3 characters.";
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      errs.description = "Please provide a clear description (at least 10 characters).";
    }
    if (!formData.problem.trim() || formData.problem.length < 10) {
      errs.problem = "Please specify the customer pain point being solved (at least 10 characters).";
    }
    if (!formData.target_audience.trim() || formData.target_audience.length < 5) {
      errs.target_audience = "Target audience is required (e.g., 'Solo developers building SaaS').";
    }
    if (!formData.geography.trim() || formData.geography.length < 2) {
      errs.geography = "Geography or target market is required (e.g., 'United States', 'Global').";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        problem: formData.problem.trim(),
        target_audience: formData.target_audience.trim(),
        geography: formData.geography.trim(),
        category: formData.category.trim() || null,
        business_model: formData.business_model.trim() || null,
        known_competitors: formData.known_competitors.trim() || null,
      };

      const res = await api.post("/api/ideas", payload);
      // Navigate to protected research progress page
      navigate(`/research/${res.research_job_id}`);
    } catch (err) {
      setErrors({ form: err.message || "Failed to submit business idea for validation." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "48px 0", backgroundColor: "var(--secondary-bg)", minHeight: "90vh" }}>
      <div className="container" style={{ maxWidth: "760px" }}>
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800 }}>Analyze Your Business Idea</h1>
          <p style={{ fontSize: "15px", color: "var(--secondary-text)", marginTop: "4px" }}>
            Submit your concept details below. Our autonomous pipeline will crawl competitors,
            extract customer sentiment, and calculate an empirical Opportunity Score.
          </p>
        </div>

        {errors.form && (
          <div className="alert alert-error">
            {errors.form}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card" style={{ padding: "32px" }}>
          {/* Section 1: Core Concept */}
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--main-text)", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>
              1. Core Concept & Problem
            </h2>

            <div className="form-group">
              <label className="form-label" htmlFor="name">
                Idea / Project Name <span className="required">*</span>
              </label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="e.g. DocuSign for Students, CleanPlate AI"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={255}
              />
              {errors.name && <div className="form-error">{errors.name}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Idea Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                className="form-textarea"
                placeholder="Describe what your product or service does and how it delivers value..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                maxLength={3000}
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {errors.description ? <div className="form-error">{errors.description}</div> : <div></div>}
                <span className="form-hint">{formData.description.length} / 3000 chars</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="problem">
                Problem Being Solved <span className="required">*</span>
              </label>
              <textarea
                id="problem"
                className="form-textarea"
                placeholder="What specific pain point, frustration, or inefficiency does this solve?"
                value={formData.problem}
                onChange={(e) => setFormData({ ...formData, problem: e.target.value })}
                rows={3}
                maxLength={2000}
              />
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                {errors.problem ? <div className="form-error">{errors.problem}</div> : <div></div>}
                <span className="form-hint">{formData.problem.length} / 2000 chars</span>
              </div>
            </div>
          </div>

          {/* Section 2: Market & Geography */}
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--main-text)", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>
              2. Target Market & Audience
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="target_audience">
                  Target Audience <span className="required">*</span>
                </label>
                <input
                  id="target_audience"
                  type="text"
                  className="form-input"
                  placeholder="e.g. High school teachers, Indie hackers"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  maxLength={1000}
                />
                {errors.target_audience && <div className="form-error">{errors.target_audience}</div>}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="geography">
                  Geography / Target Market <span className="required">*</span>
                </label>
                <input
                  id="geography"
                  type="text"
                  className="form-input"
                  placeholder="e.g. North America, Global, United Kingdom"
                  value={formData.geography}
                  onChange={(e) => setFormData({ ...formData, geography: e.target.value })}
                  maxLength={255}
                />
                {errors.geography && <div className="form-error">{errors.geography}</div>}
              </div>
            </div>
          </div>

          {/* Section 3: Optional Additional Context */}
          <div style={{ marginBottom: "28px" }}>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--main-text)", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "16px" }}>
              3. Business Model & Competitors (Optional)
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
              <div className="form-group">
                <label className="form-label" htmlFor="category">
                  Business Category
                </label>
                <input
                  id="category"
                  type="text"
                  className="form-input"
                  placeholder="e.g. EdTech, B2B SaaS, HealthTech"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  maxLength={255}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="business_model">
                  Intended Business Model
                </label>
                <input
                  id="business_model"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Freemium Subscription ($15/mo), Marketplace Fee"
                  value={formData.business_model}
                  onChange={(e) => setFormData({ ...formData, business_model: e.target.value })}
                  maxLength={255}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="known_competitors">
                Known Competitors or Alternatives
              </label>
              <input
                id="known_competitors"
                type="text"
                className="form-input"
                placeholder="e.g. Slack, Notion, Asana (comma separated)"
                value={formData.known_competitors}
                onChange={(e) => setFormData({ ...formData, known_competitors: e.target.value })}
                maxLength={2000}
              />
              <span className="form-hint">Our research engine will specifically search for pricing tiers of these competitors.</span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div style={{
                    width: "16px",
                    height: "16px",
                    border: "2px solid #FFFFFF",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite"
                  }}></div>
                  <span>Initiating Research...</span>
                </>
              ) : (
                <>
                  <span>Begin Validation Research</span>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
