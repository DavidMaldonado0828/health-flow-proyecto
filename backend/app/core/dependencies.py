"""
core/dependencies.py
=====================
Dependencias inyectables compartidas en todo el proyecto.

Aquí vive la sesión de base de datos y cualquier dependencia que varios
routers necesiten. Los routers simplemente importan `get_db_session` y
FastAPI se encarga de crear/cerrar la sesión por request.

Uso desde cualquier router:
    from app.core.dependencies import get_db_session
    session: AsyncSession = Depends(get_db_session)
"""
from app.database import SessionLocal


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings  # tu archivo de configuración (.env)

# ---- Motor y fábrica de sesiones ------------------------------------
engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)


# ---- Base declarativa compartida por todos los modelos ORM ----------
class Base(DeclarativeBase):
    pass


# ---- Dependencia de sesión ------------------------------------------
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """Proporciona una AsyncSession por request y la cierra al terminar.

    Uso en cualquier router:
        @router.get("/")
        async def endpoint(session: AsyncSession = Depends(get_db_session)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
