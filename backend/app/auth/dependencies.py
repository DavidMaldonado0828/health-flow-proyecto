# backend/app/auth/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.auth.domain.entity import UserEntity
from app.auth.infrastructure.repository_impl import UserRepositoryImpl
from app.core.security import decode_token
from app.database import get_db

# Configuración del esquema OAuth2
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
) -> UserEntity:
    """
    Dependencia global para proteger rutas.
    Decodifica el JWT y retorna la entidad de usuario.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # 1. Usamos la herramienta de seguridad centralizada
        payload = decode_token(token)

        # 2. Extraemos el 'sub' (que definimos en el login como user_id)
        user_id = payload.get("sub")
        if user_id is None:
            raise credentials_exception

    except Exception:
        raise credentials_exception

    # 3. Consultamos el repositorio para obtener la entidad completa
    repo = UserRepositoryImpl(db)
    user = repo.get_by_id(int(user_id))

    if user is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return user


def get_admin_user(current_user: UserEntity = Depends(get_current_user)) -> UserEntity:
    """
    Dependencia adicional para restringir rutas solo a Administradores.
    """

    if not current_user.role_id == 1:  
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos de administrador",
        )
    return current_user
