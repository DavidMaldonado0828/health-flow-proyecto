"""
auth/domain/models.py
======================
Modelo ORM SQLAlchemy 2.0 para la tabla PATIENTS.

Las restricciones CHECK replican las mismas reglas del DOMAIN PostgreSQL
(patients_domain.sql) como segunda línea de defensa, por si alguna
escritura llega a la BD sin pasar por los schemas Pydantic.
"""

from datetime import date, datetime

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.dependencies import Base  # Base declarativa compartida
from app.auth.domain.enums import GenderType


class Patient(Base):
    """Mapeo ORM de la tabla PATIENTS."""

    __tablename__ = "patients"

    patient_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.user_id", onupdate="CASCADE", ondelete="RESTRICT"),
        nullable=False,
        unique=True,
    )

    guardian_id: Mapped[int | None] = mapped_column(
        ForeignKey("guardians.guardian_id", onupdate="CASCADE", ondelete="SET NULL"),
        nullable=True,
    )

    first_name: Mapped[str] = mapped_column(String(80), nullable=False)
    last_name: Mapped[str] = mapped_column(String(80), nullable=False)

    gender: Mapped[GenderType] = mapped_column(
        String(20), nullable=False, default=GenderType.UNSPECIFIED
    )

    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)

    created_at: Mapped[datetime] = mapped_column(
        DateTime, nullable=False, server_default=func.now()
    )

    # ---- Relaciones ----------------------------------------------------
    user = relationship("User", back_populates="patient", uselist=False)
    guardian = relationship("Guardian", back_populates="patients")
    appointments = relationship("MedicalAppointment", back_populates="patient")

    # ---- Restricciones a nivel de tabla --------------------------------
    __table_args__ = (
        CheckConstraint(
            "LENGTH(BTRIM(first_name)) >= 2",
            name="ck_patients_first_name_len",
        ),
        CheckConstraint(
            "LENGTH(BTRIM(last_name)) >= 2",
            name="ck_patients_last_name_len",
        ),
        CheckConstraint(
            "gender IN ('MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED')",
            name="ck_patients_gender_valid",
        ),
        CheckConstraint(
            "date_of_birth <= CURRENT_DATE",
            name="ck_patients_date_of_birth_not_future",
        ),
        CheckConstraint(
            "date_of_birth >= CURRENT_DATE - INTERVAL '130 years'",
            name="ck_patients_date_of_birth_plausible",
        ),
        Index("idx_patients_last_first_name", "last_name", "first_name"),
        Index("idx_patients_guardian_id", "guardian_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<Patient id={self.patient_id} "
            f"name={self.first_name!r} {self.last_name!r}>"
        )
