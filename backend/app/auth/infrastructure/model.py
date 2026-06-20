"""
Modelos del dominio de autenticación y acceso.
Tablas DDL relevantes: Roles, Users, User_Phones, Document_Types, User_Documents

"""

from sqlalchemy import TIMESTAMP, Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Role(Base):
    __tablename__ = "Roles"

    role_id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)

    users = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "Users"

    user_id = Column(Integer, primary_key=True)
    username = Column(String(100), nullable=False, unique=True)
    password = Column(String(255), nullable=False)
    email = Column(String(150), nullable=False, unique=True)
    active = Column(Boolean, default=True)
    create_date = Column(TIMESTAMP, server_default=func.current_timestamp())
    role_id = Column(Integer, ForeignKey("Roles.role_id"), nullable=False)

    role = relationship("Role", back_populates="users")
    phones = relationship(
        "UserPhone", back_populates="user", cascade="all, delete-orphan"
    )
    documents = relationship(
        "UserDocument", back_populates="user", cascade="all, delete-orphan"
    )


class UserPhone(Base):
    __tablename__ = "User_Phones"

    phone_id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False
    )
    phone_number = Column(String(20), nullable=False)
    phone_type = Column(String(20))
    is_primary = Column(Boolean, default=False)

    user = relationship("User", back_populates="phones")


class DocumentType(Base):
    __tablename__ = "Document_Types"

    doc_type_id = Column(Integer, primary_key=True)
    name = Column(String(50), nullable=False, unique=True)

    user_documents = relationship("UserDocument", back_populates="doc_type")


class UserDocument(Base):
    __tablename__ = "User_Documents"

    user_doc_id = Column(Integer, primary_key=True)
    user_id = Column(
        Integer, ForeignKey("Users.user_id", ondelete="CASCADE"), nullable=False
    )
    doc_type_id = Column(
        Integer, ForeignKey("Document_Types.doc_type_id"), nullable=False
    )
    document_number = Column(String(50), nullable=False)

    user = relationship("User", back_populates="documents")
    doc_type = relationship("DocumentType", back_populates="user_documents")
