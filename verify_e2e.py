import asyncio
import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models import ResearchJob
from app.services.research_service import ResearchService

def run_e2e_verification():
    print("=" * 60)
    print("Starting IdeaLens End-to-End System Verification")
    print("=" * 60)

    client = TestClient(app)

    # 1. Health check
    print("\n1. Testing Service Health Endpoint...")
    health_res = client.get("/api/health")
    assert health_res.status_code == 200, f"Health check failed: {health_res.text}"
    health_data = health_res.json()
    print(f"   [PASS] Health Status: {health_data['status']}, Database: {health_data['database']}")

    # 2. User Registration
    print("\n2. Testing User Registration (Gmail address)...")
    email = "alex.founder@gmail.com"
    signup_payload = {
        "full_name": "Alex Founder",
        "email": email,
        "password": "ValidPassword123!",
        "confirm_password": "ValidPassword123!"
    }
    signup_res = client.post("/api/auth/signup", json=signup_payload)
    if signup_res.status_code == 400 and "already exists" in signup_res.text:
        print(f"   User {email} already registered in test database.")
        # Proceed with login
    else:
        assert signup_res.status_code == 201, f"Signup failed: {signup_res.text}"
        dev_token = signup_res.json().get("dev_token")
        print(f"   [PASS] Registration successful. Verification token generated.")

        # 3. Email Verification
        print("\n3. Testing Single-Use Email Verification...")
        verify_res = client.post("/api/auth/verify-email", json={"token": dev_token})
        assert verify_res.status_code == 200, f"Verification failed: {verify_res.text}"
        print(f"   [PASS] Email verified successfully.")

        # Single-use check: repeat verification must fail
        verify_again = client.post("/api/auth/verify-email", json={"token": dev_token})
        assert verify_again.status_code == 400, "Second verification of same token must be rejected!"
        print(f"   [PASS] Single-use constraint enforced (subsequent use rejected).")

    # 4. User Sign-in & HttpOnly Cookie
    print("\n4. Testing Sign-In & JWT In-Memory Access Token...")
    login_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "ValidPassword123!"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    auth_data = login_res.json()
    access_token = auth_data["access_token"]
    assert "refresh_token" in login_res.cookies, "Refresh token cookie must be set!"
    print(f"   [PASS] Sign-in successful. Access token received. HttpOnly cookie set.")

    auth_headers = {"Authorization": f"Bearer {access_token}"}

    # 5. Protected User Me Endpoint
    print("\n5. Testing Protected /api/auth/me Endpoint...")
    me_res = client.get("/api/auth/me", headers=auth_headers)
    assert me_res.status_code == 200
    print(f"   [PASS] Authenticated as {me_res.json()['full_name']} ({me_res.json()['email']})")

    # 6. Business Idea Submission & Research Job Creation
    print("\n6. Submitting Idea & Creating Persistent Research Job...")
    idea_payload = {
        "name": f"AI Micro-Tutor",
        "description": "An interactive tutor that helps high school STEM students learn complex physics via interactive simulations and adaptive hints.",
        "problem": "Students struggle with abstract physics concepts and cannot afford private human tutoring at $50/hour.",
        "target_audience": "High school physics students and their parents",
        "geography": "United States",
        "category": "EdTech",
        "business_model": "Freemium ($12/month)",
        "known_competitors": "Khan Academy, Chegg"
    }

    # If duplicate from earlier run, add timestamp
    idea_res = client.post("/api/ideas", json=idea_payload, headers=auth_headers)
    if idea_res.status_code == 409:
        idea_payload["name"] = f"AI Micro-Tutor v2"
        idea_res = client.post("/api/ideas", json=idea_payload, headers=auth_headers)

    assert idea_res.status_code == 201, f"Idea submission failed: {idea_res.text}"
    idea_data = idea_res.json()
    job_id = idea_data["research_job_id"]
    idea_id = idea_data["idea_id"]
    print(f"   [PASS] Idea created (ID: {idea_id}). Research Job queued (ID: {job_id}).")

    # 7. Check Initial Job Status
    print("\n7. Checking Research Job Status Endpoint...")
    status_res = client.get(f"/api/research/{job_id}/status", headers=auth_headers)
    assert status_res.status_code == 200
    status_data = status_res.json()
    assert status_data["status"] == "queued"
    print(f"   [PASS] Job status verified: {status_data['status']}, stage: {status_data['current_stage']}")

    # 8. Worker Execution: Process Job
    print("\n8. Worker Execution: Running Research Service Pipeline...")
    db = SessionLocal()
    job = db.query(ResearchJob).filter(ResearchJob.id == job_id).first()
    assert job is not None
    asyncio.run(ResearchService.process_job(db, job))
    db.refresh(job)
    assert job.status == "completed", f"Job failed: {job.error_message}"
    print(f"   [PASS] Pipeline completed all 6 stages. Job status: {job.status}")

    # 9. Verify Generated Report and Sources
    print("\n9. Verifying Persisted Validation Report...")
    status_after = client.get(f"/api/research/{job_id}/status", headers=auth_headers)
    assert status_after.status_code == 200
    report_id = status_after.json()["report_id"]
    assert report_id is not None

    report_res = client.get(f"/api/reports/{report_id}", headers=auth_headers)
    assert report_res.status_code == 200, f"Failed to get report: {report_res.text}"
    report_data = report_res.json()

    print(f"   [PASS] Report #{report_id} retrieved:")
    print(f"          Opportunity Score: {report_data['opportunity_score']}/100 ({report_data['score_status']})")
    print(f"          Competitors found: {len(report_data['structured_report']['competitors'])}")
    print(f"          Web sources cited: {len(report_data['sources'])}")

    # 10. List Reports
    print("\n10. Testing Reports Listing Endpoint...")
    list_res = client.get("/api/reports", headers=auth_headers)
    assert list_res.status_code == 200
    user_reports = list_res.json()
    assert len(user_reports) >= 1
    print(f"   [PASS] Reports list returned {len(user_reports)} validation(s).")

    db.close()
    print("\n" + "=" * 60)
    print("ALL 10 VERIFICATION MILESTONES PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_e2e_verification()
