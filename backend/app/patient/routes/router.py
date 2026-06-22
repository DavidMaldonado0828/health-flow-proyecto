"""
auth/routes/router.py
======================
Endpoints REST para el dominio Patient.

La lógica de orquestación que antes vivía en service.py se incorpora
directamente aquí, dado que la estructura del proyecto no tiene una
carpeta services/. Las excepciones HTTP se delegan a core/exceptions.py
y la sesión de BD llega por inyección desde core/dependencies.py.

Registrar en main.py:
    from app.auth.routes.router import router as patient_router
    app.include_router(patient_router)
"""

from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db_session
from app.core.exceptions import raise_conflict, raise_not_found
from app.auth.infrastructure.repository import PatientRepository
from app.auth.schemas.schemas import PatientCreate, PatientRead, PatientUpdate

router = APIRouter(prefix="/patients", tags=["Patients"])


# ---- Helpers de orquestación (sustituyen al antiguo service.py) ------

async def _get_or_404(repo: PatientRepository, patient_id: int):
    """Devuelve el paciente o lanza 404 si no existe."""
    patient = await repo.get_by_id(patient_id)
    if patient is None:
        raise_not_found("Patient", patient_id)
    return patient


# ======================================================================
# ENDPOINTS
# ======================================================================

@router.post(
    "",
    response_model=PatientRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un nuevo paciente",
)
async def create_patient(
    payload: PatientCreate,
    session: AsyncSession = Depends(get_db_session),
) -> PatientRead:
    repo = PatientRepository(session)
    existing = await repo.get_by_user_id(payload.user_id)
    if existing is not None:
        raise_conflict(
            f"El usuario {payload.user_id} ya está vinculado al "
            f"paciente {existing.patient_id}."
        )
    patient = await repo.create(payload)
    await session.commit()
    return PatientRead.model_validate(patient)


@router.get(
    "",
    response_model=List[PatientRead],
    summary="Listar pacientes (paginado)",
)
async def list_patients(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=200),
    session: AsyncSession = Depends(get_db_session),
) -> List[PatientRead]:
    repo = PatientRepository(session)
    patients = await repo.list(skip=skip, limit=limit)
    return [PatientRead.model_validate(p) for p in patients]


@router.get(
    "/{patient_id}",
    response_model=PatientRead,
    summary="Obtener un paciente por ID",
)
async def get_patient(
    patient_id: int,
    session: AsyncSession = Depends(get_db_session),
) -> PatientRead:
    repo = PatientRepository(session)
    patient = await _get_or_404(repo, patient_id)
    return PatientRead.model_validate(patient)


@router.patch(
    "/{patient_id}",
    response_model=PatientRead,
    summary="Actualizar parcialmente un paciente",
)
async def update_patient(
    patient_id: int,
    payload: PatientUpdate,
    session: AsyncSession = Depends(get_db_session),
) -> PatientRead:
    repo = PatientRepository(session)
    patient = await _get_or_404(repo, patient_id)
    patient = await repo.update(patient, payload)
    await session.commit()
    return PatientRead.model_validate(patient)


@router.delete(
    "/{patient_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Eliminar un paciente",
)
async def delete_patient(
    patient_id: int,
    session: AsyncSession = Depends(get_db_session),
) -> None:
    repo = PatientRepository(session)
    patient = await _get_or_404(repo, patient_id)
    await repo.delete(patient)
    await session.commit()
