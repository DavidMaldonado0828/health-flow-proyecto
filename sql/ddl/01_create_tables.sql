-- ============================================
-- HEALTHFLOW - SCRIPT DDL
-- Versión: 1.0
-- Motor: PostgreSQL 12+
-- ============================================

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

CREATE TABLE Roles (
    role_id     SERIAL          PRIMARY KEY,
    name        VARCHAR(50)     NOT NULL UNIQUE
);

COMMENT ON TABLE Roles IS 'Catálogo de roles del sistema (admin, doctor, receptionist, patient)';
COMMENT ON COLUMN Roles.role_id IS 'Identificador único del rol';
COMMENT ON COLUMN Roles.name    IS 'Nombre del rol, ej: admin, doctor, receptionist, patient';

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
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
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

CREATE TABLE Document_Types (
    doc_type_id SERIAL      PRIMARY KEY,
    name        VARCHAR(50) NOT NULL UNIQUE
);

COMMENT ON TABLE Document_Types IS 'Catálogo de tipos de documento de identidad';
COMMENT ON COLUMN Document_Types.doc_type_id IS 'Identificador único del tipo de documento';
COMMENT ON COLUMN Document_Types.name        IS 'Nombre del tipo, ej: CC, CE, Passport, TI';

-- -----------------------------------------------

CREATE TABLE User_Documents (
    user_doc_id     SERIAL      PRIMARY KEY,
    user_id         INTEGER     NOT NULL,
    doc_type_id     INTEGER     NOT NULL,
    document_number VARCHAR(50) NOT NULL,
    CONSTRAINT fk_udoc_user
        FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_udoc_doc_type
        FOREIGN KEY (doc_type_id) REFERENCES Document_Types(doc_type_id)
);

COMMENT ON TABLE User_Documents IS 'Documentos de identidad asociados a un usuario';
COMMENT ON COLUMN User_Documents.user_doc_id     IS 'Identificador único del documento';
COMMENT ON COLUMN User_Documents.user_id         IS 'FK - Usuario al que pertenece el documento';
COMMENT ON COLUMN User_Documents.doc_type_id     IS 'FK - Tipo de documento (CC, CE, Passport)';
COMMENT ON COLUMN User_Documents.document_number IS 'Número del documento de identidad';

-- ============================================
-- DOMINIO: PERSONAL CLÍNICO
-- ============================================

CREATE TABLE Schedules (
    schedule_id SERIAL          PRIMARY KEY,
    day_of_week day_name_type   NOT NULL,
    start_time  TIME            NOT NULL,
    end_time    TIME            NOT NULL,
    CONSTRAINT chk_schedule_times CHECK (end_time > start_time)
);

COMMENT ON TABLE Schedules IS 'Horarios de disponibilidad de los médicos por día de la semana';
COMMENT ON COLUMN Schedules.schedule_id IS 'Identificador único del horario';
COMMENT ON COLUMN Schedules.day_of_week IS 'Día de la semana usando tipo ENUM day_name_type';
COMMENT ON COLUMN Schedules.start_time  IS 'Hora de inicio del turno del médico';
COMMENT ON COLUMN Schedules.end_time    IS 'Hora de fin del turno, debe ser mayor a start_time';

-- -----------------------------------------------

CREATE TABLE Departments (
    department_id   SERIAL          PRIMARY KEY,
    name            VARCHAR(100)    NOT NULL,
    location        VARCHAR(150)
);

COMMENT ON TABLE Departments IS 'Departamentos o áreas del hospital, ej: Cardiología, Pediatría';
COMMENT ON COLUMN Departments.department_id IS 'Identificador único del departamento';
COMMENT ON COLUMN Departments.name          IS 'Nombre del departamento hospitalario';
COMMENT ON COLUMN Departments.location      IS 'Ubicación física del departamento dentro del hospital';

-- -----------------------------------------------

CREATE TABLE Specialties (
    specialty_id    SERIAL      PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    description     TEXT,
    department_id   INTEGER     NOT NULL,
    CONSTRAINT fk_specialty_department
    FOREIGN KEY (department_id) REFERENCES Departments(department_id)
);

