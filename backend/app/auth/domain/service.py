from datetime import datetime

from fastapi import HTTPException, status

from app.auth.domain.entity import DocumentEntity, PhoneEntity, UserEntity
from app.auth.infrastructure.repository_impl import UserRepository
from app.core.security import create_access_token, hash_password, verify_password


class AuthService:
    def __init__(self, repository: UserRepository):
        self.repository = repository

    def login(self, username: str, password: str) -> str:
        user = self.repository.get_by_username(username)
        if not user or not user.active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas o usuario inactivo",
            )

        # Usamos la herramienta centralizada
        if not verify_password(password, user.password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales incorrectas",
            )

        # Generamos el token usando la herramienta centralizada
        return create_access_token(
            data={"sub": str(user.user_id), "role_id": user.role_id}
        )

    def register(
        self,
        username: str,
        email: str,
        password: str,
        role_id: int,
        phone_number: str = None,
        document_number: str = None,
        doc_type_id: int = None,
    ) -> UserEntity:

        # 1. Validaciones de negocio
        if self.repository.get_by_username(username):
            raise HTTPException(
                status_code=400, detail=f"El usuario '{username}' ya existe."
            )

        if self.repository.get_by_email(email):
            raise HTTPException(
                status_code=400, detail=f"El correo '{email}' ya está registrado."
            )

        if document_number and self.repository.document_exists(
            document_number, doc_type_id
        ):
            raise HTTPException(
                status_code=400, detail="Documento ya registrado para este tipo."
            )

        # 2. Preparar entidades
        phones = [PhoneEntity(phone_number, "Mobile", True)] if phone_number else []
        documents = (
            [DocumentEntity(document_number, doc_type_id)] if document_number else []
        )

        # 3. Hasheo usando la herramienta centralizada
        new_user = UserEntity(
            user_id=0,
            username=username,
            email=email,
            password=hash_password(password),
            active=True,
            role_id=role_id,
            create_date=datetime.utcnow(),
            phones=phones,
            documents=documents,
        )

        try:
            return self.repository.create(new_user)
        except Exception:
            raise HTTPException(status_code=500, detail="Error interno al registrar.")

    def get_all_users(self, current_user: UserEntity) -> list[UserEntity]:
        if not self.repository.is_admin(current_user.user_id):
            raise HTTPException(status_code=403, detail="Acceso denegado")
        return self.repository.get_users()

    def get_user_by_id(self, user_id: int) -> UserEntity:
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        return user

    def update_user_status(
        self, user_id: int, is_active: bool, current_user: UserEntity
    ) -> UserEntity:
        # 1. Seguridad: Verificar si quien hace la petición es admin
        if not self.repository.is_admin(current_user.user_id):
            raise HTTPException(
                status_code=403, detail="No tienes permisos para realizar esta acción"
            )

        # 2. Buscar si el usuario existe
        user = self.repository.get_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        # 3. Actualizar estado
        return self.repository.update_status(user_id, is_active)

    def change_password(
        self,
        user_id: int,
        old_password: str,
        new_password: str,
        current_user: UserEntity,
    ):
        # 1. Obtener usuario (el repo)
        user = self.repository.get_by_id(user_id)

        # 2. Verificar la contraseña vieja usando la función del core
        if not verify_password(old_password, user.password):
            raise HTTPException(
                status_code=400, detail="La contraseña actual es incorrecta"
            )

        # 3. Hashear la nueva y actualizar
        new_hashed = hash_password(new_password)
        return self.repository.update_password(user_id, new_hashed)

    def change_username(
        self, user_id: int, new_username: str, current_user: UserEntity
    ):
        if current_user.user_id != user_id and not self.repository.is_admin(
            current_user.user_id
        ):
            raise HTTPException(
                status_code=403, detail="No puedes cambiar el nombre de otro usuario"
            )

        return self.repository.update_username(user_id, new_username)
