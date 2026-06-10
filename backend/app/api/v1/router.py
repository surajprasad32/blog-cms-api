from fastapi import APIRouter

from app.api.v1.routes import auth, categories, comments, posts, tags, users

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(posts.router)
api_router.include_router(categories.router)
api_router.include_router(tags.router)
api_router.include_router(comments.router)