COMMENT ON TABLE Specialties IS 'Especialidades médicas asociadas a un departamento';
COMMENT ON COLUMN Specialties.specialty_id   IS 'Identificador único de la especialidad';
COMMENT ON COLUMN Specialties.name           IS 'Nombre de la especialidad, ej: Cardiología, Neurología';
COMMENT ON COLUMN Specialties.description    IS 'Descripción detallada de la especialidad médica';
COMMENT ON COLUMN Specialties.department_id  IS 'FK - Departamento al que pertenece la especialidad';

-- -----------------------------------------------

CREATE TABLE Doctors (
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
        FOREIGN KEY (specialty_id) REFERENCES Specialties(specialty_id),
    CONSTRAINT fk_doctor_schedule
        FOREIGN KEY (schedule_id) REFERENCES Schedules(schedule_id)
);

COMMENT ON TABLE Doctors IS 'Información profesional de los médicos del sistema';
COMMENT ON COLUMN Doctors.doctor_id      IS 'Identificador único del médico';
COMMENT ON COLUMN Doctors.first_name     IS 'Nombre del médico';
COMMENT ON COLUMN Doctors.last_name      IS 'Apellido del médico';
COMMENT ON COLUMN Doctors.license_number IS 'Número de licencia médica profesional, debe ser único';
COMMENT ON COLUMN Doctors.user_id        IS 'FK - Usuario asociado al médico (relación 1:1)';
COMMENT ON COLUMN Doctors.schedule_id    IS 'FK - Horario de disponibilidad del médico';
COMMENT ON COLUMN Doctors.specialty_id   IS 'FK - Especialidad principal del médico';

-- ============================================
-- DOMINIO: INFRAESTRUCTURA HOSPITALARIA
-- ============================================

CREATE TABLE Medical_Offices (
    office_id   SERIAL          PRIMARY KEY,
    name        VARCHAR(100)    NOT NULL,
    floor       VARCHAR(20),
    active      BOOLEAN         DEFAULT TRUE
);

COMMENT ON TABLE Medical_Offices IS 'Consultorios o salas médicas disponibles en el hospital';
COMMENT ON COLUMN Medical_Offices.office_id IS 'Identificador único del consultorio';
COMMENT ON COLUMN Medical_Offices.name      IS 'Nombre o número del consultorio';
COMMENT ON COLUMN Medical_Offices.floor     IS 'Piso o planta donde se encuentra el consultorio';
COMMENT ON COLUMN Medical_Offices.active    IS 'TRUE si el consultorio está disponible, FALSE si está fuera de servicio';

-- -----------------------------------------------

CREATE TABLE Speciality_Offices (
    specialty_id    INTEGER NOT NULL,
    office_id       INTEGER NOT NULL,
    PRIMARY KEY (specialty_id, office_id),
    CONSTRAINT fk_so_specialty
        FOREIGN KEY (specialty_id) REFERENCES Specialties(specialty_id),
    CONSTRAINT fk_so_office
        FOREIGN KEY (office_id) REFERENCES Medical_Offices(office_id)
);

COMMENT ON TABLE Speciality_Offices IS 'Tabla puente N:M entre especialidades y consultorios. Un consultorio puede atender varias especialidades';
COMMENT ON COLUMN Speciality_Offices.specialty_id IS 'FK - Especialidad asignada al consultorio';
COMMENT ON COLUMN Speciality_Offices.office_id    IS 'FK - Consultorio asignado a la especialidad';

-- ============================================
-- DOMINIO: PACIENTES
-- ============================================

CREATE TABLE Guardians (
    guardian_id     SERIAL      PRIMARY KEY,
    full_name       VARCHAR(150) NOT NULL,
    kinship         VARCHAR(50),
    document_number VARCHAR(50) NOT NULL
);

COMMENT ON TABLE Guardians IS 'Acudientes o responsables legales de un paciente';
COMMENT ON COLUMN Guardians.guardian_id      IS 'Identificador único del acudiente';
COMMENT ON COLUMN Guardians.full_name        IS 'Nombre completo del acudiente';
COMMENT ON COLUMN Guardians.kinship          IS 'Parentesco con el paciente, ej: padre, madre, tutor';
COMMENT ON COLUMN Guardians.document_number  IS 'Número de documento de identidad del acudiente';

