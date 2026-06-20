-- ============================================
-- ÍNDICES PARA OPTIMIZACIÓN (Performance)
-- ============================================

-- 1. Índices para búsqueda de usuarios y pacientes (búsquedas frecuentes)
CREATE INDEX idx_users_username ON Users(username);
CREATE INDEX idx_patients_lastname ON Patients(last_name);
CREATE INDEX idx_doctors_license ON Doctors(license_number);

-- 2. Índices para fechas de citas (vital para reportes y consultas por rango)
CREATE INDEX idx_appointment_date ON Medical_Appointments(appointment_date);

-- 3. Índices en Foreign Keys (CRÍTICO para acelerar los JOINs entre tablas)
-
CREATE INDEX idx_fk_users_role ON Users(role_id);
CREATE INDEX idx_fk_doctors_specialty ON Doctors(specialty_id);
CREATE INDEX idx_fk_doctors_schedule ON Doctors(schedule_id);
CREATE INDEX idx_fk_appointment_patient ON Medical_Appointments(patient_id);
CREATE INDEX idx_fk_appointment_doctor ON Medical_Appointments(doctor_id);
CREATE INDEX idx_fk_appointment_office ON Medical_Appointments(office_id);
CREATE INDEX idx_fk_history_appointment ON Medical_Histories(appointment_id);

-- 4. Índice especial para la auditoría (JSONB)

CREATE INDEX idx_audit_table_name ON Audit_Logs(table_name);
CREATE INDEX idx_audit_performed_at ON Audit_Logs(performed_at);