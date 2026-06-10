import pytest
from httpx import AsyncClient

from tests.conftest import auth_headers
from app.models.user import User


async def _create_post(client: AsyncClient, user: User, title: str = "Post") -> dict:
    r = await client.post(
        "/api/v1/posts",
        json={"title": title, "content": "Content here"},
        headers=auth_headers(user),
    )
    return r.json()


async def test_list_comments_on_post(client: AsyncClient, editor_user: User):
    post = await _create_post(client, editor_user)
    r = await client.get(f"/api/v1/posts/{post['id']}/comments")
    assert r.status_code == 200
    assert r.json() == []


async def test_create_comment(client: AsyncClient, editor_user: User, reader_user: User):
    post = await _create_post(client, editor_user)
    r = await client.post(
        f"/api/v1/posts/{post['id']}/comments",
        json={"content": "Great post!"},
        headers=auth_headers(reader_user),
    )
    assert r.status_code == 201
    data = r.json()
    assert data["content"] == "Great post!"
    assert data["parent_id"] is None


async def test_nested_comment(client: AsyncClient, editor_user: User, reader_user: User):
    post = await _create_post(client, editor_user)
    parent_r = await client.post(
        f"/api/v1/posts/{post['id']}/comments",
        json={"content": "Parent comment"},
        headers=auth_headers(reader_user),
    )
    parent_id = parent_r.json()["id"]

    reply_r = await client.post(
        f"/api/v1/posts/{post['id']}/comments",
        json={"content": "Reply comment", "parent_id": parent_id},
        headers=auth_headers(editor_user),
    )
    assert reply_r.status_code == 201
    assert reply_r.json()["parent_id"] == parent_id


async def test_update_comment_owner(client: AsyncClient, editor_user: User, reader_user: User):
    post = await _create_post(client, editor_user)
    comment_r = await client.post(
        f"/api/v1/posts/{post['id']}/comments",
        json={"content": "Original"},
        headers=auth_headers(reader_user),
    )
    comment_id = comment_r.json()["id"]

    r = await client.put(
        f"/api/v1/comments/{comment_id}",
        json={"content": "Edited"},
        headers=auth_headers(reader_user),
    )
    assert r.status_code == 200
    assert r.json()["content"] == "Edited"


async def test_update_comment_not_owner_forbidden(
    client: AsyncClient, editor_user: User, reader_user: User
):
    post = await _create_post(client, editor_user)
    comment_r = await client.post(
        f"/api/v1/posts/{post['id']}/comments",
        json={"content": "Reader comment"},
        headers=auth_headers(reader_user),
    )
    comment_id = comment_r.json()["id"]

    r = await client.put(
        f"/api/v1/comments/{comment_id}",
        json={"content": "Hack"},
        headers=auth_headers(editor_user),
    )
    assert r.status_code == 403


async def test_delete_comment(client: AsyncClient, editor_user: User, reader_user: User):
    post = await _create_post(client, editor_user)
    comment_r = await client.post(
        f"/api/v1/posts/{post['id']}/comments",
        json={"content": "Delete me"},
        headers=auth_headers(reader_user),
    )
    comment_id = comment_r.json()["id"]

    r = await client.delete(
        f"/api/v1/comments/{comment_id}",
        headers=auth_headers(reader_user),
    )
    assert r.status_code == 204


async def test_comment_on_nonexistent_post(client: AsyncClient, reader_user: User):
    r = await client.post(
        "/api/v1/posts/99999/comments",
        json={"content": "Ghost comment"},
        headers=auth_headers(reader_user),
    )
    assert r.status_code == 404
