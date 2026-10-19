import pytest
import asyncio
from app.services.research_service import ResearchService
from app.models import ResearchJob, Report, Idea, Source


@pytest.mark.asyncio
async def test_cross_user_isolation(client, user_a_token, user_b_token, db_session):
    headers_a = {"Authorization": f"Bearer {user_a_token}"}
    headers_b = {"Authorization": f"Bearer {user_b_token}"}

    # User A creates an idea
    idea_payload = {
        "name": "Secret Enterprise App",
        "description": "User A private proprietary idea to validate confidential markets.",
        "problem": "Confidential customer problems.",
        "target_audience": "Enterprise CFOs",
        "geography": "North America"
    }
    res_a = client.post("/api/ideas", json=idea_payload, headers=headers_a)
    assert res_a.status_code == 201
    job_id = res_a.json()["research_job_id"]

    # Process User A's job to completion
    job = db_session.query(ResearchJob).filter(ResearchJob.id == job_id).first()
    await ResearchService.process_job(db_session, job)
    report = db_session.query(Report).filter(Report.research_job_id == job_id).first()
    assert report is not None
    report_id = report.id

    # User A can view their own report
    view_a = client.get(f"/api/reports/{report_id}", headers=headers_a)
    assert view_a.status_code == 200
    assert view_a.json()["idea"]["name"] == "Secret Enterprise App"

    # User B CANNOT view User A's job status (403 Forbidden)
    status_b = client.get(f"/api/research/{job_id}/status", headers=headers_b)
    assert status_b.status_code == 403

    # User B CANNOT view User A's report (403 Forbidden)
    view_b = client.get(f"/api/reports/{report_id}", headers=headers_b)
    assert view_b.status_code == 403

    # User B CANNOT delete User A's report (403 Forbidden)
    del_b = client.delete(f"/api/reports/{report_id}", headers=headers_b)
    assert del_b.status_code == 403

    # User B's report list does not show User A's report
    list_b = client.get("/api/reports", headers=headers_b)
    assert list_b.status_code == 200
    assert len(list_b.json()) == 0

    # User A deletes their report -> cascaded deletion
    del_a = client.delete(f"/api/reports/{report_id}", headers=headers_a)
    assert del_a.status_code == 200

    # Verify cascades in DB
    assert db_session.query(Idea).filter(Idea.id == job.idea_id).first() is None
    assert db_session.query(ResearchJob).filter(ResearchJob.id == job_id).first() is None
    assert db_session.query(Report).filter(Report.id == report_id).first() is None
    assert db_session.query(Source).filter(Source.research_job_id == job_id).first() is None
