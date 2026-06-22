-- =====================================================
-- SCRIPT DML - HEALTHFLOW
-- =====================================================
BEGIN;

-- Borrar datos en orden inverso para no romper llaves foráneas
TRUNCATE TABLE Audit_Logs, Prescriptions, Medicines, Medical_Histories, 
               Medical_Appointments, Speciality_Offices, Patients, Guardians, 
               Medical_Offices, Doctors, Schedules, Specialties, Departments, 
               User_Documents, User_Phones, Users, Document_Types, Roles 
RESTART IDENTITY CASCADE; -- IMPORTANTE: Esto reinicia los IDs seriales a 1
BEGIN;

-- 1. ROLES (3 registros)
INSERT INTO Roles (name) VALUES
('Admin'),
('Doctor'),
('Patient');

-- 2. DOCUMENT_TYPES (4 registros)
INSERT INTO Document_Types (name) VALUES
('Cedula de Ciudadania'),
('Tarjeta de Identidad'),
('Cedula de Extranjeria'),
('Pasaporte');

-- 3. USERS (15 registros)
INSERT INTO Users (
    username,
    password,
    email,
    role_id
) VALUES
-- Admins
('admin1', 'Admin_2026', 'admin1@healthflow.com',1),
('admin2', 'Root_99#', 'admin2@healthflow.com',1),
('admin3', 'SuperSecret!', 'admin3@healthflow.com',1),
('admin4', 'Admin_Pass1', 'admin4@healthflow.com',1),
('admin5', 'Key_Master26', 'admin5@healthflow.com',1),

-- Doctors
('doctor1', 'Med_Juan123', 'doctor1@healthflow.com',2),
('doctor2', 'Medico_2026', 'doctor2@healthflow.com',2),
('doctor3', 'Salud_Medica', 'doctor3@healthflow.com',2),
('doctor4', 'Doc_Life88', 'doctor4@healthflow.com',2),
('doctor5', 'Cura_Facil!', 'doctor5@healthflow.com',2),

-- Patients
('patient1', 'Paciente_1', 'p1@gmail.com',3),
('patient2', 'Salud_2026', 'p2@gmail.com',3),
('patient3', 'User_Pass123', 'p3@gmail.com',3),
('patient4', 'Gato_Negro', 'p4@gmail.com',3),
('patient5', 'Seguro_01', 'p5@gmail.com',3);


INSERT INTO User_Phones (
    user_id,
    phone_number,
    phone_type,
    is_primary
) VALUES
(1, '3001111111', 'Mobile', TRUE),
(2, '3002222222', 'Mobile', TRUE),
(3, '3003333333', 'Mobile', TRUE),
(4, '3004444444', 'Mobile', TRUE),
(5, '3005555555', 'Mobile', TRUE),
(6, '3101111111', 'Mobile', TRUE),
(7, '3102222222', 'Mobile', TRUE),
(8, '3103333333', 'Mobile', TRUE),
(9, '3104444444', 'Mobile', TRUE),
(10, '3105555555', 'Mobile', TRUE),
(11, '3201111111', 'Mobile', TRUE),
(12, '3202222222', 'Mobile', TRUE),
(13, '3203333333', 'Mobile', TRUE),
(14, '3204444444', 'Mobile', TRUE),
(15, '3205555555', 'Mobile', TRUE);


INSERT INTO User_Documents (user_id, doc_type_id, document_number)
VALUES 
(1, 1, '1002456789'),
(1, 2, 'CE-998877'),
(2, 1, '1009876543'),
(3, 3, 'PAS-AB123456'),
(4, 1, '1011121314'),
(4, 2, 'CE-445566'),
(5, 3, 'PAS-ZX987654'),
(6, 1, '1020304050'),
(7, 2, 'CE-778899'),
(8, 1, '1098765432');

-- 4. DEPARTMENTS (8 registros)
INSERT INTO Departments (name, location) VALUES
('Medicina Interna', 'Piso 1'),
('Pediatria', 'Piso 1'),
('Cirugia', 'Piso 2'),
('Ginecologia', 'Piso 2'),
('Cardiologia', 'Piso 3'),
('Ortopedia', 'Piso 3'),
('Dermatologia', 'Piso 4'),
('Psiquiatria', 'Piso 4');

-- 5. SPECIALTIES (12 registros)
INSERT INTO Specialties (name, description, department_id) VALUES
('Medicina General', 'General', 1),
('Medicina Interna', 'Interna', 1),
('Pediatria', 'Ninos', 2),
('Neonatologia', 'Bebes', 2),
('Cirugia General', 'Cirugia', 3),
('Cirugia Plastica', 'Estetica', 3),
('Ginecologia', 'Mujer', 4),
('Obstetricia', 'Parto', 4),
('Cardiologia', 'Corazon', 5),
('Ortopedia', 'Huesos', 6),
('Dermatologia', 'Piel', 7),
('Psiquiatria', 'Mental', 8);

