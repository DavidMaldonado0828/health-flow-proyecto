"""
auth/domain/enums.py
=====================
Vocabulario controlado del dominio Patient.
Espeja el DOMAIN `gender_type` definido en PostgreSQL.
"""

from enum import Enum


class GenderType(str, Enum):
    """Valores permitidos para Patient.gender."""

    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"
    UNSPECIFIED = "UNSPECIFIED"
