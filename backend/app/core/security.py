# backend/app/core/security.py
from datetime import datetime, timedelta
from typing import Any, Dict

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.config import settings

# 1. Configuración de Bcrypt para contraseñas
# Usamos 'deprecated="auto"' para que passlib elija el mejor algoritmo automáticamente
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Convierte una contraseña plana en un hash seguro."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña plana coincide con el hash almacenado."""
    return pwd_context.verify(plain_password, hashed_password)


# 2. Manejo de Tokens JWT
def create_access_token(data: Dict[str, Any]) -> str:
    """Crea un token JWT con tiempo de expiración."""
    to_encode = data.copy()

    # Definimos la expiración basándonos en tu archivo de configuración
    expire = datetime.utcnow() + timedelta(minutes=settings.jwt_expiration_minutes)
    to_encode.update({"exp": expire})

    # Firmamos el token con la clave secreta y el algoritmo definido en config
    encoded_jwt = jwt.encode(
        to_encode, settings.jwt_secret, algorithm=settings.jwt_algorithm
    )
    return encoded_jwt


def decode_token(token: str) -> Dict[str, Any]:
    """Decodifica el token y retorna el payload si es válido."""
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError:
        # Si el token es inválido, expirado o la firma no coincide, lanzará error
        raise ValueError("Token inválido o expirado")
