// =====================================================================
// HEALTHFLOW - DBML MODEL (PostgreSQL 12+)
// =====================================================================

Enum day_name_type {
  Monday
  Tuesday
  Wednesday
  Thursday
  Friday
  Saturday
  Sunday
}

Enum appointment_status {
  Scheduled
  Completed
  Cancelled
}

Enum operation_type {
  INSERT
  UPDATE
  DELETE
}

// ============================================
// DOMINIO: USUARIOS Y ACCESO
// ============================================

Table Roles {
  role_id int [pk, increment, note: 'Identificador único del rol']
  name varchar(50) [not null, unique, note: 'ej: admin, doctor, receptionist, patient']
  
  Note: 'Catálogo de roles del sistema'
}

Table Users {
  user_id int [pk, increment]
  username varchar(100) [not null, unique]
  password varchar(255) [not null, note: 'Cifrada con bcrypt']
  email varchar(150) [not null, unique]
  active boolean [default: true, note: 'Eliminación lógica']
  create_date timestamp [default: `CURRENT_TIMESTAMP`]
  role_id int [ref: > Roles.role_id, not null]
  
  Note: 'Usuarios del sistema con credenciales de acceso'
}

Table User_Phones {
  phone_id int [pk, increment]
  user_id int [ref: > Users.user_id, not null]
  phone_number varchar(20) [not null]
  phone_type varchar(20) [note: 'móvil, fijo, trabajo']
  is_primary boolean [default: false]
  
  Note: 'Teléfonos asociados a un usuario (1:N)'
}

Table Document_Types {
  doc_type_id int [pk, increment]
  name varchar(50) [not null, unique, note: 'CC, CE, Passport, TI']
  
  Note: 'Catálogo de tipos de documento'
}

Table User_Documents {
  user_doc_id int [pk, increment]
  user_id int [ref: > Users.user_id, not null]
  doc_type_id int [ref: > Document_Types.doc_type_id, not null]
  document_number varchar(50) [not null]
  
  Note: 'Documentos de identidad de los usuarios'
}

// ============================================
// DOMINIO: PERSONAL CLÍNICO
// ============================================

Table Schedules {
  schedule_id int [pk, increment]
  day_of_week day_name_type [not null]
  start_time time [not null]
  end_time time [not null]
  
  Note: 'Horarios base de disponibilidad'
}

Table Departments {
  department_id int [pk, increment]
  name varchar(100) [not null]
  location varchar(150)
  
  Note: 'Áreas del hospital (Cardiología, Pediatría...)'
}

Table Specialties {
  specialty_id int [pk, increment]
  name varchar(100) [not null]
  description text
  department_id int [ref: > Departments.department_id, not null]
  
  Note: 'Especialidades médicas por departamento'
}

Table Doctors {
  doctor_id int [pk, increment]
  first_name varchar(100) [not null]
  last_name varchar(100) [not null]
  license_number varchar(50) [not null, unique]
  user_id int [ref: - Users.user_id, not null, unique, note: 'Relación 1:1']
  schedule_id int [ref: > Schedules.schedule_id, not null]
  specialty_id int [ref: > Specialties.specialty_id, not null]
  
  Note: 'Perfil profesional de los médicos'
}

// ============================================
// DOMINIO: INFRAESTRUCTURA HOSPITALARIA
// ============================================

Table Medical_Offices {
  office_id int [pk, increment]
  name varchar(100) [not null]
  floor varchar(20)
  active boolean [default: true]
  
  Note: 'Consultorios o salas físicas'
}

Table Speciality_Offices {
  specialty_id int [ref: > Specialties.specialty_id]
  office_id int [ref: > Medical_Offices.office_id]
  
  indexes {
    (specialty_id, office_id) [pk]
  }
  
  Note: 'Tabla puente N:M (Especialidades que atiende cada consultorio)'
}

// ============================================
// DOMINIO: PACIENTES
// ============================================

Table Guardians {
  guardian_id int [pk, increment]
  full_name varchar(150) [not null]
  kinship varchar(50) [note: 'Padre, madre, tutor']
  document_number varchar(50) [not null]
  
  Note: 'Acudientes o responsables legales'
}

Table Patients {
  patient_id int [pk, increment]
  first_name varchar(100) [not null]
  last_name varchar(100) [not null]
  date_of_birth date [not null]
  gender varchar(20)
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  user_id int [ref: - Users.user_id, not null, unique, note: 'Relación 1:1']
  guardian_id int [ref: > Guardians.guardian_id]
  
  Note: 'Expediente de pacientes'
}

// ============================================
// DOMINIO: ATENCIÓN MÉDICA
// ============================================

Table Medical_Appointments {
  appointment_id int [pk, increment]
  appointment_date date [not null]
  status appointment_status [not null, default: 'Scheduled']
  reason text
  created_at timestamp [default: `CURRENT_TIMESTAMP`]
  patient_id int [ref: > Patients.patient_id, not null]
  doctor_id int [ref: > Doctors.doctor_id, not null]
  office_id int [ref: > Medical_Offices.office_id, not null]
  
  Note: 'Citas médicas agendadas'
}

Table Medical_Histories {
  medical_history_id int [pk, increment]
  symptoms text
  diagnosis text
  treatment_plan text
  notes text
  consultation_date date [not null]
  appointment_id int [ref: - Medical_Appointments.appointment_id, not null, unique, note: 'Relación 1:1 con la cita']
  
  Note: 'Historia clínica resultante de una cita'
}

Table Medicines {
  medicine_id int [pk, increment]
  name varchar(150) [not null]
  presentation varchar(100)
  concentration varchar(50)
  active_ingredient varchar(150)
  
  Note: 'Catálogo de farmacia'
}

Table Prescriptions {
  medical_history_id int [ref: > Medical_Histories.medical_history_id]
  medicine_id int [ref: > Medicines.medicine_id]
  dose varchar(50)
  frequency varchar(50)
  duration varchar(50)
  
  indexes {
    (medical_history_id, medicine_id) [pk]
  }
  
  Note: 'Fórmula médica / Prescripción de la consulta (N:M)'
}


// ============================================
// DOMINIO: AUDITORÍA
// ============================================

Table Audit_Logs {
  audit_id int [pk, increment]
  table_name varchar(100) [not null]
  operation_type operation_type [not null]
  old_value jsonb
  new_value jsonb
  performed_at timestamp [default: `CURRENT_TIMESTAMP`]
  ip_address varchar(45)
  user_id int [ref: > Users.user_id, note: 'Puede ser nulo si fue el sistema']
  
  Note: 'Bitácora de movimientos transaccionales'
}