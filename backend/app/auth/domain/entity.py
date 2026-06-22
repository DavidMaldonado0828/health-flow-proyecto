from dataclasses import dataclass, field
from datetime import datetime
from typing import List


@dataclass
class PhoneEntity:
    phone_number: str
    phone_type: str
    is_primary: bool


@dataclass
class DocumentEntity:
    document_number: str
    doc_type_id: int


@dataclass
class UserEntity:
    user_id: int
    username: str
    email: str
    password: str
    active: bool
    role_id: int
    create_date: datetime
    phones: List[PhoneEntity] = field(default_factory=list)
    documents: List[DocumentEntity] = field(default_factory=list)


@dataclass
class RoleEntity:
    role_id: int
    name: str
