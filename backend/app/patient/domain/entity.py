from dataclasses import dataclass
from datetime import date, datetime
from typing import Optional


@dataclass
class PatientEntity:
    patient_id: int
    first_name: str
    last_name: str
    date_of_birth: date
    user_id: int
    gender: Optional[str] = None
    created_at: Optional[datetime] = None
    guardian_id: Optional[int] = None
