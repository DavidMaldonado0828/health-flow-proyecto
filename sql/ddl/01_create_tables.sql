-- ============================================
-- HEALTHFLOW - SCRIPT DDL
-- Versión: 1.0
-- Motor: PostgreSQL 12+
-- ============================================
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

-- =====================================================
-- TIPOS PERSONALIZADOS (ENUMS correctos en PostgreSQL)
-- =====================================================

CREATE TYPE day_name_type AS ENUM (
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
);

CREATE TYPE appointment_status AS ENUM (
    'Scheduled', 'Completed', 'Cancelled'
);

CREATE TYPE operation_type AS ENUM (
    'INSERT', 'UPDATE', 'DELETE'
);

-- ============================================
-- DOMINIO: USUARIOS Y ACCESO
-- ============================================

CREATE TABLE Role (
    role_id     SERIAL          PRIMARY KEY,
    name        VARCHAR(50)     NOT NULL UNIQUE
);

COMMENT ON TABLE Role IS 'Catálogo de roles del sistema (admin, doctor, receptionist, patient)';
COMMENT ON COLUMN Role.role_id IS 'Identificador único del rol';
COMMENT ON COLUMN Role.name    IS 'Nombre del rol, ej: admin, doctor, receptionist, patient';

-- -----------------------------------------------

