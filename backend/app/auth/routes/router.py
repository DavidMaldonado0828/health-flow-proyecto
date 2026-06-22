from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.domain.entity import UserEntity
from app.auth.domain.service import AuthService
from app.auth.infrastructure.repository_impl import UserRepositoryImpl
from app.auth.schemas.request import (
    ChangePasswordRequest,
    ChangeUsernameRequest,
    RegisterRequest,
)
from app.auth.schemas.response import TokenResponse, UserResponse
from app.database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])


def get_auth_service(db: Session = Depends(get_db)) -> AuthService:
    repo = UserRepositoryImpl(db)
    return AuthService(repo)


@router.get("/users", response_model=list[UserResponse])
def get_users(
    current_user: UserEntity = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    return service.get_all_users(current_user)


@router.get("/users/{user_id}", response_model=UserResponse)
def get_user(user_id: int, service: AuthService = Depends(get_auth_service)):
    return service.get_user_by_id(user_id)


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    service: AuthService = Depends(get_auth_service),
):
    token = service.login(form_data.username, form_data.password)
    return TokenResponse(access_token=token)


@router.post("/register", response_model=UserResponse)
def register(body: RegisterRequest, service: AuthService = Depends(get_auth_service)):
    return service.register(
        username=body.username,
        email=body.email,
        password=body.password,
        role_id=body.role_id,
        phone_number=body.phone_number,
        document_number=body.document_number,
        doc_type_id=body.doc_type_id,
    )


@router.patch("/users/{user_id}/status")
def change_status(
    user_id: int,
    is_active: bool,
    current_user: UserEntity = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    return service.update_user_status(user_id, is_active, current_user)


@router.patch("/users/{user_id}/password")
def change_password(
    user_id: int,
    body: ChangePasswordRequest,
    current_user: UserEntity = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    return service.change_password(
        user_id, body.old_password, body.new_password, current_user
    )


@router.patch("/users/{user_id}/username")
def change_username(
    user_id: int,
    body: ChangeUsernameRequest,
    current_user: UserEntity = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
):
    return service.change_username(user_id, body.new_username, current_user)
