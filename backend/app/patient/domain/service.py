from datetime import datetime
from typing import List

from fastapi import HTTPException, status

from app.auth.domain.entity import UserEntity
from app.patient.domain.entity import PatientEntity
from app.patient.infrastructure.repository_impl import PatientRepository


class PatientService:
    def __init__(self, repository: PatientRepository):
        self.repository = repository

    def get_patient_by_id(self, patient_id: int, current_user: UserEntity) -> PatientEntity:
        patient = self.repository.get_by_id(patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paciente no encontrado",
            )
        # Solo el propio paciente o un admin puede ver el perfil
        if patient.user_id != current_user.user_id and current_user.role_id != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para ver este paciente",
            )
        return patient

    def get_my_patient_profile(self, current_user: UserEntity) -> PatientEntity:
        patient = self.repository.get_by_user_id(current_user.user_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No tienes un perfil de paciente registrado",
            )
        return patient

    def get_all_patients(self, current_user: UserEntity) -> List[PatientEntity]:
        # Solo admins y doctores (role_id 1 o 2) pueden listar todos
        if current_user.role_id not in (1, 2):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Acceso denegado",
            )
        return self.repository.get_all()

    def create_patient(
        self,
        first_name: str,
        last_name: str,
        date_of_birth,
        user_id: int,
        gender: str = None,
        guardian_id: int = None,
    ) -> PatientEntity:
        # Validar que el user_id no tenga ya un paciente asociado
        existing = self.repository.get_by_user_id(user_id)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Este usuario ya tiene un perfil de paciente",
            )

        new_patient = PatientEntity(
            patient_id=0,
            first_name=first_name,
            last_name=last_name,
            date_of_birth=date_of_birth,
            user_id=user_id,
            gender=gender,
            created_at=datetime.utcnow(),
            guardian_id=guardian_id,
        )

        try:
            return self.repository.create(new_patient)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno al crear el paciente",
            )

    def update_patient(
        self,
        patient_id: int,
        current_user: UserEntity,
        first_name: str = None,
        last_name: str = None,
        date_of_birth=None,
        gender: str = None,
        guardian_id: int = None,
    ) -> PatientEntity:
        patient = self.repository.get_by_id(patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paciente no encontrado",
            )

        # Solo el propio paciente o admin puede editar
        if patient.user_id != current_user.user_id and current_user.role_id != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para editar este paciente",
            )

        # Actualizar solo los campos enviados
        if first_name is not None:
            patient.first_name = first_name
        if last_name is not None:
            patient.last_name = last_name
        if date_of_birth is not None:
            patient.date_of_birth = date_of_birth
        if gender is not None:
            patient.gender = gender
        if guardian_id is not None:
            patient.guardian_id = guardian_id

        try:
            return self.repository.update(patient)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error interno al actualizar el paciente",
            )

    def delete_patient(self, patient_id: int, current_user: UserEntity) -> dict:
        # Solo admin puede eliminar
        if current_user.role_id != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para eliminar pacientes",
            )

        patient = self.repository.get_by_id(patient_id)
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Paciente no encontrado",
            )

        self.repository.delete(patient_id)
        return {"detail": "Paciente eliminado correctamente"}
