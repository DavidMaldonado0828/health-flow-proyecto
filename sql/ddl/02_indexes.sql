-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN (Performance)
-- ============================================

-- 1. Índices para búsqueda de usuarios y pacientes (búsquedas frecuentes)
CREATE INDEX idx_users_username ON Users(username);
CREATE INDEX idx_patient_lastname ON Patient(last_name);
CREATE INDEX idx_doctor_license ON Doctor(license_number);

-- 2. Índices para fechas de citas (vital para reportes y consultas por rango)
CREATE INDEX idx_appointment_date ON Medical_Appointment(appointment_date);

-- 3. Índices en Foreign Keys (CRÍTICO para acelerar los JOINs entre tablas)
-
CREATE INDEX idx_fk_users_role ON Users(role_id);
CREATE INDEX idx_fk_doctor_specialty ON Doctor(specialty_id);
CREATE INDEX idx_fk_doctor_schedule ON Doctor(schedule_id);
CREATE INDEX idx_fk_appointment_patient ON Medical_Appointment(patient_id);
CREATE INDEX idx_fk_appointment_doctor ON Medical_Appointment(doctor_id);
CREATE INDEX idx_fk_appointment_office ON Medical_Appointment(office_id);
CREATE INDEX idx_fk_history_appointment ON Medical_History(appointment_id);

-- 4. Índice especial para la auditoría (JSONB)

CREATE INDEX idx_audit_table_name ON Audit_Log(table_name);
CREATE INDEX idx_audit_performed_at ON Audit_Log(performed_at);