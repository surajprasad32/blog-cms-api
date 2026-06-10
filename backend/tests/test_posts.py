import pytest
from httpx import AsyncClient

from tests.conftest import auth_headers
from app.models.user import User


async def test_create_post_as_editor(client: AsyncClient, editor_user: User):
    r = await client.post(
        "/api/v1/posts",
        json={"title": "My First Post", "content": "Hello world!"},
        headers=auth_headers(editor_user),
    )
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == "My First Post"
    assert data["slug"] == "my-first-post"
    assert data["status"] == "draft"


async def test_create_post_as_reader_forbidden(client: AsyncClient, reader_user: User):
    r = await client.post(
        "/api/v1/posts",
        json={"title": "Unauthorized", "content": "Nope"},
        headers=auth_headers(reader_user),
    )
    assert r.status_code == 403


async def test_list_posts_public(client: AsyncClient, editor_user: User):
    await client.post(
        "/api/v1/posts",
        json={"title": "Draft Post", "content": "Content"},
        headers=auth_headers(editor_user),
    )
    r = await client.get("/api/v1/posts")
    assert r.status_code == 200
    data = r.json()
    assert "data" in data
    assert data["total"] == 0  # draft not returned in public listing


async def test_publish_and_get_post(client: AsyncClient, editor_user: User):
    create_r = await client.post(
        "/api/v1/posts",
        json={"title": "Publish Me", "content": "Published content"},
        headers=auth_headers(editor_user),
    )
    post_id = create_r.json()["id"]
    slug = create_r.json()["slug"]

    pub_r = await client.patch(
        f"/api/v1/posts/{post_id}/publish",
        headers=auth_headers(editor_user),
    )
    assert pub_r.status_code == 200
    assert pub_r.json()["status"] == "published"

    get_r = await client.get(f"/api/v1/posts/{slug}")
    assert get_r.status_code == 200
    assert get_r.json()["title"] == "Publish Me"


async def test_update_post_owner(client: AsyncClient, editor_user: User):
    create_r = await client.post(
        "/api/v1/posts",
        json={"title": "Original", "content": "Original content"},
        headers=auth_headers(editor_user),
    )
    post_id = create_r.json()["id"]
    r = await client.put(
        f"/api/v1/posts/{post_id}",
        json={"title": "Updated Title"},
        headers=auth_headers(editor_user),
    )
    assert r.status_code == 200
    assert r.json()["title"] == "Updated Title"


async def test_delete_post(client: AsyncClient, editor_user: User):
    create_r = await client.post(
        "/api/v1/posts",
        json={"title": "To Delete", "content": "Bye"},
        headers=auth_headers(editor_user),
    )
    post_id = create_r.json()["id"]
    r = await client.delete(
        f"/api/v1/posts/{post_id}",
        headers=auth_headers(editor_user),
    )
    assert r.status_code == 204


async def test_get_nonexistent_post(client: AsyncClient):
    r = await client.get("/api/v1/posts/this-does-not-exist")
    assert r.status_code == 404


async def test_slug_uniqueness(client: AsyncClient, editor_user: User):
    await client.post(
        "/api/v1/posts",
        json={"title": "Duplicate Title", "content": "First"},
        headers=auth_headers(editor_user),
    )
    r2 = await client.post(
        "/api/v1/posts",
        json={"title": "Duplicate Title", "content": "Second"},
        headers=auth_headers(editor_user),
    )
    assert r2.status_code == 201
    assert r2.json()["slug"] == "duplicate-title-1"
