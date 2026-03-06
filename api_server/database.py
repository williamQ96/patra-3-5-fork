import os
from contextlib import asynccontextmanager

import asyncpg

_pool: asyncpg.Pool | None = None


async def init_pool() -> asyncpg.Pool:
    """Create connection pool. Called during app lifespan startup."""
    global _pool
    url = os.getenv("DATABASE_URL")
    if not url:
        raise ValueError("DATABASE_URL environment variable is required")
    _pool = await asyncpg.create_pool(url, min_size=1, max_size=10, command_timeout=60)
    return _pool


async def close_pool() -> None:
    """Close connection pool. Called during app lifespan shutdown."""
    global _pool
    if _pool:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool:
    """FastAPI dependency: returns the connection pool."""
    if _pool is None:
        raise RuntimeError("Database pool not initialized")
    return _pool
