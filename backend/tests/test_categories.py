import pytest
from httpx import AsyncClient

from tests.conftest import auth_headers
from app.models.user import User


async def test_list_categories_public(client: AsyncClient):
    r = await client.get("/api/v1/categories")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


async def test_create_category_admin(client: AsyncClient, admin_user: User):
    r = await client.post(
        "/api/v1/categories",
        json={"name": "Technology", "description": "Tech posts"},
        headers=auth_headers(admin_user),
    )
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Technology"
    assert data["slug"] == "technology"


async def test_create_category_non_admin_forbidden(client: AsyncClient, editor_user: User):
    r = await client.post(
        "/api/v1/categories",
        json={"name": "Unauthorized"},
        headers=auth_headers(editor_user),
    )
    assert r.status_code == 403


async def test_update_category(client: AsyncClient, admin_user: User):
    create_r = await client.post(
        "/api/v1/categories",
        json={"name": "OldName"},
        headers=auth_headers(admin_user),
    )
    cat_id = create_r.json()["id"]
    r = await client.put(
        f"/api/v1/categories/{cat_id}",
        json={"name": "NewName"},
        headers=auth_headers(admin_user),
    )
    assert r.status_code == 200
    assert r.json()["name"] == "NewName"
    assert r.json()["slug"] == "newname"


async def test_delete_category(client: AsyncClient, admin_user: User):
    create_r = await client.post(
        "/api/v1/categories",
        json={"name": "ToDelete"},
        headers=auth_headers(admin_user),
    )
    cat_id = create_r.json()["id"]
    r = await client.delete(
        f"/api/v1/categories/{cat_id}",
        headers=auth_headers(admin_user),
    )
    assert r.status_code == 204


async def test_delete_nonexistent_category(client: AsyncClient, admin_user: User):
    r = await client.delete(
        "/api/v1/categories/99999",
        headers=auth_headers(admin_user),
    )
    assert r.status_code == 404
