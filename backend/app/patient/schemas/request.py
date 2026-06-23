from datetime import date
from typing import Optional

from pydantic import BaseModel, Field


class CreatePatientRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    date_of_birth: date
    user_id: int
    gender: Optional[str] = Field(None, max_length=20)
    guardian_id: Optional[int] = None


class UpdatePatientRequest(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    date_of_birth: Optional[date] = None
    gender: Optional[str] = Field(None, max_length=20)
    guardian_id: Optional[int] = None
