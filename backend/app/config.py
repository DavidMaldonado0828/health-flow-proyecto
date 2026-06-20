from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Base de datos - obligatorio, sin valor por defecto
    database_url: str

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