-- -----------------------------------------------

CREATE TABLE Patients (
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
        FOREIGN KEY (guardian_id) REFERENCES Guardians(guardian_id)
);

COMMENT ON TABLE Patients IS 'Información clínica y personal de los pacientes del sistema';
COMMENT ON COLUMN Patients.patient_id    IS 'Identificador único del paciente';
COMMENT ON COLUMN Patients.first_name    IS 'Nombre del paciente';
COMMENT ON COLUMN Patients.last_name     IS 'Apellido del paciente';
COMMENT ON COLUMN Patients.date_of_birth IS 'Fecha de nacimiento del paciente';
COMMENT ON COLUMN Patients.gender        IS 'Género del paciente';
COMMENT ON COLUMN Patients.created_at    IS 'Fecha de registro del paciente en el sistema';
COMMENT ON COLUMN Patients.user_id       IS 'FK - Usuario asociado al paciente (relación 1:1)';
COMMENT ON COLUMN Patients.guardian_id   IS 'FK - Acudiente del paciente, opcional para adultos';

-- ============================================
-- DOMINIO: ATENCIÓN MÉDICA
-- ============================================

CREATE TABLE Medical_Appointments (
    appointment_id      SERIAL              PRIMARY KEY,
    appointment_date    DATE                NOT NULL,
    status              appointment_status  NOT NULL DEFAULT 'Scheduled',
    reason              TEXT,
    created_at          TIMESTAMP           DEFAULT CURRENT_TIMESTAMP,
    patient_id          INTEGER             NOT NULL,
    doctor_id           INTEGER             NOT NULL,
    office_id           INTEGER             NOT NULL,
    CONSTRAINT fk_appointment_patient
        FOREIGN KEY (patient_id) REFERENCES Patients(patient_id),
    CONSTRAINT fk_appointment_doctor
        FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id),
    CONSTRAINT fk_appointment_office
        FOREIGN KEY (office_id) REFERENCES Medical_Offices(office_id)
);

COMMENT ON TABLE Medical_Appointments IS 'Citas médicas agendadas entre pacientes y médicos';
COMMENT ON COLUMN Medical_Appointments.appointment_id   IS 'Identificador único de la cita';
COMMENT ON COLUMN Medical_Appointments.appointment_date IS 'Fecha en que se realizará la cita';
COMMENT ON COLUMN Medical_Appointments.status           IS 'Estado de la cita: Scheduled, Completed, Cancelled';
COMMENT ON COLUMN Medical_Appointments.reason           IS 'Motivo de consulta del paciente';
COMMENT ON COLUMN Medical_Appointments.created_at       IS 'Fecha y hora en que se agendó la cita';
COMMENT ON COLUMN Medical_Appointments.patient_id       IS 'FK - Paciente que asiste a la cita';
COMMENT ON COLUMN Medical_Appointments.doctor_id        IS 'FK - Médico que atiende la cita';
COMMENT ON COLUMN Medical_Appointments.office_id        IS 'FK - Consultorio donde se realiza la cita';

-- -----------------------------------------------

CREATE TABLE Medical_Histories (
    medical_history_id  SERIAL  PRIMARY KEY,
    symptoms            TEXT,
    diagnosis           TEXT,
    treatment_plan      TEXT,
    notes               TEXT,
    consultation_date   DATE    NOT NULL,
    appointment_id      INTEGER NOT NULL UNIQUE,
    CONSTRAINT fk_history_appointment
    FOREIGN KEY (appointment_id) 
    REFERENCES Medical_Appointments(appointment_id)
);

COMMENT ON TABLE Medical_Histories IS 'Historia clínica generada por el médico después de una cita. Relación 1:1 con Medical_Appointments';
COMMENT ON COLUMN Medical_Histories.medical_history_id IS 'Identificador único de la historia clínica';
COMMENT ON COLUMN Medical_Histories.symptoms           IS 'Síntomas reportados por el paciente durante la consulta';
COMMENT ON COLUMN Medical_Histories.diagnosis          IS 'Diagnóstico emitido por el médico';
COMMENT ON COLUMN Medical_Histories.treatment_plan     IS 'Plan de tratamiento indicado por el médico';
COMMENT ON COLUMN Medical_Histories.notes              IS 'Notas adicionales del médico sobre la consulta';
COMMENT ON COLUMN Medical_Histories.consultation_date  IS 'Fecha en que se realizó la consulta';
COMMENT ON COLUMN Medical_Histories.appointment_id     IS 'FK - Cita médica que originó esta historia clínica (UNIQUE = 1:1)';

