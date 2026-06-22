from abc import ABC, abstractmethod
from typing import Optional

from .entity import UserEntity


class UserRepository(ABC):
    @abstractmethod
    def get_users(self, username: str) -> list[UserEntity]:
        pass

    @abstractmethod
    def is_admin(self, user_id: int) -> bool:
        pass

    @abstractmethod
    def get_by_username(self, username: str) -> Optional[UserEntity]:
        pass

    @abstractmethod
    def get_by_id(self, user_id: int) -> Optional[UserEntity]:
        pass

    @abstractmethod
    def create(self, user: UserEntity) -> UserEntity:
        pass

    @abstractmethod
    def role_exists(self, role_id: int) -> bool:
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[UserEntity]:
        pass

    @abstractmethod
    def document_exists(self, document_number: str) -> bool:
        pass

    @abstractmethod
    def update_status(self, user_id: int, is_active: bool) -> UserEntity:
        pass

    @abstractmethod
    def update_password(self, user_id: int, new_hashed_password: str) -> UserEntity:
        pass

    @abstractmethod
    def update_username(self, user_id: int, new_username: str) -> UserEntity:
        pass
