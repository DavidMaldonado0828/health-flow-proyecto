from typing import Optional

from sqlalchemy.orm import Session

from app.auth.domain.entity import DocumentEntity, PhoneEntity, UserEntity
from app.auth.domain.repository import UserRepository
from app.auth.infrastructure.model import Role, User, UserDocument, UserPhone


def _to_entity(model: User) -> UserEntity:
    return UserEntity(
        user_id=model.user_id,
        username=model.username,
        email=model.email,
        password=model.password,
        active=model.active,
        role_id=model.role_id,
        create_date=model.create_date,
        phones=[
            PhoneEntity(p.phone_number, p.phone_type, p.is_primary)
            for p in model.phones
        ],
        documents=[
            DocumentEntity(d.document_number, d.doc_type_id) for d in model.documents
        ],
    )


class UserRepositoryImpl(UserRepository):
    def __init__(self, db: Session):
        self.db = db

    def get_users(self) -> list[UserEntity]:
        models = self.db.query(User).all()
        return [_to_entity(u) for u in models]

    def is_admin(self, user_id: int) -> bool:
        user = (
            self.db.query(User)
            .join(Role)
            .filter(User.user_id == user_id, Role.name == "Admin")
            .first()
        )
        return user is not None

    def get_by_username(self, username: str) -> Optional[UserEntity]:
        model = self.db.query(User).filter(User.username == username).first()
        return _to_entity(model) if model else None

    def get_by_id(self, user_id: int) -> Optional[UserEntity]:
        model = self.db.query(User).filter(User.user_id == user_id).first()
        return _to_entity(model) if model else None

    def role_exists(self, role_id: int) -> bool:
        return self.db.query(Role).filter(Role.role_id == role_id).first() is not None

    def create(self, user: UserEntity) -> UserEntity:
        model = User(
            username=user.username,
            email=user.email,
            password=user.password,
            active=user.active,
            role_id=user.role_id,
        )
        # Guardar relaciones
        for p in user.phones:
            model.phones.append(
                UserPhone(
                    phone_number=p.phone_number,
                    phone_type=p.phone_type,
                    is_primary=p.is_primary,
                )
            )
        for d in user.documents:
            model.documents.append(
                UserDocument(
                    document_number=d.document_number, doc_type_id=d.doc_type_id
                )
            )

        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        return _to_entity(model)

    def get_by_email(self, email: str):
        return self.db.query(User).filter(User.email == email).first()

    def document_exists(self, document_number: str, doc_type_id: int) -> bool:
        return (
            self.db.query(UserDocument)
            .filter(
                UserDocument.document_number == document_number,
                UserDocument.doc_type_id == doc_type_id,
            )
            .first()
            is not None
        )

    def update_status(self, user_id: int, is_active: bool) -> UserEntity:
        user_model = self.db.query(User).filter(User.user_id == user_id).first()
        if user_model:
            user_model.active = is_active
            self.db.commit()
            self.db.refresh(user_model)
            return _to_entity(user_model)
        raise Exception("Usuario no encontrado")

    def update_password(self, user_id: int, new_hashed_password: str):
        user_model = self.db.query(User).filter(User.user_id == user_id).first()
        if user_model:
            user_model.password = new_hashed_password
            self.db.commit()
            return _to_entity(user_model)
        raise Exception("Usuario no encontrado")

    def update_username(self, user_id: int, new_username: str) -> UserEntity:
        model = self.db.query(User).filter(User.user_id == user_id).first()
        if not model:
            raise Exception("Usuario no encontrado")
        model.username = new_username
        self.db.commit()
        self.db.refresh(model)
        return _to_entity(model)