-- -----------------------------------------------

CREATE TABLE Medicines (
    medicine_id         SERIAL          PRIMARY KEY,
    name                VARCHAR(150)    NOT NULL,
    presentation        VARCHAR(100),
    concentration       VARCHAR(50),
    active_ingredient   VARCHAR(150)
);

COMMENT ON TABLE Medicines IS 'Catálogo de medicamentos disponibles en el sistema';
COMMENT ON COLUMN Medicines.medicine_id       IS 'Identificador único del medicamento';
COMMENT ON COLUMN Medicines.name              IS 'Nombre comercial del medicamento';
COMMENT ON COLUMN Medicines.presentation      IS 'Forma farmacéutica: tableta, jarabe, inyectable, etc.';
COMMENT ON COLUMN Medicines.concentration     IS 'Concentración del medicamento, ej: 500mg, 250mg/5ml';
COMMENT ON COLUMN Medicines.active_ingredient IS 'Principio activo del medicamento';

-- -----------------------------------------------

CREATE TABLE Prescriptions (
    medical_history_id  INTEGER     NOT NULL,
    medicine_id         INTEGER     NOT NULL,
    dose                VARCHAR(50),
    frequency           VARCHAR(50),
    duration            VARCHAR(50),
    PRIMARY KEY (medical_history_id, medicine_id),
    CONSTRAINT fk_prescription_history
        FOREIGN KEY (medical_history_id) 
        REFERENCES Medical_Histories(medical_history_id),
    CONSTRAINT fk_prescription_medicine
        FOREIGN KEY (medicine_id) REFERENCES Medicines(medicine_id)
);

COMMENT ON TABLE Prescriptions IS 'Tabla puente N:M entre historia clínica y medicamentos. Contiene los detalles de cada medicamento prescrito';
COMMENT ON COLUMN Prescriptions.medical_history_id IS 'FK - Historia clínica a la que pertenece esta prescripción';
COMMENT ON COLUMN Prescriptions.medicine_id        IS 'FK - Medicamento recetado';
COMMENT ON COLUMN Prescriptions.dose               IS 'Dosis indicada, ej: 1 tableta, 5ml';
COMMENT ON COLUMN Prescriptions.frequency          IS 'Frecuencia de administración, ej: cada 8 horas';
COMMENT ON COLUMN Prescriptions.duration           IS 'Duración del tratamiento, ej: 7 días, 2 semanas';


-- ============================================
-- DOMINIO: AUDITORÍA
-- ============================================

CREATE TABLE Audit_Logs (
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

COMMENT ON TABLE Audit_Logs IS 'Registro de auditoría de todas las operaciones CRUD del sistema';
COMMENT ON COLUMN Audit_Logs.audit_id       IS 'Identificador único del registro de auditoría';
COMMENT ON COLUMN Audit_Logs.table_name     IS 'Nombre de la tabla afectada por la operación';
COMMENT ON COLUMN Audit_Logs.operation_type IS 'Tipo de operación: INSERT, UPDATE o DELETE ';
COMMENT ON COLUMN Audit_Logs.old_value      IS 'Valores anteriores en formato JSON (solo para UPDATE y DELETE)';
COMMENT ON COLUMN Audit_Logs.new_value      IS 'Valores nuevos en formato JSON (para INSERT y UPDATE)';
COMMENT ON COLUMN Audit_Logs.performed_at   IS 'Fecha y hora exacta en que se ejecutó la operación';
COMMENT ON COLUMN Audit_Logs.ip_address     IS 'Dirección IP desde donde se ejecutó la operación (opcional)';
COMMENT ON COLUMN Audit_Logs.user_id        IS 'FK - Usuario que ejecutó la operación. NULL si fue acción del sistema';