CREATE TABLE Users (
    user_id     SERIAL          PRIMARY KEY,
    username    VARCHAR(100)    NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    email       VARCHAR(150)    NOT NULL UNIQUE,
    active      BOOLEAN         DEFAULT TRUE,
    create_date TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    role_id     INTEGER         NOT NULL,
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

COMMENT ON TABLE Users IS 'Usuarios del sistema. Todo actor que inicia sesión tiene un registro aquí';
COMMENT ON COLUMN Users.user_id     IS 'Identificador único del usuario';
COMMENT ON COLUMN Users.username    IS 'Nombre de usuario para login, debe ser único';
COMMENT ON COLUMN Users.password    IS 'Contraseña cifrada con bcrypt';
COMMENT ON COLUMN Users.email       IS 'Correo electrónico único del usuario';
COMMENT ON COLUMN Users.active      IS 'Estado del usuario: TRUE activo, FALSE desactivado (eliminación lógica)';
COMMENT ON COLUMN Users.create_date IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN Users.role_id     IS 'FK - Rol asignado al usuario';

-- -----------------------------------------------

CREATE TABLE User_Phones (
    phone_id        SERIAL      PRIMARY KEY,
    user_id         INTEGER     NOT NULL,
    phone_number    VARCHAR(20) NOT NULL,
    phone_type      VARCHAR(20),
    is_primary      BOOLEAN     DEFAULT FALSE,
    CONSTRAINT fk_phone_user
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

COMMENT ON TABLE User_Phones IS 'Teléfonos asociados a un usuario. Un usuario puede tener múltiples números';
COMMENT ON COLUMN User_Phones.phone_id      IS 'Identificador único del teléfono';
COMMENT ON COLUMN User_Phones.user_id       IS 'FK - Usuario al que pertenece este teléfono';
COMMENT ON COLUMN User_Phones.phone_number  IS 'Número telefónico del usuario';
COMMENT ON COLUMN User_Phones.phone_type    IS 'Tipo de teléfono: móvil, fijo, trabajo';
COMMENT ON COLUMN User_Phones.is_primary    IS 'TRUE si es el teléfono principal del usuario';

-- -----------------------------------------------

CREATE TABLE Document_Type (
    doc_type_id SERIAL      PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
);

COMMENT ON TABLE Document_Type IS 'Catálogo de tipos de documento de identidad';
COMMENT ON COLUMN Document_Type.doc_type_id IS 'Identificador único del tipo de documento';
COMMENT ON COLUMN Document_Type.name        IS 'Nombre del tipo, ej: CC, CE, Passport, TI';

-- -----------------------------------------------

CREATE TABLE User_Documents (
    user_doc_id     SERIAL      PRIMARY KEY,
    user_id         INTEGER     NOT NULL,
    doc_type_id     INTEGER     NOT NULL,
    document_number VARCHAR(50) NOT NULL,
    CONSTRAINT fk_udoc_user
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_udoc_doc_type
        FOREIGN KEY (doc_type_id) REFERENCES Document_Type(doc_type_id)
);

COMMENT ON TABLE User_Documents IS 'Documentos de identidad asociados a un usuario';
COMMENT ON COLUMN User_Documents.user_doc_id     IS 'Identificador único del documento';
COMMENT ON COLUMN User_Documents.user_id         IS 'FK - Usuario al que pertenece el documento';
COMMENT ON COLUMN User_Documents.doc_type_id     IS 'FK - Tipo de documento (CC, CE, Passport)';
COMMENT ON COLUMN User_Documents.document_number IS 'Número del documento de identidad';

-- ============================================
-- DOMINIO: PERSONAL CLÍNICO
-- ============================================

CREATE TABLE Schedule (
    schedule_id SERIAL          PRIMARY KEY,
    day_of_week day_name_type   NOT NULL,
    start_time  TIME            NOT NULL,
    end_time    TIME            NOT NULL,
    CONSTRAINT chk_schedule_times CHECK (end_time > start_time)
);

COMMENT ON TABLE Schedule IS 'Horarios de disponibilidad de los médicos por día de la semana';
COMMENT ON COLUMN Schedule.schedule_id IS 'Identificador único del horario';
COMMENT ON COLUMN Schedule.day_of_week IS 'Día de la semana usando tipo ENUM day_name_type';
COMMENT ON COLUMN Schedule.start_time  IS 'Hora de inicio del turno del médico';
COMMENT ON COLUMN Schedule.end_time    IS 'Hora de fin del turno, debe ser mayor a start_time';

-- -----------------------------------------------

CREATE TABLE Department (
    department_id   SERIAL          PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    location        VARCHAR(150)
);

COMMENT ON TABLE Department IS 'Departamentos o áreas del hospital, ej: Cardiología, Pediatría';
COMMENT ON COLUMN Department.department_id IS 'Identificador único del departamento';
COMMENT ON COLUMN Department.name          IS 'Nombre del departamento hospitalario';
COMMENT ON COLUMN Department.location      IS 'Ubicación física del departamento dentro del hospital';

-- -----------------------------------------------

CREATE TABLE Specialty (
    specialty_id    SERIAL      PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    department_id   INTEGER     NOT NULL,
    CONSTRAINT fk_specialty_department
        FOREIGN KEY (department_id) REFERENCES Department(department_id)
);

COMMENT ON TABLE Specialty IS 'Especialidades médicas asociadas a un departamento';
COMMENT ON COLUMN Specialty.specialty_id   IS 'Identificador único de la especialidad';
COMMENT ON COLUMN Specialty.name           IS 'Nombre de la especialidad, ej: Cardiología, Neurología';
COMMENT ON COLUMN Specialty.description    IS 'Descripción detallada de la especialidad médica';
COMMENT ON COLUMN Specialty.department_id  IS 'FK - Departamento al que pertenece la especialidad';

-- -----------------------------------------------

CREATE TABLE Doctor (
    doctor_id       SERIAL      PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    license_number  VARCHAR(50) NOT NULL UNIQUE,
    user_id         INTEGER     NOT NULL UNIQUE,
    schedule_id     INTEGER     NOT NULL,
    specialty_id    INTEGER     NOT NULL,
    CONSTRAINT fk_doctor_user
        FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT fk_doctor_specialty
        FOREIGN KEY (specialty_id) REFERENCES Specialty(specialty_id),
    CONSTRAINT fk_doctor_schedule
        FOREIGN KEY (schedule_id) REFERENCES Schedule(schedule_id)
);

COMMENT ON TABLE Doctor IS 'Información profesional de los médicos del sistema';
COMMENT ON COLUMN Doctor.doctor_id      IS 'Identificador único del médico';
COMMENT ON COLUMN Doctor.first_name     IS 'Nombre del médico';
COMMENT ON COLUMN Doctor.last_name      IS 'Apellido del médico';
COMMENT ON COLUMN Doctor.license_number IS 'Número de licencia médica profesional, debe ser único';
COMMENT ON COLUMN Doctor.user_id        IS 'FK - Usuario asociado al médico (relación 1:1)';
COMMENT ON COLUMN Doctor.schedule_id    IS 'FK - Horario de disponibilidad del médico';
COMMENT ON COLUMN Doctor.specialty_id   IS 'FK - Especialidad principal del médico';

-- ============================================
-- DOMINIO: INFRAESTRUCTURA HOSPITALARIA
-- ============================================

CREATE TABLE Medical_Office (
    office_id   SERIAL          PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    floor       VARCHAR(20),
    active      BOOLEAN         DEFAULT TRUE
);

COMMENT ON TABLE Medical_Office IS 'Consultorios o salas médicas disponibles en el hospital';
COMMENT ON COLUMN Medical_Office.office_id IS 'Identificador único del consultorio';
COMMENT ON COLUMN Medical_Office.name      IS 'Nombre o número del consultorio';
COMMENT ON COLUMN Medical_Office.floor     IS 'Piso o planta donde se encuentra el consultorio';
COMMENT ON COLUMN Medical_Office.active    IS 'TRUE si el consultorio está disponible, FALSE si está fuera de servicio';

-- -----------------------------------------------

CREATE TABLE Speciality_Office (
    specialty_id    INTEGER NOT NULL,
    office_id       INTEGER NOT NULL,
    PRIMARY KEY (specialty_id, office_id),
    CONSTRAINT fk_so_specialty
        FOREIGN KEY (specialty_id) REFERENCES Specialty(specialty_id),
    CONSTRAINT fk_so_office
        FOREIGN KEY (office_id) REFERENCES Medical_Office(office_id)
);

COMMENT ON TABLE Speciality_Office IS 'Tabla puente N:M entre especialidades y consultorios. Un consultorio puede atender varias especialidades';
COMMENT ON COLUMN Speciality_Office.specialty_id IS 'FK - Especialidad asignada al consultorio';
COMMENT ON COLUMN Speciality_Office.office_id    IS 'FK - Consultorio asignado a la especialidad';

-- ============================================
-- DOMINIO: PACIENTES
-- ============================================

CREATE TABLE Guardian (
    guardian_id     SERIAL      PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    kinship         VARCHAR(50),
    document_number VARCHAR(50) NOT NULL
);

COMMENT ON TABLE Guardian IS 'Acudientes o responsables legales de un paciente';
COMMENT ON COLUMN Guardian.guardian_id      IS 'Identificador único del acudiente';
COMMENT ON COLUMN Guardian.full_name        IS 'Nombre completo del acudiente';
COMMENT ON COLUMN Guardian.kinship          IS 'Parentesco con el paciente, ej: padre, madre, tutor';
COMMENT ON COLUMN Guardian.document_number  IS 'Número de documento de identidad del acudiente';

-- -----------------------------------------------

CREATE TABLE Patient (
    patient_id      SERIAL      PRIMARY KEY,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    date_of_birth   DATE        NOT NULL,
    gender          VARCHAR(20),
    created_at      TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
    user_id         INTEGER     NOT NULL UNIQUE,
    guardian_id     INTEGER,
    CONSTRAINT fk_patient_user
        FOREIGN KEY (user_id) REFERENCES Users(user_id),
    CONSTRAINT fk_patient_guardian
        FOREIGN KEY (guardian_id) REFERENCES Guardian(guardian_id)
);

COMMENT ON TABLE Patient IS 'Información clínica y personal de los pacientes del sistema';
COMMENT ON COLUMN Patient.patient_id    IS 'Identificador único del paciente';
COMMENT ON COLUMN Patient.first_name    IS 'Nombre del paciente';
COMMENT ON COLUMN Patient.last_name     IS 'Apellido del paciente';
COMMENT ON COLUMN Patient.date_of_birth IS 'Fecha de nacimiento del paciente';
COMMENT ON COLUMN Patient.gender        IS 'Género del paciente';
COMMENT ON COLUMN Patient.created_at    IS 'Fecha de registro del paciente en el sistema';
COMMENT ON COLUMN Patient.user_id       IS 'FK - Usuario asociado al paciente (relación 1:1)';
COMMENT ON COLUMN Patient.guardian_id   IS 'FK - Acudiente del paciente, opcional para adultos';

-- ============================================
-- DOMINIO: ATENCIÓN MÉDICA
-- ============================================

CREATE TABLE Medical_Appointment (
    appointment_id      SERIAL              PRIMARY KEY,
    appointment_date    DATE                NOT NULL,
    status              appointment_status  NOT NULL DEFAULT 'Scheduled',
    reason              TEXT,
    created_at          TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    patient_id          INTEGER             NOT NULL,
    doctor_id           INTEGER             NOT NULL,
    office_id           INTEGER             NOT NULL,
    CONSTRAINT fk_appointment_patient
        FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
    CONSTRAINT fk_appointment_doctor
        FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id),
    CONSTRAINT fk_appointment_office
        FOREIGN KEY (office_id) REFERENCES Medical_Office(office_id)
);

COMMENT ON TABLE Medical_Appointment IS 'Citas médicas agendadas entre pacientes y médicos';
COMMENT ON COLUMN Medical_Appointment.appointment_id   IS 'Identificador único de la cita';
COMMENT ON COLUMN Medical_Appointment.appointment_date IS 'Fecha en que se realizará la cita';
COMMENT ON COLUMN Medical_Appointment.status           IS 'Estado de la cita: Scheduled, Completed, Cancelled';
COMMENT ON COLUMN Medical_Appointment.reason           IS 'Motivo de consulta del paciente';
COMMENT ON COLUMN Medical_Appointment.created_at       IS 'Fecha y hora en que se agendó la cita';
COMMENT ON COLUMN Medical_Appointment.patient_id       IS 'FK - Paciente que asiste a la cita';
COMMENT ON COLUMN Medical_Appointment.doctor_id        IS 'FK - Médico que atiende la cita';
COMMENT ON COLUMN Medical_Appointment.office_id        IS 'FK - Consultorio donde se realiza la cita';

-- -----------------------------------------------

CREATE TABLE Medical_History (
    medical_history_id  SERIAL  PRIMARY KEY,
    symptoms            TEXT,
    diagnosis           TEXT,
    treatment_plan      TEXT,
    notes               TEXT,
    consultation_date   DATE    NOT NULL,
    appointment_id      INTEGER NOT NULL UNIQUE,
    CONSTRAINT fk_history_appointment
        FOREIGN KEY (appointment_id) 
        REFERENCES Medical_Appointment(appointment_id)
);

COMMENT ON TABLE Medical_History IS 'Historia clínica generada por el médico después de una cita. Relación 1:1 con Medical_Appointment';
COMMENT ON COLUMN Medical_History.medical_history_id IS 'Identificador único de la historia clínica';
COMMENT ON COLUMN Medical_History.symptoms           IS 'Síntomas reportados por el paciente durante la consulta';
COMMENT ON COLUMN Medical_History.diagnosis          IS 'Diagnóstico emitido por el médico';
COMMENT ON COLUMN Medical_History.treatment_plan     IS 'Plan de tratamiento indicado por el médico';
COMMENT ON COLUMN Medical_History.notes              IS 'Notas adicionales del médico sobre la consulta';
COMMENT ON COLUMN Medical_History.consultation_date  IS 'Fecha en que se realizó la consulta';
COMMENT ON COLUMN Medical_History.appointment_id     IS 'FK - Cita médica que originó esta historia clínica (UNIQUE = 1:1)';

-- -----------------------------------------------

CREATE TABLE Medicine (
    medicine_id         SERIAL          PRIMARY KEY,
    name                VARCHAR(150)    NOT NULL,
    presentation        VARCHAR(100),
    concentration       VARCHAR(50),
    active_ingredient   VARCHAR(150)
);

COMMENT ON TABLE Medicine IS 'Catálogo de medicamentos disponibles en el sistema';
COMMENT ON COLUMN Medicine.medicine_id       IS 'Identificador único del medicamento';
COMMENT ON COLUMN Medicine.name              IS 'Nombre comercial del medicamento';
COMMENT ON COLUMN Medicine.presentation      IS 'Forma farmacéutica: tableta, jarabe, inyectable, etc.';
COMMENT ON COLUMN Medicine.concentration     IS 'Concentración del medicamento, ej: 500mg, 250mg/5ml';
COMMENT ON COLUMN Medicine.active_ingredient IS 'Principio activo del medicamento';

-- -----------------------------------------------

CREATE TABLE Prescription (
    medical_history_id  INTEGER     NOT NULL,
    medicine_id         INTEGER     NOT NULL,
    dose                VARCHAR(50),
    frequency           VARCHAR(50),
    duration            VARCHAR(50),
    PRIMARY KEY (medical_history_id, medicine_id),
    CONSTRAINT fk_prescription_history
        FOREIGN KEY (medical_history_id) 
        REFERENCES Medical_History(medical_history_id),
    CONSTRAINT fk_prescription_medicine
        FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id)
);

