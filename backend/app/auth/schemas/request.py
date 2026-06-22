from pydantic import BaseModel, EmailStr


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    role_id: int
    phone_number: str | None = None
    document_number: str | None = None
    doc_type_id: int | None = None


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str


class ChangeUsernameRequest(BaseModel):
    new_username: str
