from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Boolean, Table, UniqueConstraint, CheckConstraint
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

# Tabla intermedia Many-to-Many entre Office y Specialty
office_specialty = Table(
    "office_specialties",
    Base.metadata,
    Column("office_id", Integer, ForeignKey("medical_offices.id", ondelete="CASCADE"), primary_key=True),
    Column("specialty_id", Integer, ForeignKey("specialties.id", ondelete="CASCADE"), primary_key=True),
)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False)
    # ... otros campos propios de auth

    # Relación con Doctor (uno a uno)
    doctor = relationship("Doctor", back_populates="user", uselist=False)

class Specialty(Base):
    __tablename__ = "specialties"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)

    doctors = relationship("Doctor", back_populates="specialty")
    offices = relationship("MedicalOffice", secondary=office_specialty, back_populates="specialties")

class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), unique=True, nullable=False)
    specialty_id = Column(Integer, ForeignKey("specialties.id", ondelete="RESTRICT"), nullable=False)
    license_number = Column(String, unique=True, nullable=False)  # RN: licencia única
    full_name = Column(String, nullable=False)
    phone = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="doctor")
    specialty = relationship("Specialty", back_populates="doctors")
    schedules = relationship("Schedule", back_populates="doctor", cascade="all, delete-orphan")
    appointments = relationship("MedicalAppointment", back_populates="doctor")

class MedicalOffice(Base):
    __tablename__ = "medical_offices"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    location = Column(String)
    is_available = Column(Boolean, default=True)

    specialties = relationship("Specialty", secondary=office_specialty, back_populates="offices")
    schedules = relationship("Schedule", back_populates="office")

class Schedule(Base):
    __tablename__ = "schedules"
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="CASCADE"), nullable=False)
    office_id = Column(Integer, ForeignKey("medical_offices.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(Integer, CheckConstraint("day_of_week BETWEEN 0 AND 6"), nullable=False)  # 0=Lun, 6=Dom
    start_time = Column(String(5), nullable=False)  # HH:MM
    end_time = Column(String(5), nullable=False)
    is_active = Column(Boolean, default=True)

    doctor = relationship("Doctor", back_populates="schedules")
    office = relationship("MedicalOffice", back_populates="schedules")

    # Restricción para evitar horarios superpuestos (se valida en la capa de servicio y también se puede poner un índice único compuesto, aunque no evita solapamiento parcial)
    __table_args__ = (UniqueConstraint("doctor_id", "day_of_week", "start_time", "end_time", name="uq_doctor_day_time"),)

class MedicalAppointment(Base):
    __tablename__ = "medical_appointments"
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("doctors.id", ondelete="RESTRICT"), nullable=False)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="RESTRICT"), nullable=False)  # Asumo tabla patients
    schedule_id = Column(Integer, ForeignKey("schedules.id", ondelete="RESTRICT"), nullable=False)
    appointment_date = Column(DateTime, nullable=False)
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow)

    doctor = relationship("Doctor", back_populates="appointments")
    schedule = relationship("Schedule")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String, nullable=False)
    record_id = Column(Integer, nullable=False)
    action = Column(String, nullable=False)  # INSERT, UPDATE, DELETE
    old_data = Column(JSONB, nullable=True)
    new_data = Column(JSONB, nullable=True)
    user_id = Column(Integer, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)