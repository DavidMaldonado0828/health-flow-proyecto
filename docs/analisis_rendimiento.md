# 📊 Análisis de Rendimiento y Optimización — HealthFlow

> **Sistema:** HealthFlow - Sistema de Gestión Hospitalaria  
> **Motor:** PostgreSQL 12+  
> **Versión DDL:** 1.0

---

## 1. Estrategia General de Optimización

HealthFlow maneja datos críticos de salud con alta concurrencia: múltiples recepcionistas agendando citas, médicos consultando historias clínicas y pacientes registrándose simultáneamente. La estrategia de optimización se basa en tres pilares:

1. **Índices** — para acelerar búsquedas y JOINs frecuentes
2. **Constraints y tipos ENUM** — para validación en motor, no en aplicación
3. **Procedimientos almacenados** — para reducir round-trips entre app y BD

---

## 2. Índices Implementados

### 2.1 Búsquedas frecuentes por campos de negocio

```sql
CREATE INDEX idx_users_username    ON Users(username);
CREATE INDEX idx_patients_lastname ON Patients(last_name);
CREATE INDEX idx_doctors_license   ON Doctors(license_number);
```

| Índice | Justificación |
|---|---|
| `idx_users_username` | El login busca por `username` en cada autenticación — sin índice sería un `Seq Scan` sobre toda la tabla |
| `idx_patients_lastname` | Las búsquedas de pacientes se hacen por apellido desde recepción |
| `idx_doctors_license` | La validación de licencia única en registros masivos (`sp_insertar_doctores_masivo`) ejecuta esta búsqueda por cada doctor del lote |

### 2.2 Índice de rango en fechas de citas

```sql
CREATE INDEX idx_appointment_date ON Medical_Appointments(appointment_date);
```

**Impacto:** Las consultas de agenda diaria, semanal y los reportes mensuales filtran por `appointment_date`. Sin este índice, cada consulta de agenda haría un `Sequential Scan` sobre toda la tabla de citas, que crece diariamente.

**Ejemplo de consulta beneficiada:**
```sql
-- Citas del día de hoy para un médico
SELECT * FROM Medical_Appointments
WHERE appointment_date = CURRENT_DATE
  AND doctor_id = 5
  AND status = 'Scheduled';
-- Con índice: Index Scan (~5ms)
-- Sin índice: Seq Scan sobre miles de registros (~200ms+)
```

### 2.3 Índices en Foreign Keys (JOINs)

```sql
CREATE INDEX idx_fk_users_role          ON Users(role_id);
CREATE INDEX idx_fk_doctors_specialty   ON Doctors(specialty_id);
CREATE INDEX idx_fk_doctors_schedule    ON Doctors(schedule_id);
CREATE INDEX idx_fk_appointment_patient ON Medical_Appointments(patient_id);
CREATE INDEX idx_fk_appointment_doctor  ON Medical_Appointments(doctor_id);
CREATE INDEX idx_fk_appointment_office  ON Medical_Appointments(office_id);
CREATE INDEX idx_fk_history_appointment ON Medical_Histories(appointment_id);
CREATE INDEX idx_fk_so_specialty        ON Speciality_Offices(specialty_id);
CREATE INDEX idx_fk_so_office           ON Speciality_Offices(office_id);
```

**Justificación:** PostgreSQL no crea índices automáticamente en columnas FK (solo en PK). Sin estos índices, cada JOIN entre tablas relacionadas ejecuta un `Seq Scan` en la tabla hija.

**Caso crítico — consulta de historia clínica completa:**
```sql
SELECT 
    p.first_name, p.last_name,
    mh.diagnosis, mh.treatment_plan,
    d.first_name AS doctor
FROM Medical_Appointments ma
JOIN Patients p       ON p.patient_id   = ma.patient_id   -- usa idx_fk_appointment_patient
JOIN Doctors d        ON d.doctor_id    = ma.doctor_id    -- usa idx_fk_appointment_doctor
JOIN Medical_Histories mh ON mh.appointment_id = ma.appointment_id -- usa idx_fk_history_appointment
WHERE ma.appointment_date BETWEEN '2025-01-01' AND '2025-06-30';
```

### 2.4 Índices de Auditoría

