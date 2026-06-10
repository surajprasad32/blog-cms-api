from httpx import AsyncClient

from app.models.user import User
from tests.conftest import auth_headers


async def test_get_me(client: AsyncClient, reader_user: User):
    r = await client.get("/api/v1/users/me", headers=auth_headers(reader_user))
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == reader_user.email
    assert data["username"] == reader_user.username
    assert data["role"] == "reader"


async def test_update_me_username(client: AsyncClient, reader_user: User):
    r = await client.put(
        "/api/v1/users/me",
        json={"username": "updatedreader"},
        headers=auth_headers(reader_user),
    )
    assert r.status_code == 200
    assert r.json()["username"] == "updatedreader"


async def test_update_me_duplicate_email(client: AsyncClient, admin_user: User, reader_user: User):
    # reader tries to change their email to the admin's email
    r = await client.put(
        "/api/v1/users/me",
        json={"email": admin_user.email},
        headers=auth_headers(reader_user),
    )
    assert r.status_code == 409


async def test_list_users_admin(client: AsyncClient, admin_user: User, reader_user: User):
    r = await client.get("/api/v1/users", headers=auth_headers(admin_user))
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    emails = [u["email"] for u in data]
    assert admin_user.email in emails
    assert reader_user.email in emails


async def test_list_users_non_admin_forbidden(client: AsyncClient, reader_user: User):
    r = await client.get("/api/v1/users", headers=auth_headers(reader_user))
    assert r.status_code == 403


async def test_delete_user_admin(client: AsyncClient, admin_user: User):
    # Register a throwaway user to delete
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": "todelete@test.com", "username": "todelete", "password": "password123"},
    )
    assert reg.status_code == 201

    # Find the user ID via list endpoint
    users_r = await client.get("/api/v1/users", headers=auth_headers(admin_user))
    target = next(u for u in users_r.json() if u["email"] == "todelete@test.com")

    r = await client.delete(
        f"/api/v1/users/{target['id']}",
        headers=auth_headers(admin_user),
    )
    assert r.status_code == 204


async def test_admin_cannot_self_delete(client: AsyncClient, admin_user: User):
    r = await client.delete(
        f"/api/v1/users/{admin_user.id}",
        headers=auth_headers(admin_user),
    )
    assert r.status_code == 400
    assert "yourself" in r.json()["detail"].lower()
