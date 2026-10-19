from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.schemas.ideas import IdeaResponse
from app.schemas.sources import SourceResponse


class CompetitorItem(BaseModel):
    name: str
    website_url: Optional[str] = None
    product_url: Optional[str] = None
    pricing_url: Optional[str] = None
    description: str
    target_customers: str
    features: List[str] = []
    strengths: List[str] = []
    weaknesses: List[str] = []
    competitor_type: str = "direct"  # "direct" or "indirect"
    source_ids: List[int] = []


class MarketDemandAnalysis(BaseModel):
    qualitative_signals: List[str] = []
    relevant_keywords: List[str] = []
    pain_points: List[str] = []
    industry_evidence: List[str] = []
    evidence_limitations: List[str] = []
    source_ids: List[int] = []


class TargetAudienceAnalysis(BaseModel):
    primary_segment: str
    needs: List[str] = []
    early_adopters: List[str] = []
    characteristics: List[str] = []
    assumptions_and_personas: List[str] = []
    source_ids: List[int] = []


class PricingAnalysis(BaseModel):
    competitor_pricing_summary: str
    differentiation_opportunities: List[str] = []
    pricing_hypotheses: List[str] = []  # Explicitly labeled as estimates/hypotheses
    positioning_recommendations: List[str] = []
    source_ids: List[int] = []


class DimensionAssessment(BaseModel):
    dimension: str
    weight: int
    score: int
    justification: str
    source_ids: List[int] = []


class StructuredReport(BaseModel):
    executive_summary: str
    key_findings: List[str] = []
    competitors: List[CompetitorItem] = []
    market_demand: MarketDemandAnalysis
    target_audience_analysis: TargetAudienceAnalysis
    pricing_analysis: PricingAnalysis
    opportunities: List[str] = []
    risks: List[str] = []
    unknowns: List[str] = []
    next_steps: List[str] = []
    dimension_assessments: List[DimensionAssessment] = []
    evidence_limitations: List[str] = []


class ReportDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    research_job_id: int
    idea: IdeaResponse
    executive_summary: str
    opportunity_score: Optional[int] = None
    score_status: str
    structured_report: StructuredReport
    sources: List[SourceResponse] = []
    created_at: datetime


class ReportListItemResponse(BaseModel):
    id: Optional[int] = None  # None if research not yet completed
    idea_id: int
    job_id: int
    idea_name: str
    idea_description: str
    status: str
    current_stage: str
    opportunity_score: Optional[int] = None
    score_status: Optional[str] = None
    created_at: datetime
