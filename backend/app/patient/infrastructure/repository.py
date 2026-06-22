"""
auth/infrastructure/repository.py
===================================
Capa de acceso a datos para Patient.
Contiene únicamente consultas SQLAlchemy, sin lógica de negocio.
"""

from __future__ import annotations

from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.domain.models import Patient
from app.auth.schemas.schemas import PatientCreate, PatientUpdate


class PatientRepository:
    """Encapsula todas las consultas CRUD sobre el modelo Patient."""

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def get_by_id(self, patient_id: int) -> Optional[Patient]:
        return await self._session.get(Patient, patient_id)

    async def get_by_user_id(self, user_id: int) -> Optional[Patient]:
        stmt = select(Patient).where(Patient.user_id == user_id)
        result = await self._session.execute(stmt)
        return result.scalar_one_or_none()

    async def list(self, skip: int = 0, limit: int = 50) -> Sequence[Patient]:
        stmt = (
            select(Patient)
            .order_by(Patient.last_name, Patient.first_name)
            .offset(skip)
            .limit(limit)
        )
        result = await self._session.execute(stmt)
        return result.scalars().all()

    async def create(self, data: PatientCreate) -> Patient:
        patient = Patient(**data.model_dump())
        self._session.add(patient)
        await self._session.flush()
        await self._session.refresh(patient)
        return patient

    async def update(self, patient: Patient, data: PatientUpdate) -> Patient:
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(patient, field, value)
        await self._session.flush()
        await self._session.refresh(patient)
        return patient

    async def delete(self, patient: Patient) -> None:
        await self._session.delete(patient)
        await self._session.flush()
