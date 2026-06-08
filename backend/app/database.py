# Es el "Motor de Persistencia" de la aplicación.
# Es el puente entre tu código Python y la base de datos PostgreSQL.

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from app.config import settings

# engine se conecta usando la configuración que viene de settings
engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()