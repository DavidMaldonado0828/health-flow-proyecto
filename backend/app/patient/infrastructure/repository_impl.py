from typing import List, Optional

from supabase import Client

from app.patient.domain.entity import PatientEntity
from app.patient.domain.repository import PatientRepositoryInterface


class PatientRepository(PatientRepositoryInterface):
    def __init__(self, db: Client):
        self.db = db
        self.table = "patients"

    def _to_entity(self, data: dict) -> PatientEntity:
        return PatientEntity(
            patient_id=data["patient_id"],
            first_name=data["first_name"],
            last_name=data["last_name"],
            date_of_birth=data["date_of_birth"],
            user_id=data["user_id"],
            gender=data.get("gender"),
            created_at=data.get("created_at"),
            guardian_id=data.get("guardian_id"),
        )

    def get_by_id(self, patient_id: int) -> Optional[PatientEntity]:
        response = (
            self.db.table(self.table)
            .select("*")
            .eq("patient_id", patient_id)
            .single()
            .execute()
        )
        if not response.data:
            return None
        return self._to_entity(response.data)

    def get_by_user_id(self, user_id: int) -> Optional[PatientEntity]:
        response = (
            self.db.table(self.table)
            .select("*")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not response.data:
            return None
        return self._to_entity(response.data)

    def get_all(self) -> List[PatientEntity]:
        response = self.db.table(self.table).select("*").execute()
        return [self._to_entity(row) for row in response.data]

    def create(self, patient: PatientEntity) -> PatientEntity:
        payload = {
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "date_of_birth": str(patient.date_of_birth),
            "user_id": patient.user_id,
            "gender": patient.gender,
            "guardian_id": patient.guardian_id,
        }
        response = (
            self.db.table(self.table)
            .insert(payload)
            .execute()
        )
        return self._to_entity(response.data[0])

    def update(self, patient: PatientEntity) -> PatientEntity:
        payload = {
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "date_of_birth": str(patient.date_of_birth),
            "gender": patient.gender,
            "guardian_id": patient.guardian_id,
        }
        response = (
            self.db.table(self.table)
            .update(payload)
            .eq("patient_id", patient.patient_id)
            .execute()
        )
        return self._to_entity(response.data[0])

    def delete(self, patient_id: int) -> bool:
        self.db.table(self.table).delete().eq("patient_id", patient_id).execute()
        return True
