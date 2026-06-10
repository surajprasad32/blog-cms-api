import math
from typing import Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    data: list[T]
    total: int
    page: int
    per_page: int
    pages: int

    @classmethod
    def build(cls, data: list, total: int, page: int, per_page: int) -> "PaginatedResponse":
        pages = math.ceil(total / per_page) if per_page else 1
        return cls(data=data, total=total, page=page, per_page=per_page, pages=pages)
