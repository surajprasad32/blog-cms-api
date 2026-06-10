from httpx import AsyncClient


async def test_register_success(client: AsyncClient):
    r = await client.post(
        "/api/v1/auth/register",
        json={"email": "new@test.com", "username": "newuser", "password": "password123"},
    )
    assert r.status_code == 201
    data = r.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


async def test_register_duplicate_email(client: AsyncClient):
    payload = {"email": "dup@test.com", "username": "user1", "password": "password123"}
    await client.post("/api/v1/auth/register", json=payload)
    payload2 = {"email": "dup@test.com", "username": "user2", "password": "password123"}
    r = await client.post("/api/v1/auth/register", json=payload2)
    assert r.status_code == 409


async def test_login_success(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "login@test.com", "username": "loginuser", "password": "password123"},
    )
    r = await client.post(
        "/api/v1/auth/login",
        data={"username": "login@test.com", "password": "password123"},
    )
    assert r.status_code == 200
    assert "access_token" in r.json()


async def test_login_wrong_password(client: AsyncClient):
    await client.post(
        "/api/v1/auth/register",
        json={"email": "wp@test.com", "username": "wpuser", "password": "password123"},
    )
    r = await client.post(
        "/api/v1/auth/login",
        data={"username": "wp@test.com", "password": "wrongpass"},
    )
    assert r.status_code == 401


async def test_refresh_token(client: AsyncClient):
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": "ref@test.com", "username": "refuser", "password": "password123"},
    )
    refresh_token = reg.json()["refresh_token"]
    r = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert r.status_code == 200
    assert "access_token" in r.json()


async def test_get_me(client: AsyncClient):
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": "me@test.com", "username": "meuser", "password": "password123"},
    )
    token = reg.json()["access_token"]
    r = await client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "me@test.com"


async def test_register_short_password(client: AsyncClient):
    r = await client.post(
        "/api/v1/auth/register",
        json={"email": "short@test.com", "username": "shortpw", "password": "abc"},
    )
    assert r.status_code == 422
