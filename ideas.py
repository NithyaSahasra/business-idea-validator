from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class IdeaCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=255, description="Name of the business idea")
    description: str = Field(..., min_length=10, max_length=3000, description="Comprehensive description of the idea")
    problem: str = Field(..., min_length=10, max_length=2000, description="Core customer pain point being solved")
    target_audience: str = Field(..., min_length=5, max_length=1000, description="Target customer segment")
    geography: str = Field(..., min_length=2, max_length=255, description="Target market or geography")
    category: Optional[str] = Field(None, max_length=255, description="Industry or market category")
    business_model: Optional[str] = Field(None, max_length=255, description="Monetization model, e.g., B2B SaaS, Marketplace")
    known_competitors: Optional[str] = Field(None, max_length=2000, description="Any known competitors or alternatives")


class IdeaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    name: str
    description: str
    problem: str
    target_audience: str
    geography: str
    category: Optional[str]
    business_model: Optional[str]
    known_competitors: Optional[str]
    created_at: datetime
    updated_at: datetime


class IdeaSubmissionResponse(BaseModel):
    idea_id: int
    research_job_id: int
    status: str
    current_stage: str
    message: str = "Idea submitted and research queued successfully"
