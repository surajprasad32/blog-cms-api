# blog-cms-api

A REST API for a blog/CMS platform built with **FastAPI** and **PostgreSQL**. Covers auth, posts, categories, tags, and threaded comments — with JWT-based auth and role-based permissions.

I built this to get deeper with async Python — the whole stack is async end-to-end (FastAPI + SQLAlchemy asyncio + asyncpg), with Alembic managing schema migrations and Docker Compose bundling the whole thing.

![Python](https://img.shields.io/badge/python-3.11-blue?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/docker-compose-2496ED?logo=docker&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-green)

---

## What it does

- **Auth** — register/login with JWT access + refresh tokens; refresh token revocation via a JTI blacklist
- **Roles** — `admin`, `editor`, `reader`; enforced per-endpoint with FastAPI dependencies
- **Posts** — full CRUD, auto-generated slugs, `draft → published → archived` workflow, publish/unpublish endpoints
- **Categories & Tags** — admin manages categories; editors can create tags (idempotent by name)
- **Comments** — threaded replies using a self-referential model (parent_id)
- **Search & filters** — posts filterable by search query, category slug, tag slug, and status
- **Pagination** — generic `PaginatedResponse[T]` across all list endpoints

---

## Running it

**With Docker (easiest):**

```bash
git clone https://github.com/surajprasad32/blog-cms-api.git
cd blog-cms-api

docker-compose up --build

# First time — run migrations
docker-compose exec app alembic upgrade head
```

| | URL |
|---|---|
| API | http://localhost:8000/api/v1 |
| Swagger docs | http://localhost:8000/api/v1/docs |
| ReDoc | http://localhost:8000/api/v1/redoc |
| pgAdmin | http://localhost:5050 |

**Without Docker:**

```bash
cd backend
python -m venv .venv && .venv\Scripts\activate   # or source .venv/bin/activate on Mac/Linux

pip install -r requirements.txt

cp .env.example .env
# fill in DATABASE_URL and SECRET_KEY
# generate a key: python -c "import secrets; print(secrets.token_hex(32))"

alembic upgrade head
uvicorn app.main:app --reload
```

---

## API overview

`/api/v1` prefix on all routes.

**Auth**

| Method | Path | Auth |
|--------|------|------|
| POST | `/auth/register` | — |
| POST | `/auth/login` | — |
| POST | `/auth/refresh` | — |
| POST | `/auth/logout` | Bearer |

**Users**

| Method | Path | Auth |
|--------|------|------|
| GET | `/users/me` | Bearer |
| PUT | `/users/me` | Bearer |
| GET | `/users` | admin |
| GET | `/users/{id}` | admin |
| DELETE | `/users/{id}` | admin |

**Posts**

| Method | Path | Auth |
|--------|------|------|
| GET | `/posts` | — |
| POST | `/posts` | editor+ |
| GET | `/posts/{slug}` | — |
| PUT | `/posts/{id}` | owner / admin |
| DELETE | `/posts/{id}` | owner / admin |
| PATCH | `/posts/{id}/publish` | owner / admin |
| PATCH | `/posts/{id}/unpublish` | owner / admin |

> `GET /posts` supports: `?q=`, `?category=`, `?tag=`, `?status=`, `?page=`, `?per_page=`

**Categories**

| Method | Path | Auth |
|--------|------|------|
| GET | `/categories` | — |
| POST | `/categories` | admin |
| PUT | `/categories/{id}` | admin |
| DELETE | `/categories/{id}` | admin |

**Tags**

| Method | Path | Auth |
|--------|------|------|
| GET | `/tags` | — |
| POST | `/tags` | editor+ |
| DELETE | `/tags/{id}` | admin |

**Comments**

| Method | Path | Auth |
|--------|------|------|
| GET | `/posts/{id}/comments` | — |
| POST | `/posts/{id}/comments` | Bearer |
| PUT | `/comments/{id}` | owner / admin |
| DELETE | `/comments/{id}` | owner / admin |

---

## Tests

Uses an in-memory SQLite DB so you don't need Postgres running locally.

```bash
cd backend
pytest --cov=app --cov-report=term-missing
```

---

## Project structure

```
blog-cms/
├── docker-compose.yml
├── .github/workflows/ci.yml    # lint + security scan + tests + docker build
└── backend/
    ├── Dockerfile
    ├── requirements.txt
    ├── alembic/
    │   └── env.py              # async alembic setup
    └── app/
        ├── main.py
        ├── core/
        │   ├── config.py       # pydantic-settings
        │   └── security.py     # bcrypt + JWT
        ├── db/
        │   ├── base.py         # async engine + Base
        │   └── session.py      # get_db dependency
        ├── models/             # User, Post, Category, Tag, Comment, RevokedToken
        ├── schemas/            # Pydantic schemas (Create / Read / Update)
        ├── api/v1/
        │   ├── deps.py         # get_current_user, require_role()
        │   └── routes/         # auth, users, posts, categories, tags, comments
        └── tests/
            ├── conftest.py     # fixtures: SQLite engine, AsyncClient, seeded users
            └── test_*.py
```

---

## Stack

| | |
|---|---|
| **FastAPI** | async routing, dependency injection, auto OpenAPI |
| **SQLAlchemy 2.x async** | non-blocking ORM with asyncpg |
| **Alembic** | schema migrations, async-compatible |
| **python-jose** | JWT signing/verification |
| **passlib + bcrypt** | password hashing |
| **pydantic-settings** | typed config loaded from `.env` |
| **pytest + httpx** | async test client, in-memory SQLite for test isolation |

---

## License

MIT
