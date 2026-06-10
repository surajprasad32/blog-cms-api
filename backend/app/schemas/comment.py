from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.user import UserPublic


class CommentCreate(BaseModel):
    content: str
    parent_id: Optional[int] = None


class CommentUpdate(BaseModel):
    content: str


class CommentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    content: str
    author: UserPublic
    post_id: int
    parent_id: Optional[int]
    replies: list[CommentRead] = []
    created_at: datetime
    updated_at: datetime


CommentRead.model_rebuild()
