from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.category import CategoryRead
from app.schemas.tag import TagRead
from app.schemas.user import UserPublic


class PostCreate(BaseModel):
    title: str
    content: str
    excerpt: Optional[str] = None
    category_id: Optional[int] = None
    tag_ids: list[int] = []


class PostUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    excerpt: Optional[str] = None
    category_id: Optional[int] = None
    tag_ids: Optional[list[int]] = None


class PostRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    content: str
    excerpt: Optional[str]
    status: str
    published_at: Optional[datetime]
    author: UserPublic
    category: Optional[CategoryRead]
    tags: list[TagRead]
    created_at: datetime
    updated_at: datetime


class PostList(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    excerpt: Optional[str]
    status: str
    published_at: Optional[datetime]
    author: UserPublic
    category: Optional[CategoryRead]
    tags: list[TagRead]
    created_at: datetime
