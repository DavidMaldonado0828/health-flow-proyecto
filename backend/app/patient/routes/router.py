from typing import List

from fastapi import APIRouter, Depends

from app.auth.domain.entity import UserEntity
from app.auth.dependencies import get_current_user
from app.patient.domain.service import PatientService
from app.patient.infrastructure.repository_impl import PatientRepository
from app.patient.schemas.request import CreatePatientRequest, UpdatePatientRequest
from app.patient.schemas.response import PatientListResponse, PatientResponse
from app.core.database import get_supabase_client

router = APIRouter(prefix="/patients", tags=["Patients"])


def get_patient_service() -> PatientService:
    client = get_supabase_client()
    repository = PatientRepository(client)
    return PatientService(repository)


@router.get("/me", response_model=PatientResponse)
def get_my_profile(
    current_user: UserEntity = Depends(get_current_user),
    service: PatientService = Depends(get_patient_service),
):
    """Retorna el perfil de paciente del usuario autenticado."""
    return service.get_my_patient_profile(current_user)


@router.get("/", response_model=PatientListResponse)
def get_all_patients(
    current_user: UserEntity = Depends(get_current_user),
    service: PatientService = Depends(get_patient_service),
):
    """Lista todos los pacientes. Solo para admins y doctores."""
    patients = service.get_all_patients(current_user)
    return PatientListResponse(patients=patients, total=len(patients))


@router.get("/{patient_id}", response_model=PatientResponse)
def get_patient(
    patient_id: int,
    current_user: UserEntity = Depends(get_current_user),
    service: PatientService = Depends(get_patient_service),
):
    """Retorna un paciente por su ID."""
    return service.get_patient_by_id(patient_id, current_user)


@router.post("/", response_model=PatientResponse, status_code=201)
def create_patient(
    body: CreatePatientRequest,
    current_user: UserEntity = Depends(get_current_user),
    service: PatientService = Depends(get_patient_service),
):
    """Crea un nuevo perfil de paciente."""
    return service.create_patient(
        first_name=body.first_name,
        last_name=body.last_name,
        date_of_birth=body.date_of_birth,
        user_id=body.user_id,
        gender=body.gender,
        guardian_id=body.guardian_id,
    )


@router.patch("/{patient_id}", response_model=PatientResponse)
def update_patient(
    patient_id: int,
    body: UpdatePatientRequest,
    current_user: UserEntity = Depends(get_current_user),
    service: PatientService = Depends(get_patient_service),
):
    """Actualiza parcialmente un paciente."""
    return service.update_patient(
        patient_id=patient_id,
        current_user=current_user,
        first_name=body.first_name,
        last_name=body.last_name,
        date_of_birth=body.date_of_birth,
        gender=body.gender,
        guardian_id=body.guardian_id,
    )


@router.delete("/{patient_id}")
def delete_patient(
    patient_id: int,
    current_user: UserEntity = Depends(get_current_user),
    service: PatientService = Depends(get_patient_service),
):
    """Elimina un paciente. Solo para admins."""
    return service.delete_patient(patient_id, current_user)
