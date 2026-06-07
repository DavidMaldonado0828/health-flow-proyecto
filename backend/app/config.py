from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://usuario:password@localhost/nombre_db"

    class Config:
        env_file = ".env"

settings = Settings()