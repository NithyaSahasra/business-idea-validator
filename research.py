from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime


class ResearchJobStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    idea_id: int
    idea_name: Optional[str] = None
    idea_description: Optional[str] = None
    status: str
    current_stage: str
    progress_updated_at: datetime
    attempt_count: int
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    report_id: Optional[int] = None
