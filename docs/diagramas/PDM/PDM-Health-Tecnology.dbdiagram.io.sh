// =====================================================================
// 1. MÓDULO DE USUARIOS, SEGURIDAD Y COMPLEMENTOS
// =====================================================================

Table Roles {
  id_role int [pk, increment]
  name varchar(50) [not null, unique] // 'Doctor', 'Patient', 'Admin'
  description text
}

Table Users {
  id_user int [pk, increment]
  username varchar(100) [not null, unique]
  first_name varchar(100) [not null]
  last_name varchar(100) [not null]
  email varchar(150) [not null, unique]
  password_hash varchar(255) [not null]
  id_role int [ref: > Roles.id_role, not null]
  created_at timestamp [default: `now()`, not null]
}

Table User_Phones {
  id_phone int [pk, increment]
  id_user int [ref: > Users.id_user, not null]
  phone_number varchar(20) [not null]
}

Table User_Documents {
  id_document int [pk, increment]
  id_user int [ref: > Users.id_user, not null]
  document_type varchar(30) [not null] // 'CC', 'CE', 'Passport'
  document_number varchar(50) [not null, unique]
}

Table Acudiente {
  id_acudiente int [pk, increment]
  first_name varchar(100) [not null]
  last_name varchar(100) [not null]
  phone varchar(20) [not null]
  email varchar(150)
  relationship varchar(50) [not null]
}

Table Patient {
  id_patient int [pk, increment]
  id_user int [ref: > Users.id_user, not null, unique]
  id_acudiente int [ref: > Acudiente.id_acudiente]
  birth_date date [not null]
  blood_type varchar(5)
  address text
}

Table Audit_Log {
  id_log int [pk, increment]
  id_user int [ref: > Users.id_user, not null]
  table_name varchar(100) [not null]
  operation varchar(50) [not null] // 'INSERT', 'UPDATE', 'DELETE'
  old_values jsonb
  new_values jsonb
  executed_at timestamp [default: `now()`, not null]
}

// =====================================================================
// 2. MÓDULO DE INFRAESTRUCTURA HOSPITALARIA Y ESPECIALIDADES
// =====================================================================

Table Departament {
  id_departament int [pk, increment]
  name varchar(100) [not null]
  description text
}

Table Specialty {
  id_specialty int [pk, increment]
  name varchar(100) [not null]
  id_departament int [ref: > Departament.id_departament, not null]
}

Table Medical_Office {
  id_office int [pk, increment]
  office_number varchar(50) [not null]
  floor smallint
  is_available boolean [default: true, not null]
}

// TABLA INTERMEDIA: Relación Muchos a Muchos entre Oficinas y Especialidades
Table Office_Specialties {
  id_office int [ref: > Medical_Office.id_office, pk]
  id_specialty int [ref: > Specialty.id_specialty, pk]
  assigned_at timestamp [default: `now()`]
}

// =====================================================================
// 3. MÓDULO DE MÉDICOS Y HORARIOS
// =====================================================================

Table Doctor {
  id_doctor int [pk, increment]
  id_user int [ref: > Users.id_user, not null, unique]
  id_specialty int [ref: > Specialty.id_specialty, not null]
  license_number varchar(50) [not null, unique]
}

Table Schedule {
  id_schedule int [pk, increment]
  id_doctor int [ref: > Doctor.id_doctor, not null]
  day varchar(20) [not null] // 'Monday', 'Tuesday', etc.
  start_time time [not null]
  end_time time [not null]
}

// =====================================================================
// 4. MÓDULO DE CITAS, HISTORIAL CLÍNICO Y TRATAMIENTOS
// =====================================================================

Table Medical_Appointment {
  id_appointment int [pk, increment]
  id_patient int [ref: > Patient.id_patient, not null]
  id_doctor int [ref: > Doctor.id_doctor, not null]
  id_office int [ref: > Medical_Office.id_office, not null]
  date_time timestamp [not null]
  status varchar(50) [default: 'Scheduled', not null] // 'Scheduled', 'Completed', 'Cancelled'
  reason text
}

Table Medical_History {
  id_history int [pk, increment]
  id_appointment int [ref: - Medical_Appointment.id_appointment, not null, unique] // Relación 1:1 estricta
  diagnosis text [not null]
  treatment text
  general_notes text
  date_created timestamp [default: `now()`, not null]
}

Table Medicine {
  id_medicine int [pk, increment]
  name varchar(150) [not null]
  active_ingredient varchar(150)
  dosage_form varchar(50) [not null]
  stock int [default: 0, not null]
}

// TABLA INTERMEDIA: Receta / Prescripción (N:M)
Table History_Medicines_Prescriptions {
  id_history int [ref: > Medical_History.id_history, pk]
  id_medicine int [ref: > Medicine.id_medicine, pk]
  dosage varchar(100) [not null]
  frequency varchar(100) [not null]
  duration varchar(50) [not null]
}

Table AI_Analysis {
  id_analysis int [pk, increment]
  id_history int [ref: > Medical_History.id_history, not null]
  model_used varchar(100) [not null]
  suggestion text [not null]
  confidence numeric
  generated_at timestamp [default: `now()`, not null]
}
