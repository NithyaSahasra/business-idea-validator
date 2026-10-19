import pytest
import asyncio
from app.models import Idea, ResearchJob, Source, Report
from app.services.research_service import ResearchService


def test_submit_idea_and_queue_job(client, user_a_token, db_session):
    headers = {"Authorization": f"Bearer {user_a_token}"}
    payload = {
        "name": "UniStudy AI",
        "description": "An AI study assistant for university students to automatically generate flashcards and quizzes from lecture slides.",
        "problem": "Students spend hours creating revision materials instead of actively studying.",
        "target_audience": "University undergraduates in STEM",
        "geography": "United States",
        "category": "EdTech",
        "business_model": "Freemium SaaS ($9/mo)",
        "known_competitors": "Quizlet, Anki"
    }

    res = client.post("/api/ideas", json=payload, headers=headers)
    assert res.status_code == 201
    data = res.json()
    assert "idea_id" in data
    assert "research_job_id" in data
    assert data["status"] == "queued"
    assert data["current_stage"] == "understanding_idea"

    # Cannot submit identical duplicate active idea
    dup_res = client.post("/api/ideas", json=payload, headers=headers)
    assert dup_res.status_code == 409


@pytest.mark.asyncio
async def test_process_job_pipeline(client, user_a_token, db_session):
    headers = {"Authorization": f"Bearer {user_a_token}"}
    payload = {
        "name": "DevAudit",
        "description": "Automated pull request security auditing for solo indie hackers.",
        "problem": "Solo developers deploy insecure code because enterprise audits cost thousands.",
        "target_audience": "Indie developers and small startup founders",
        "geography": "Global",
        "category": "Developer Tools",
        "business_model": "Pay per audit ($15)",
        "known_competitors": "Snyk, Veracode"
    }
    res = client.post("/api/ideas", json=payload, headers=headers)
    job_id = res.json()["research_job_id"]

    job = db_session.query(ResearchJob).filter(ResearchJob.id == job_id).first()
    assert job is not None

    # Run the research service processor
    success = await ResearchService.process_job(db_session, job)
    assert success is True
    assert job.status == "completed"

    # Verify sources were persisted
    sources = db_session.query(Source).filter(Source.research_job_id == job_id).all()
    assert len(sources) > 0

    # Verify report was created
    report = db_session.query(Report).filter(Report.research_job_id == job_id).first()
    assert report is not None
    assert report.opportunity_score is not None
    assert report.opportunity_score > 0

    # Query status endpoint via client
    status_res = client.get(f"/api/research/{job_id}/status", headers=headers)
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["status"] == "completed"
    assert status_data["report_id"] == report.id


def test_research_retry(client, user_a_token, db_session):
    headers = {"Authorization": f"Bearer {user_a_token}"}
    payload = {
        "name": "RetryMe App",
        "description": "A test application to verify failed job retry mechanism.",
        "problem": "Verifying retry without duplicates.",
        "target_audience": "QA testers",
        "geography": "US"
    }
    res = client.post("/api/ideas", json=payload, headers=headers)
    job_id = res.json()["research_job_id"]

    # Manually mark as failed
    job = db_session.query(ResearchJob).filter(ResearchJob.id == job_id).first()
    job.status = "failed"
    job.error_message = "Test simulated network failure"
    db_session.commit()

    # Retry job
    retry_res = client.post(f"/api/research/{job_id}/retry", headers=headers)
    assert retry_res.status_code == 200
    retry_data = retry_res.json()
    assert retry_data["status"] == "queued"
    assert retry_data["attempt_count"] == 1
