from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.v1.deps import require_role
from app.db.session import get_db
from app.models.tag import Tag
from app.models.user import User
from app.schemas.tag import TagCreate, TagRead
from app.utils.slug import slugify

router = APIRouter(prefix="/tags", tags=["tags"])


async def _unique_slug(base: str, db: AsyncSession) -> str:
    slug = slugify(base)
    counter = 1
    while True:
        existing = (await db.execute(select(Tag).where(Tag.slug == slug))).scalar_one_or_none()
        if not existing:
            return slug
        slug = f"{slugify(base)}-{counter}"
        counter += 1


@router.get("", response_model=list[TagRead])
async def list_tags(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Tag).order_by(Tag.name))
    return result.scalars().all()


@router.post("", response_model=TagRead, status_code=status.HTTP_201_CREATED)
async def create_tag(
    body: TagCreate,
    _: User = Depends(require_role("admin", "editor")),
    db: AsyncSession = Depends(get_db),
):
    existing = (await db.execute(select(Tag).where(Tag.name == body.name))).scalar_one_or_none()
    if existing:
        return existing
    slug = await _unique_slug(body.name, db)
    tag = Tag(name=body.name, slug=slug)
    db.add(tag)
    await db.flush()
    await db.refresh(tag)
    return tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: int,
    _: User = Depends(require_role("admin")),
    db: AsyncSession = Depends(get_db),
):
    tag = await db.get(Tag, tag_id)
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    await db.delete(tag)