```sql
CREATE INDEX idx_audit_table_name   ON Audit_Logs(table_name);
CREATE INDEX idx_audit_performed_at ON Audit_Logs(performed_at);
```

**Justificación:** La tabla `Audit_Logs` crece con cada operación CRUD del sistema. Los administradores filtran auditoría por tabla específica y por rango de fechas — sin índices, estas consultas degradan con el tiempo.

### 2.5 Índice de estado de consultorios

```sql
CREATE INDEX idx_offices_active ON Medical_Offices(active);
```

**Justificación:** Todas las consultas de disponibilidad de consultorios filtran por `active = TRUE`. Este índice parcial evita escanear consultorios fuera de servicio.

---

## 3. Decisiones de Diseño con Impacto en Rendimiento

### 3.1 Tipos ENUM en lugar de VARCHAR

```sql
CREATE TYPE appointment_status AS ENUM ('Scheduled', 'Completed', 'Cancelled');
CREATE TYPE operation_type     AS ENUM ('INSERT', 'UPDATE', 'DELETE');
CREATE TYPE day_name_type      AS ENUM ('Monday', 'Tuesday', ...);
```

**Ventaja:** Los ENUM se almacenan internamente como enteros, ocupan menos espacio que `VARCHAR` y la validación ocurre en el motor sin costo adicional en la aplicación.

### 3.2 JSONB para auditoría

```sql
old_value JSONB,
new_value JSONB
```

**Ventaja frente a TEXT:** JSONB se almacena en formato binario comprimido y soporta índices GIN para búsquedas dentro del JSON. Permite consultas como:
```sql
-- Buscar auditorías donde el email cambió
SELECT * FROM Audit_Logs
WHERE table_name = 'Users'
  AND old_value->>'email' != new_value->>'email';
```

### 3.3 Eliminación lógica (`active = FALSE`)

En lugar de `DELETE` físico en `Users` y `Medical_Offices`, el sistema desactiva registros.

**Ventajas de rendimiento:**
- Evita cascadas de FK que pueden bloquear tablas relacionadas
- Preserva integridad referencial con `Medical_Histories` y `Medical_Appointments`
- Permite recuperación de datos sin restaurar backups

### 3.4 Procedimientos almacenados para operaciones masivas

```sql
sp_insertar_doctores_masivo(p_doctores JSONB, p_usuario_auditoria INTEGER)
sp_insertar_horarios_masivo(p_horarios JSONB, p_usuario_auditoria INTEGER)
```

**Ventaja:** En lugar de N round-trips (1 INSERT por doctor desde la aplicación), se envía un solo JSONB con todos los registros. El motor procesa el lote en una transacción atómica, reduciendo latencia de red significativamente.

| Escenario | Round-trips app→BD | Transacciones |
|---|---|---|
| INSERT individual (10 doctores) | 10 | 10 |
| `sp_insertar_doctores_masivo` (10 doctores) | 1 | 1 |

---

## 4. Constraints como Optimización

```sql
-- Evita filas inválidas sin costo en la app
CONSTRAINT chk_schedule_times CHECK (end_time > start_time)

-- Garantiza integridad sin queries de validación adicionales
CONSTRAINT fk_doctor_user    FOREIGN KEY (user_id)    REFERENCES Users(user_id)
CONSTRAINT fk_doctor_schedule FOREIGN KEY (schedule_id) REFERENCES Schedules(schedule_id)
```

Las validaciones a nivel de BD son más eficientes que validarlas en Python porque se ejecutan dentro del motor sin latencia de red.

---

## 5. Resumen de Mejoras

| Optimización | Tipo | Impacto |
|---|---|---|
| 14 índices en FKs y campos de búsqueda | Índice B-Tree | Alto — elimina Seq Scans en JOINs |
| Tipos ENUM | Tipo de dato | Medio — menor almacenamiento y validación gratis |
| JSONB en auditoría | Tipo de dato | Medio — compresión y búsquedas internas |
| Eliminación lógica | Diseño | Alto — evita cascadas y preserva historial |
| Stored procedures masivos | Procedimiento | Alto — reduce round-trips de N a 1 |
| CHECK constraints en BD | Constraint | Medio — validación sin costo en aplicación |