-- 6. SCHEDULES (10 registros)
INSERT INTO Schedules (day_of_week, start_time, end_time) VALUES
('Monday', '08:00', '12:00'),
('Monday', '14:00', '18:00'),
('Tuesday', '08:00', '12:00'),
('Tuesday', '14:00', '18:00'),
('Wednesday', '08:00', '12:00'),
('Wednesday', '14:00', '18:00'),
('Thursday', '08:00', '12:00'),
('Friday', '08:00', '12:00'),
('Friday', '14:00', '18:00'),
('Saturday', '09:00', '13:00');

-- 7. DOCTORS (10 registros)
INSERT INTO Doctors (
    first_name,
    last_name,
    license_number,
    user_id,
    schedule_id,
    specialty_id
) VALUES
('Juan', 'Garcia', 'LIC-001', 6, 1, 1),
('Maria', 'Lopez', 'LIC-002', 7, 2, 9),
('Carlos', 'Rodriguez', 'LIC-003', 8, 3, 5),
('Ana', 'Martinez', 'LIC-004', 9, 4, 7),
('Pedro', 'Sanchez', 'LIC-005', 10, 5, 10),
('Laura', 'Fernandez', 'LIC-006', 1, 6, 3),
('Diego', 'Perez', 'LIC-007', 2, 7, 2),
('Sandra', 'Gonzalez', 'LIC-008', 3, 8, 6),
('Roberto', 'Silva', 'LIC-009', 4, 9, 11),
('Daniela', 'Torres', 'LIC-010', 5, 10, 12);

-- 8. MEDICAL_OFFICES (12 registros)
INSERT INTO Medical_Offices (name, floor, active) VALUES
('C1', '1', TRUE),
('C2', '1', TRUE),
('C3', '1', TRUE),
('C4', '2', TRUE),
('C5', '2', TRUE),
('C6', '2', TRUE),
('C7', '3', TRUE),
('C8', '3', TRUE),
('C9', '3', FALSE),
('C10', '4', TRUE),
('C11', '4', TRUE),
('C12', '4', TRUE);

INSERT INTO Guardians (full_name, kinship, document_number) VALUES
('Carlos Andres Perez', 'Padre', '1012345678'),
('Maria Fernanda Lopez', 'Madre', '1023456789'),
('Jorge Luis Ramirez', 'Tutor', '1034567890'),
('Ana Sofia Gomez', 'Madre', '1045678901'),
('Pedro Pablo Martinez', 'Padre', '1056789012'),
('Laura Daniela Torres', 'Madre', '1067890123'),
('Luis Eduardo Vargas', 'Tio', '1078901234'),
('Claudia Patricia Rojas', 'Abuela', '1089012345'),
('Miguel Angel Suarez', 'Padre', '1090123456'),
('Diana Marcela Fidel', 'Madre', '1001122334');

-- 9. PATIENTS (10 registros)
INSERT INTO Patients (
    first_name,
    last_name,
    date_of_birth,
    gender,
    user_id,
    guardian_id
) VALUES
('P1', 'A', '1995-05-15', 'M', 11, 1),
('P2', 'B', '1998-08-22', 'F', 12, Null),
('P3', 'C', '2005-03-10', 'M', 13, Null),
('P4', 'D', '1990-12-30', 'F', 14, 4),
('P5', 'E', '2010-01-20', 'M', 15, Null),
('P6', 'F', '1985-07-14', 'F', 1, Null),
('P7', 'G', '2000-11-05', 'M', 2, 5),
('P8', 'H', '1988-06-25', 'F', 3, Null),
('P9', 'I', '1992-09-18', 'M', 4, 6),
('P10', 'J', '2003-02-28', 'F', 5, Null);

INSERT INTO Speciality_Offices (specialty_id, office_id)
VALUES
(1, 1),
(1, 2),
(2, 1),
(2, 3),
(3, 2),
(3, 4),
(4, 1),
(4, 4),
(5, 3),
(5, 4);

-- 10. MEDICAL_APPOINTMENTS (15 registros)
INSERT INTO Medical_Appointments (
    appointment_date,
    status,
    reason,
    patient_id,
    doctor_id,
    office_id
) VALUES
('2026-07-10', 'Scheduled', 'R1', 1, 1, 1),
('2026-07-11', 'Scheduled', 'R2', 2, 2, 2),
('2026-07-12', 'Scheduled', 'R3', 3, 3, 3),
('2026-07-13', 'Scheduled', 'R4', 4, 4, 4),
('2026-07-14', 'Scheduled', 'R5', 5, 5, 5),
('2026-07-15', 'Completed', 'R6', 6, 6, 6),
('2026-07-16', 'Completed', 'R7', 7, 7, 7),
('2026-07-17', 'Completed', 'R8', 8, 8, 8),
('2026-07-18', 'Completed', 'R9', 9, 9, 9),
('2026-07-19', 'Cancelled', 'R10', 10, 10, 10),
('2026-07-20', 'Scheduled', 'R11', 1, 1, 1),
('2026-07-21', 'Scheduled', 'R12', 2, 2, 2),
('2026-07-22', 'Scheduled', 'R13', 3, 3, 3),
('2026-07-23', 'Scheduled', 'R14', 4, 4, 4),
('2026-07-24', 'Scheduled', 'R15', 5, 5, 5);


