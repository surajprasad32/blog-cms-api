import json
from typing import Any, List

from pydantic import PostgresDsn, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Every env variable the app needs is declared here as a typed field.
    pydantic-settings reads them from .env automatically on instantiation.
    Missing required fields = crash on startup, not during a live request.
    """

    # Project metadata
    PROJECT_NAME: str = "Blog CMS API"
    VERSION:      str = "0.1.0"
    API_PREFIX:   str = "/api/v1"

    # Database — no default, required, must exist in .env
    DATABASE_URL: PostgresDsn

    # JWT auth
    SECRET_KEY:                  str
    ALGORITHM:                   str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS:   int = 7

    # CORS — accepts JSON array, comma-separated string, or a single URL
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    # Environment flag — use to toggle debug behaviour
    ENVIRONMENT: str = "development"

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_allowed_origins(cls, v: Any) -> List[str]:
        if isinstance(v, list):
            return v
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return ["http://localhost:3000"]
            if v.startswith("["):
                return json.loads(v)
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,   # DATABASE_URL == database_url
        extra="ignore",         # unknown .env vars are silently ignored
    )


# Instantiated once at module level — this is the singleton
settings = Settings()