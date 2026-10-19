from app.services.auth_service import AuthService
from app.models import User, AuthToken


def test_signup_successful(client, db_session):
    payload = {
        "full_name": "Test Student",
        "email": "student@university.edu",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    response = client.post("/api/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert data["dev_token"] is not None

    user = db_session.query(User).filter(User.email == "student@university.edu").first()
    assert user is not None
    assert user.is_email_verified is False
    assert AuthService.verify_password("Password123!", user.password_hash)


def test_signup_duplicate_email(client):
    payload = {
        "full_name": "Duplicate User",
        "email": "dup@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    r1 = client.post("/api/auth/signup", json=payload)
    assert r1.status_code == 201
    r2 = client.post("/api/auth/signup", json=payload)
    assert r2.status_code == 400
    assert "already exists" in r2.json()["detail"]


def test_signup_password_mismatch(client):
    payload = {
        "full_name": "Mismatch User",
        "email": "mismatch@example.com",
        "password": "Password123!",
        "confirm_password": "DifferentPassword456!"
    }
    r = client.post("/api/auth/signup", json=payload)
    assert r.status_code == 422


def test_verify_email_single_use(client, db_session):
    # Sign up user
    payload = {
        "full_name": "Verify Me",
        "email": "verify@test.com",
        "password": "Password123!",
        "confirm_password": "Password123!"
    }
    res = client.post("/api/auth/signup", json=payload)
    dev_token = res.json()["dev_token"]

    # Verify once
    v1 = client.post("/api/auth/verify-email", json={"token": dev_token})
    assert v1.status_code == 200
    assert v1.json()["status"] == "success"

    # Verify second time (must fail as single-use)
    v2 = client.post("/api/auth/verify-email", json={"token": dev_token})
    assert v2.status_code == 400


def test_login_and_refresh_cycle(client, db_session):
    # Create verified user
    user = User(
        full_name="Login Tester",
        email="login@test.com",
        password_hash=AuthService.hash_password("MySecretPass99!"),
        is_email_verified=True
    )
    db_session.add(user)
    db_session.commit()

    # Login with wrong password
    bad_login = client.post("/api/auth/login", json={"email": "login@test.com", "password": "WrongPassword"})
    assert bad_login.status_code == 401

    # Login with correct password
    login_res = client.post("/api/auth/login", json={"email": "login@test.com", "password": "MySecretPass99!"})
    assert login_res.status_code == 200
    data = login_res.json()
    assert "access_token" in data
    assert data["user"]["email"] == "login@test.com"
    assert "refresh_token" in login_res.cookies

    # Test protected /me endpoint with access token
    headers = {"Authorization": f"Bearer {data['access_token']}"}
    me_res = client.get("/api/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == "login@test.com"

    # Test refresh token rotation
    client.cookies.set("refresh_token", login_res.cookies["refresh_token"])
    refresh_res = client.post("/api/auth/refresh")
    assert refresh_res.status_code == 200
    refreshed_data = refresh_res.json()
    assert "access_token" in refreshed_data

    # Test logout revokes token
    logout_res = client.post("/api/auth/logout")
    assert logout_res.status_code == 200


def test_password_reset_flow(client, db_session):
    user = User(
        full_name="Reset Tester",
        email="reset@test.com",
        password_hash=AuthService.hash_password("OldPassword123!"),
        is_email_verified=True
    )
    db_session.add(user)
    db_session.commit()

    # Forgot password request
    req_res = client.post("/api/auth/forgot-password", json={"email": "reset@test.com"})
    assert req_res.status_code == 200
    dev_token = req_res.json()["dev_token"]
    assert dev_token is not None

    # Reset with token
    reset_res = client.post("/api/auth/reset-password", json={
        "token": dev_token,
        "password": "NewBrandPassword456!",
        "confirm_password": "NewBrandPassword456!"
    })
    assert reset_res.status_code == 200

    # Old password no longer works
    old_login = client.post("/api/auth/login", json={"email": "reset@test.com", "password": "OldPassword123!"})
    assert old_login.status_code == 401

    # New password works
    new_login = client.post("/api/auth/login", json={"email": "reset@test.com", "password": "NewBrandPassword456!"})
    assert new_login.status_code == 200


def test_protected_routes_reject_unauthenticated(client):
    r1 = client.get("/api/auth/me")
    assert r1.status_code == 401
    r2 = client.post("/api/ideas", json={"name": "Test", "description": "Desc", "problem": "Prob", "target_audience": "Aud", "geography": "US"})
    assert r2.status_code == 401
    r3 = client.get("/api/reports")
    assert r3.status_code == 401
