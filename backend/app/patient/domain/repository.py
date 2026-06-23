from abc import ABC, abstractmethod
from typing import List, Optional

from app.patient.domain.entity import PatientEntity


class PatientRepositoryInterface(ABC):

    @abstractmethod
    def get_by_id(self, patient_id: int) -> Optional[PatientEntity]:
        pass

    @abstractmethod
    def get_by_user_id(self, user_id: int) -> Optional[PatientEntity]:
        pass

    @abstractmethod
    def get_all(self) -> List[PatientEntity]:
        pass

    @abstractmethod
    def create(self, patient: PatientEntity) -> PatientEntity:
        pass

    @abstractmethod
    def update(self, patient: PatientEntity) -> PatientEntity:
        pass

    @abstractmethod
    def delete(self, patient_id: int) -> bool:
        pass