INSERT INTO Medical_Histories 
(symptoms, diagnosis, treatment_plan, notes, consultation_date, appointment_id)
VALUES
('Dolor de cabeza y fiebre leve', 'Gripe común', 'Reposo, líquidos y acetaminofén', 'Paciente estable', '2026-06-10', 1),

('Dolor abdominal', 'Gastritis', 'Dieta blanda y omeprazol por 7 días', 'Evitar irritantes', '2026-06-11', 2),

('Tos seca persistente', 'Bronquitis leve', 'Antibiótico y jarabe expectorante', 'Control en 5 días', '2026-06-12', 3),

('Dolor lumbar', 'Lumbalgia muscular', 'Analgésicos y fisioterapia', 'Postura inadecuada', '2026-06-13', 4),

('Fiebre alta', 'Infección viral', 'Hidratación y antipiréticos', 'Observación en casa', '2026-06-14', 5);


INSERT INTO Medicines (name, presentation, concentration, active_ingredient)
VALUES
('Acetaminofén', 'Tableta', '500 mg', 'Paracetamol'),
('Ibuprofeno', 'Tableta', '400 mg', 'Ibuprofeno'),
('Amoxicilina', 'Cápsula', '500 mg', 'Amoxicilina'),
('Loratadina', 'Tableta', '10 mg', 'Loratadina'),
('Omeprazol', 'Cápsula', '20 mg', 'Omeprazol'),
('Salbutamol', 'Inhalador', '100 mcg/dosis', 'Salbutamol'),
('Azitromicina', 'Tableta', '500 mg', 'Azitromicina'),
('Diclofenaco', 'Gel', '1%', 'Diclofenaco sódico'),
('Metformina', 'Tableta', '850 mg', 'Metformina'),
('Dexametasona', 'Ampolla', '4 mg/ml', 'Dexametasona');

INSERT INTO Prescriptions (medical_history_id, medicine_id, dose, frequency, duration)
VALUES
(1, 1, '1 tableta', 'cada 8 horas', '5 días'),
(1, 4, '1 tableta', 'cada 24 horas', '3 días'),
(2, 5, '1 cápsula', 'cada 12 horas', '7 días'),
(3, 3, '1 cápsula', 'cada 8 horas', '10 días'),
(3, 7, '1 tableta', 'cada 24 horas', '3 días'),
(4, 2, '1 tableta', 'cada 12 horas', '5 días'),
(5, 1, '1 tableta', 'cada 6 horas', '3 días'),
(5, 10, '1 ampolla', 'dosis única diaria', '2 días'),
(2, 2, '1 tableta', 'cada 8 horas', '5 días'),
(4, 8, 'Aplicar capa delgada', 'cada 12 horas', '7 días');

INSERT INTO Audit_Logs 
(table_name, operation_type, old_value, new_value, ip_address, user_id)
VALUES
('Users', 'INSERT', NULL, '{"user_id":1,"name":"Juan Perez"}', '192.168.1.10', 1),

('Users', 'UPDATE', '{"name":"Juan Perez"}', '{"name":"Juan P. Gomez"}', '192.168.1.11', 1),

('Medical_Appointments', 'INSERT', NULL, '{"appointment_id":5,"date":"2026-06-20"}', '192.168.1.12', 2),

('Medical_Histories', 'INSERT', NULL, '{"diagnosis":"Gripe"}', '192.168.1.13', 2),

('Medicines', 'DELETE', '{"medicine_id":10,"name":"X"}', NULL, '192.168.1.14', 3),

('Prescriptions', 'INSERT', NULL, '{"dose":"1 tableta","frequency":"cada 8h"}', '192.168.1.15', 1),

('Users', 'DELETE', '{"user_id":4}', NULL, '192.168.1.16', 2),

('Medical_Histories', 'UPDATE', '{"diagnosis":"Gripe"}', '{"diagnosis":"Gripe severa"}', '192.168.1.17', 1),

('Medicines', 'INSERT', NULL, '{"name":"Paracetamol"}', '192.168.1.18', 3),

('Users', 'UPDATE', '{"email":"old@mail.com"}', '{"email":"new@mail.com"}', '192.168.1.19', 1);

COMMIT;