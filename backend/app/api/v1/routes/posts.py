from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.v1.deps import get_current_user, require_role
from app.db.session import get_db
from app.models.category import Category
from app.models.post import Post
from app.models.tag import Tag
from app.models.user import User
from app.schemas.common import PaginatedResponse
from app.schemas.post import PostCreate, PostList, PostRead, PostUpdate
from app.utils.slug import slugify

router = APIRouter(prefix="/posts", tags=["posts"])

_POST_OPTIONS = [
    selectinload(Post.author),
    selectinload(Post.category),
    selectinload(Post.tags),
]


async def _unique_slug(base: str, db: AsyncSession, exclude_id: int | None = None) -> str:
    slug = slugify(base)
    counter = 1
    while True:
        q = select(Post).where(Post.slug == slug)
        if exclude_id:
            q = q.where(Post.id != exclude_id)
        existing = (await db.execute(q)).scalar_one_or_none()
        if not existing:
            return slug
        slug = f"{slugify(base)}-{counter}"
        counter += 1


def _can_edit(post: Post, user: User) -> bool:
    return user.role == "admin" or post.author_id == user.id


@router.get("", response_model=PaginatedResponse[PostList])
async def list_posts(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    q: Optional[str] = None,
    category: Optional[str] = None,
    tag: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
):
    query = select(Post).options(*_POST_OPTIONS)

    if status_filter:
        query = query.where(Post.status == status_filter)
    else:
        query = query.where(Post.status == "published")

    if q:
        query = query.where(
            or_(Post.title.ilike(f"%{q}%"), Post.content.ilike(f"%{q}%"))
        )
    if category:
        query = query.join(Category).where(Category.slug == category)
    if tag:
        query = query.join(Post.tags).where(Tag.slug == tag)

    total_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = total_result.scalar_one()

    query = query.offset((page - 1) * per_page).limit(per_page).order_by(Post.created_at.desc())
    result = await db.execute(query)
    posts = result.scalars().all()

    return PaginatedResponse.build(
        data=[PostList.model_validate(p) for p in posts],
        total=total,
        page=page,
        per_page=per_page,
    )


@router.post("", response_model=PostRead, status_code=status.HTTP_201_CREATED)
async def create_post(
    body: PostCreate,
    current_user: User = Depends(require_role("admin", "editor")),
    db: AsyncSession = Depends(get_db),
):
    slug = await _unique_slug(body.title, db)
    post = Post(
        title=body.title,
        slug=slug,
        content=body.content,
        excerpt=body.excerpt,
        category_id=body.category_id,
        author_id=current_user.id,
        status="draft",
    )
    if body.tag_ids:
        tags = (await db.execute(select(Tag).where(Tag.id.in_(body.tag_ids)))).scalars().all()
        post.tags = list(tags)

    db.add(post)
    await db.flush()

    result = await db.execute(
        select(Post).options(*_POST_OPTIONS).where(Post.id == post.id)
    )
    return result.scalar_one()


@router.get("/{slug}", response_model=PostRead)
async def get_post(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Post).options(*_POST_OPTIONS).where(Post.slug == slug)
    )
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@router.put("/{post_id}", response_model=PostRead)
async def update_post(
    post_id: int,
    body: PostUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if not _can_edit(post, current_user):
        raise HTTPException(status_code=403, detail="Not allowed to edit this post")

    if body.title is not None:
        post.title = body.title
        post.slug = await _unique_slug(body.title, db, exclude_id=post_id)
    if body.content is not None:
        post.content = body.content
    if body.excerpt is not None:
        post.excerpt = body.excerpt
    if body.category_id is not None:
        post.category_id = body.category_id
    if body.tag_ids is not None:
        tags = (await db.execute(select(Tag).where(Tag.id.in_(body.tag_ids)))).scalars().all()
        post.tags = list(tags)

    db.add(post)
    await db.flush()

    result = await db.execute(
        select(Post).options(*_POST_OPTIONS).where(Post.id == post.id)
    )
    return result.scalar_one()


@router.delete("/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if not _can_edit(post, current_user):
        raise HTTPException(status_code=403, detail="Not allowed to delete this post")
    await db.delete(post)


@router.patch("/{post_id}/publish", response_model=PostRead)
async def publish_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if not _can_edit(post, current_user):
        raise HTTPException(status_code=403, detail="Not allowed")
    post.status = "published"
    post.published_at = datetime.now(timezone.utc)
    db.add(post)
    await db.flush()
    result = await db.execute(select(Post).options(*_POST_OPTIONS).where(Post.id == post_id))
    return result.scalar_one()


@router.patch("/{post_id}/unpublish", response_model=PostRead)
async def unpublish_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await db.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if not _can_edit(post, current_user):
        raise HTTPException(status_code=403, detail="Not allowed")
    post.status = "draft"
    db.add(post)
    await db.flush()
    result = await db.execute(select(Post).options(*_POST_OPTIONS).where(Post.id == post_id))
    return result.scalar_one()
