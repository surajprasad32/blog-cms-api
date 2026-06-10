from httpx import AsyncClient

from app.models.user import User
from tests.conftest import auth_headers


async def test_list_tags_empty(client: AsyncClient):
    r = await client.get("/api/v1/tags")
    assert r.status_code == 200
    assert r.json() == []


async def test_create_tag_editor(client: AsyncClient, editor_user: User):
    r = await client.post(
        "/api/v1/tags",
        json={"name": "Python"},
        headers=auth_headers(editor_user),
    )
    assert r.status_code == 201
    data = r.json()
    assert data["name"] == "Python"
    assert data["slug"] == "python"
    assert "id" in data


async def test_create_tag_idempotent(client: AsyncClient, editor_user: User):
    # First creation
    first = await client.post(
        "/api/v1/tags",
        json={"name": "FastAPI"},
        headers=auth_headers(editor_user),
    )
    assert first.status_code == 201
    first_id = first.json()["id"]

    # Second creation with the same name — returns existing tag
    second = await client.post(
        "/api/v1/tags",
        json={"name": "FastAPI"},
        headers=auth_headers(editor_user),
    )
    # Returns 201 but with the same object (idempotent)
    assert second.status_code == 201
    assert second.json()["id"] == first_id


async def test_create_tag_reader_forbidden(client: AsyncClient, reader_user: User):
    r = await client.post(
        "/api/v1/tags",
        json={"name": "Forbidden"},
        headers=auth_headers(reader_user),
    )
    assert r.status_code == 403


async def test_delete_tag_admin(client: AsyncClient, admin_user: User, editor_user: User):
    # Editor creates the tag
    create_r = await client.post(
        "/api/v1/tags",
        json={"name": "ToDelete"},
        headers=auth_headers(editor_user),
    )
    tag_id = create_r.json()["id"]

    # Admin deletes it
    r = await client.delete(
        f"/api/v1/tags/{tag_id}",
        headers=auth_headers(admin_user),
    )
    assert r.status_code == 204

    # Confirm it's gone
    tags = await client.get("/api/v1/tags")
    assert all(t["id"] != tag_id for t in tags.json())


async def test_delete_tag_non_admin_forbidden(client: AsyncClient, editor_user: User):
    # Editor creates a tag
    create_r = await client.post(
        "/api/v1/tags",
        json={"name": "CannotDelete"},
        headers=auth_headers(editor_user),
    )
    tag_id = create_r.json()["id"]

    # Editor tries to delete — only admin can delete
    r = await client.delete(
        f"/api/v1/tags/{tag_id}",
        headers=auth_headers(editor_user),
    )
    assert r.status_code == 403
