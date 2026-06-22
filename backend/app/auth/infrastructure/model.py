from sqlalchemy import TIMESTAMP, Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Role(Base):
    __tablename__ = "roles"

    role_id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "users"

    user_id = Column(Integer, primary_key=True)
    username = Column(String(100), nullable=False, unique=True)
    password = Column(String(255), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    active = Column(Boolean, default=True)
    create_date = Column(TIMESTAMP, server_default=func.current_timestamp())

    # Referencia correcta al nombre de la tabla (roles) y columna (role_id)
    role_id = Column(Integer, ForeignKey("roles.role_id"), nullable=False)

    role = relationship("Role", back_populates="users")
    phones = relationship(
        "UserPhone", back_populates="user", cascade="all, delete-orphan"
    )
    documents = relationship(
        "UserDocument", back_populates="user", cascade="all, delete-orphan"
    )


class UserPhone(Base):
    __tablename__ = "user_phones"

    phone_id = Column(Integer, primary_key=True)
    # Referencia correcta al nombre de la tabla (users)
    user_id = Column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    phone_number = Column(String(20), nullable=False)
    phone_type = Column(String(20))
    is_primary = Column(Boolean, default=False)

    user = relationship("User", back_populates="phones")


class DocumentType(Base):
    __tablename__ = "document_types"

    doc_type_id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)

    user_documents = relationship("UserDocument", back_populates="doc_type")


class UserDocument(Base):
    __tablename__ = "user_documents"

    user_doc_id = Column(Integer, primary_key=True)
    # Referencia correcta al nombre de la tabla (users)
    user_id = Column(
        Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False
    )
    # Referencia correcta al nombre de la tabla (document_types)
    doc_type_id = Column(
        Integer, ForeignKey("document_types.doc_type_id"), nullable=False
    )
    document_number = Column(String(50), unique=True, nullable=False)

    user = relationship("User", back_populates="documents")
    doc_type = relationship("DocumentType", back_populates="user_documents")
