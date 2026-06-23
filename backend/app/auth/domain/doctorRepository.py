from abc import ABC, abstractmethod
from typing import Optional, List
from app.domain.entity import DoctorEntity  # o usar modelos directamente

class IDoctorRepository(ABC):
    @abstractmethod
    def get_by_id(self, doctor_id: int) -> Optional[DoctorEntity]:
        pass

    @abstractmethod
    def get_by_user_id(self, user_id: int) -> Optional[DoctorEntity]:
        pass

    @abstractmethod
    def get_by_license(self, license_number: str) -> Optional[DoctorEntity]:
        pass

    @abstractmethod
    def add(self, doctor: DoctorEntity) -> DoctorEntity:
        pass

    @abstractmethod
    def update(self, doctor: DoctorEntity) -> DoctorEntity:
        pass

    @abstractmethod
    def delete(self, doctor_id: int) -> None:
        pass

    # Métodos para validaciones
    @abstractmethod
    def exists_license(self, license_number: str, exclude_id: Optional[int] = None) -> bool:
        pass

    @abstractmethod
    def has_pending_appointments(self, doctor_id: int) -> bool:
        pass