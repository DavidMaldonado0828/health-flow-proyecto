"""
auth/schemas/schemas.py
========================
Schemas Pydantic v2 para el dominio Patient.

Cada schema corresponde a un caso de uso distinto:
  - PatientCreate  → POST /patients
  - PatientUpdate  → PATCH /patients/{id}
  - PatientRead    → respuesta completa (GET)
  - PatientSummary → proyección mínima para anidar en otros recursos
                     (ej. dentro de MedicalAppointmentRead)
"""

from __future__ import annotations

import re
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator

from app.auth.domain.enums import GenderType

# ---- Constantes del dominio (espejo de los CHECK del DOMAIN SQL) ----
NAME_MIN_LEN = 2
NAME_MAX_LEN = 80
MAX_AGE_YEARS = 130


def _validate_person_name(value: str, field_label: str) -> str:
    """Valida nombre/apellido: longitud y caracteres permitidos."""
    cleaned = value.strip()
    if not (NAME_MIN_LEN <= len(cleaned) <= NAME_MAX_LEN):
        raise ValueError(
            f"{field_label} debe tener entre {NAME_MIN_LEN} y {NAME_MAX_LEN} "
            f"caracteres (recibido: {len(cleaned)})."
        )
    if not re.fullmatch(r"[A-Za-zÀ-ÖØ-öø-ÿ' \-]+", cleaned):
        raise ValueError(
            f"{field_label} solo puede contener letras, espacios, "
            f"apóstrofes y guiones."
        )
    return cleaned


# ======================================================================
# BASE
# ======================================================================
class PatientBase(BaseModel):
    """Campos comunes a creación y lectura."""

    first_name: str = Field(
        ...,
        min_length=NAME_MIN_LEN,
        max_length=NAME_MAX_LEN,
        description="Nombre del paciente.",
        examples=["Ana"],
    )
    last_name: str = Field(
        ...,
        min_length=NAME_MIN_LEN,
        max_length=NAME_MAX_LEN,
        description="Apellido del paciente.",
        examples=["Gómez"],
    )
    gender: GenderType = Field(
        default=GenderType.UNSPECIFIED,
        description="Género del paciente.",
    )
    date_of_birth: date = Field(
        ...,
        description=(
            "Fecha de nacimiento. Debe estar en el pasado e "
            f"implicar una edad entre 0 y {MAX_AGE_YEARS} años."
        ),
        examples=["1990-05-14"],
    )

    model_config = ConfigDict(str_strip_whitespace=True, use_enum_values=True)

    @field_validator("first_name")
    @classmethod
    def validate_first_name(cls, v: str) -> str:
        return _validate_person_name(v, "first_name")

    @field_validator("last_name")
    @classmethod
    def validate_last_name(cls, v: str) -> str:
        return _validate_person_name(v, "last_name")

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, v: date) -> date:
        today = date.today()
        if v > today:
            raise ValueError("date_of_birth no puede ser una fecha futura.")
        min_allowed = date(today.year - MAX_AGE_YEARS, today.month, today.day)
        if v < min_allowed:
            raise ValueError(
                f"date_of_birth implica una edad mayor a {MAX_AGE_YEARS} años, "
                f"lo cual no es plausible."
            )
        return v


# ======================================================================
# CREATE — payload de POST /patients
# ======================================================================
class PatientCreate(PatientBase):
    """Schema para crear un nuevo paciente."""

    user_id: int = Field(
        ...,
        gt=0,
        description="FK a USERS. Un usuario solo puede estar vinculado a un paciente.",
    )
    guardian_id: Optional[int] = Field(
        default=None,
        gt=0,
        description=(
            "FK a GUARDIANS. Omitir o dejar null para pacientes "
            "adultos responsables de sí mismos."
        ),
    )

    @model_validator(mode="after")
    def validate_guardian_consistency(self) -> "PatientCreate":
        """Regla de negocio: los menores de 18 deben tener un responsable."""
        today = date.today()
        age = (
            today.year
            - self.date_of_birth.year
            - (
                (today.month, today.day)
                < (self.date_of_birth.month, self.date_of_birth.day)
            )
        )
        if age < 18 and self.guardian_id is None:
            raise ValueError(
                "Los pacientes menores de 18 años deben tener un "
                "guardian_id (responsable) asignado."
            )
        return self


# ======================================================================
# UPDATE — payload de PATCH /patients/{id} (todos los campos opcionales)
# ======================================================================
class PatientUpdate(BaseModel):
    """Schema para actualización parcial. Solo se validan los campos enviados."""

    first_name: Optional[str] = Field(
        default=None, min_length=NAME_MIN_LEN, max_length=NAME_MAX_LEN
    )
    last_name: Optional[str] = Field(
        default=None, min_length=NAME_MIN_LEN, max_length=NAME_MAX_LEN
    )
    gender: Optional[GenderType] = None
    date_of_birth: Optional[date] = None
    guardian_id: Optional[int] = Field(default=None, gt=0)

    model_config = ConfigDict(str_strip_whitespace=True, use_enum_values=True)

    @field_validator("first_name")
    @classmethod
    def validate_first_name(cls, v: Optional[str]) -> Optional[str]:
        return _validate_person_name(v, "first_name") if v is not None else v

    @field_validator("last_name")
    @classmethod
    def validate_last_name(cls, v: Optional[str]) -> Optional[str]:
        return _validate_person_name(v, "last_name") if v is not None else v

    @field_validator("date_of_birth")
    @classmethod
    def validate_date_of_birth(cls, v: Optional[date]) -> Optional[date]:
        if v is None:
            return v
        today = date.today()
        if v > today:
            raise ValueError("date_of_birth no puede ser una fecha futura.")
        min_allowed = date(today.year - MAX_AGE_YEARS, today.month, today.day)
        if v < min_allowed:
            raise ValueError(
                f"date_of_birth implica una edad mayor a {MAX_AGE_YEARS} años."
            )
        return v


# ======================================================================
# READ — modelo de respuesta (GET /patients, GET /patients/{id})
# ======================================================================
class PatientRead(PatientBase):
    """Representación completa del paciente devuelta por la API."""

    patient_id: int
    user_id: int
    guardian_id: Optional[int] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True, use_enum_values=True)


# ======================================================================
# SUMMARY — proyección mínima para anidar dentro de otros recursos
# ======================================================================
class PatientSummary(BaseModel):
    """Vista resumida del paciente para incluir en respuestas anidadas."""

    patient_id: int
    first_name: str
    last_name: str

    model_config = ConfigDict(from_attributes=True)
