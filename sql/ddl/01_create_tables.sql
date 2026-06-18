-- ============================================
-- HEALTHFLOW - SCRIPT DDL
-- Estructura base de las tablas
-- ============================================

-- ============================================
-- DOMINIO: USUARIOS Y ACCESO
-- ============================================

CREATE TABLE Role (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE User (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    document VARCHAR(50),
    email VARCHAR(150) NOT NULL UNIQUE,
    number_phone VARCHAR(20),
    active BOOLEAN DEFAULT TRUE,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    role_id INTEGER NOT NULL,
    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id) REFERENCES Role(role_id)
);

CREATE TABLE User_Phones (
    phone_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    phone_type VARCHAR(20), 
    is_primary BOOLEAN DEFAULT FALSE, 
    CONSTRAINT fk_phone_user
        FOREIGN KEY (user_id) REFERENCES User(user_id) ON DELETE CASCADE
);

-- ============================================
-- DOMINIO: PERSONAL CLÍNICO
-- ============================================
CREATE TYPE day_name_type AS ENUM (
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
);

CREATE TABLE Schedule (
    schedule_id SERIAL PRIMARY KEY,
    day_of_week day_name_type NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

CREATE TABLE Department (
    department_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(150)
);

CREATE TABLE Specialty (
    specialty_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    department_id INTEGER NOT NULL,
    CONSTRAINT fk_specialty_department
        FOREIGN KEY (department_id) REFERENCES Department(department_id)
);

CREATE TABLE Doctor (
    doctor_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) NOT NULL UNIQUE,
    user_id INTEGER NOT NULL UNIQUE,
    schedule_id INTEGER NOT NULL,
    specialty_id INTEGER NOT NULL,
    CONSTRAINT fk_doctor_user
        FOREIGN KEY (user_id) REFERENCES User(user_id),
    CONSTRAINT fk_doctor_specialty
        FOREIGN KEY (specialty_id) REFERENCES Specialty(specialty_id)
    CONSTRAINT fk_doctor_schedule
        FOREIGN KEY (schedule_id) REFERENCES Schedule(schedule_id)
);

-- ============================================
-- DOMINIO: INFRAESTRUCTURA HOSPITALARIA
-- ============================================

CREATE TABLE Medical_Office (
    office_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    floor VARCHAR(20),
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE Speciality_Office (
    specialty_id INTEGER NOT NULL,
    office_id INTEGER NOT NULL,
    PRIMARY KEY (specialty_id, office_id),
    CONSTRAINT fk_so_specialty FOREIGN KEY (specialty_id) REFERENCES Specialty(specialty_id),
    CONSTRAINT fk_so_office FOREIGN KEY (office_id) REFERENCES Medical_Office(office_id)
);


-- ============================================
-- DOMINIO: PACIENTES
-- ============================================

CREATE TABLE Guardian (
    guardian_id SERIAL PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    kinship VARCHAR(50),
    document_number VARCHAR(50) NOT NULL
);

CREATE TABLE Patient (
    patient_id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER NOT NULL UNIQUE,
    guardian_id INTEGER,
    CONSTRAINT fk_patient_user
        FOREIGN KEY (user_id) REFERENCES User(user_id),
    CONSTRAINT fk_patient_guardian
        FOREIGN KEY (guardian_id) REFERENCES Guardian(guardian_id)
);



-- ============================================
-- DOMINIO: ATENCIÓN MÉDICA
-- ============================================

CREATE TABLE Medical_Appointment (
    appointment_id SERIAL PRIMARY KEY,
    appointment_date DATE NOT NULL,
    status ENUM('Scheduled', 'Completed', 'Cancelled') NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    patient_id INTEGER NOT NULL,
    doctor_id INTEGER NOT NULL,
    office_id INTEGER NOT NULL,
    CONSTRAINT fk_appointment_patient
        FOREIGN KEY (patient_id) REFERENCES Patient(patient_id),
    CONSTRAINT fk_appointment_doctor
        FOREIGN KEY (doctor_id) REFERENCES Doctor(doctor_id),
    CONSTRAINT fk_appointment_office
        FOREIGN KEY (office_id) REFERENCES Medical_Office(office_id)
);

CREATE TABLE Medical_History (
    medical_history_id SERIAL PRIMARY KEY,
    symptoms TEXT,
    diagnosis TEXT,
    treatment_plan TEXT,
    notes TEXT,
    consultation_date DATE NOT NULL,
    appointment_id INTEGER NOT NULL UNIQUE, 
    CONSTRAINT fk_history_appointment
        FOREIGN KEY (appointment_id) REFERENCES Medical_Appointment(appointment_id)
);

CREATE TABLE Medicine (
    medicine_id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    presentation VARCHAR(100),
    concentration VARCHAR(50),
    active_ingredient VARCHAR(150)
);


CREATE TABLE Prescription (
    medical_history_id INTEGER NOT NULL,
    medicine_id INTEGER NOT NULL,
    dose VARCHAR(50),
    frequency VARCHAR(50),
    duration VARCHAR(50),
    PRIMARY KEY (medical_history_id, medicine_id),
    CONSTRAINT fk_hm_history
        FOREIGN KEY (medical_history_id) REFERENCES Medical_History(medical_history_id),
    CONSTRAINT fk_hm_medicine
        FOREIGN KEY (medicine_id) REFERENCES Medicine(medicine_id)
);

-- ============================================
-- DOMINIO: AUDITORÍA
-- ============================================

CREATE TABLE Audit_Log (
    audit_id SERIAL PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    operation_type ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL, 
    old_value JSONB,
    new_value JSONB,
    performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER,
    CONSTRAINT fk_audit_user
        FOREIGN KEY (user_id) REFERENCES User(user_id)
);
