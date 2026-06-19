from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Base de datos
    DATABASE_URL: str = (
        "postgresql://healthflow_admin:tu_password@localhost:5432/healthflow_db"
    )

    # JWT - Seguridad
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_expiration_minutes: int = 30

    # Entorno
    app_env: str = "development"
    app_port: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()
