from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class SourceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    research_job_id: int
    title: str
    url: str
    source_type: str
    retrieved_at: datetime
    published_at: Optional[datetime] = None
    evidence_summary: str
    relevance_score: Optional[float] = None
