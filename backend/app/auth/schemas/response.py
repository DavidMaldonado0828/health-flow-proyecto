from datetime import datetime
from typing import List

from pydantic import BaseModel


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class PhoneResponse(BaseModel):
    phone_number: str
    phone_type: str
    is_primary: bool


class DocumentResponse(BaseModel):
    document_number: str
    doc_type_id: int


class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    active: bool
    role_id: int
    create_date: datetime
    phones: List[PhoneResponse] = []
    documents: List[DocumentResponse] = []

    class Config:
        from_attributes = True