COMMENT ON TABLE Prescription IS 'Tabla puente N:M entre historia clínica y medicamentos. Contiene los detalles de cada medicamento prescrito';
COMMENT ON COLUMN Prescription.medical_history_id IS 'FK - Historia clínica a la que pertenece esta prescripción';
COMMENT ON COLUMN Prescription.medicine_id        IS 'FK - Medicamento recetado';
COMMENT ON COLUMN Prescription.dose               IS 'Dosis indicada, ej: 1 tableta, 5ml';
COMMENT ON COLUMN Prescription.frequency          IS 'Frecuencia de administración, ej: cada 8 horas';
COMMENT ON COLUMN Prescription.duration           IS 'Duración del tratamiento, ej: 7 días, 2 semanas';


-- ============================================
-- DOMINIO: AUDITORÍA
-- ============================================

CREATE TABLE Audit_Log (
    audit_id        SERIAL          PRIMARY KEY,
    table_name      VARCHAR(100)    NOT NULL,
    operation_type  operation_type  NOT NULL,
    old_value       JSONB,
    new_value       JSONB,
    performed_at    TIMESTAMP       DEFAULT CURRENT_TIMESTAMP,
    ip_address      VARCHAR(45),
    user_id         INTEGER,
    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

COMMENT ON TABLE Audit_Log IS 'Registro de auditoría de todas las operaciones CRUD del sistema';
COMMENT ON COLUMN Audit_Log.audit_id       IS 'Identificador único del registro de auditoría';
COMMENT ON COLUMN Audit_Log.table_name     IS 'Nombre de la tabla afectada por la operación';
COMMENT ON COLUMN Audit_Log.operation_type IS 'Tipo de operación: INSERT, UPDATE o DELETE ';
COMMENT ON COLUMN Audit_Log.old_value      IS 'Valores anteriores en formato JSON (solo para UPDATE y DELETE)';
COMMENT ON COLUMN Audit_Log.new_value      IS 'Valores nuevos en formato JSON (para INSERT y UPDATE)';
COMMENT ON COLUMN Audit_Log.performed_at   IS 'Fecha y hora exacta en que se ejecutó la operación';
COMMENT ON COLUMN Audit_Log.ip_address     IS 'Dirección IP desde donde se ejecutó la operación (opcional)';
COMMENT ON COLUMN Audit_Log.user_id        IS 'FK - Usuario que ejecutó la operación. NULL si fue acción del sistema';

-- ============================================
-- FUNCIONES Y TRIGGERS DE AUDITORÍA
-- ============================================

CREATE OR REPLACE FUNCTION fn_audit_log() RETURNS trigger AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO Audit_Log(table_name, operation_type, new_value, performed_at, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), CURRENT_TIMESTAMP, NULL);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO Audit_Log(table_name, operation_type, old_value, new_value, performed_at, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), CURRENT_TIMESTAMP, NULL);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO Audit_Log(table_name, operation_type, old_value, performed_at, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), CURRENT_TIMESTAMP, NULL);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON Users
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();
