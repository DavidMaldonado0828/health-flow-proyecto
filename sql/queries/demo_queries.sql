-- -----------------------------------------------
-- 1. Consultorios activos con sus especialidades
--    JOIN N:M: Medical_Offices → Speciality_Offices → Specialties
-- -----------------------------------------------
SELECT
    mo.office_id,
    mo.name          AS office_name,
    mo.floor,
    s.name           AS specialty_name
FROM Medical_Offices mo
JOIN Speciality_Offices so ON so.office_id   = mo.office_id
JOIN Specialties        s  ON s.specialty_id  = so.specialty_id
WHERE mo.active = TRUE
ORDER BY
    NULLIF(regexp_replace(mo.floor, '[^0-9]', '', 'g'), '')::INT NULLS LAST,
    mo.name;


-- -----------------------------------------------
-- 2. Cantidad de especialidades por consultorio
--    LEFT JOIN para incluir consultorios sin especialidad aún asignada
-- -----------------------------------------------
SELECT
    mo.office_id,
    mo.name                    AS office_name,
    mo.active,
    COUNT(so.specialty_id)     AS total_specialties
FROM Medical_Offices mo
LEFT JOIN Speciality_Offices so ON so.office_id = mo.office_id
GROUP BY mo.office_id, mo.name, mo.active
ORDER BY total_specialties DESC, mo.name;

-- -----------------------------------------------
-- 3. Consultorios por departamento
--    JOIN de 4 tablas: Departments → Specialties →
--    Speciality_Offices → Medical_Offices
-- -----------------------------------------------
SELECT
    d.name      AS department_name,
    s.name      AS specialty_name,
    mo.name     AS office_name,
    mo.floor,
    mo.active
FROM Departments        d
JOIN Specialties        s  ON s.department_id  = d.department_id
JOIN Speciality_Offices so ON so.specialty_id  = s.specialty_id
JOIN Medical_Offices    mo ON mo.office_id      = so.office_id
ORDER BY d.name, s.name, mo.name;

-- -----------------------------------------------
-- 4. Consultorios activos SIN especialidad asignada
--    Subconsulta NOT IN: detecta infraestructura sin uso
-- -----------------------------------------------
SELECT
    mo.office_id,
    mo.name,
    mo.floor
FROM Medical_Offices mo
WHERE mo.active = TRUE
  AND mo.office_id NOT IN (
        SELECT office_id FROM Speciality_Offices
  )
ORDER BY mo.name;

-- -----------------------------------------------
-- 5. Carga de citas por consultorio
--    JOIN cruzado con Medical_Appointments (Dominio Atención Médica)
--    Demuestra la integración del dominio de infraestructura
--    con el resto del sistema
-- -----------------------------------------------
SELECT
    mo.office_id,
    mo.name                                                           AS office_name,
    COUNT(ma.appointment_id)                                          AS total_appointments,
    COUNT(*) FILTER (WHERE ma.status = 'Completed'::appointment_status) AS completed,
    COUNT(*) FILTER (WHERE ma.status = 'Scheduled'::appointment_status) AS scheduled,
    COUNT(*) FILTER (WHERE ma.status = 'Cancelled'::appointment_status) AS cancelled
FROM Medical_Offices mo
LEFT JOIN Medical_Appointments ma ON ma.office_id = mo.office_id
GROUP BY mo.office_id, mo.name
ORDER BY total_appointments DESC, mo.name;

-- -----------------------------------------------
-- 6. Especialidad con más consultorios asignados
--    Subconsulta correlacionada + subconsulta escalar de máximo
--    (retorna todas las especialidades que empatan en el máximo)
-- -----------------------------------------------
SELECT
    s.specialty_id,
    s.name                                                               AS specialty_name,
    d.name                                                               AS department_name,
    (SELECT COUNT(*)
     FROM Speciality_Offices so
     WHERE so.specialty_id = s.specialty_id)                            AS total_offices
FROM Specialties  s
JOIN Departments  d ON d.department_id = s.department_id
WHERE
    (SELECT COUNT(*) FROM Speciality_Offices so WHERE so.specialty_id = s.specialty_id) =
    (SELECT MAX(cnt) FROM (
         SELECT COUNT(*) AS cnt
         FROM Speciality_Offices
         GROUP BY specialty_id
     ) AS sub)
ORDER BY s.name;

-- -----------------------------------------------
-- 7. Verificación de auditoría del dominio
--    Requiere los triggers: trg_audit_medical_offices y
--    trg_audit_speciality_offices 
--    TG_TABLE_NAME retorna nombres en minúsculas en PostgreSQL
-- -----------------------------------------------
SELECT
    al.audit_id,
    al.table_name,
    al.operation_type,
    al.old_value,
    al.new_value,
    al.performed_at,
    al.ip_address,
    al.user_id
FROM Audit_Logs al
WHERE al.table_name IN ('medical_offices', 'speciality_offices')
ORDER BY al.performed_at DESC
LIMIT 20;
-- -----------------------------------------------
-- 8. Usuarios con mayor actividad en el sistema (Auditoría)
--    Análisis de carga de trabajo basada en el log de auditoría
-- -----------------------------------------------
SELECT user_id, COUNT(*) as total_operations, MAX(performed_at) as last_activity
FROM Audit_Logs WHERE user_id IS NOT NULL
GROUP BY user_id ORDER BY total_operations DESC LIMIT 5;
-- -----------------------------------------------
-- 9. Distribución de usuarios por Rol
--    Uso de funciones de ventana (SUM OVER) para calcular porcentajes
-- -----------------------------------------------
SELECT r.name as role_name, COUNT(u.user_id) as total_users,
       ROUND(100.0 * COUNT(u.user_id) / SUM(COUNT(u.user_id)) OVER(), 2) as percentage
FROM Roles r
LEFT JOIN Users u ON u.role_id = r.role_id
GROUP BY r.name ORDER BY total_users DESC;
-- -----------------------------------------------
-- 10. Médicos sin citas asignadas
--     Identificación de médicos inactivos mediante subconsulta
-- -----------------------------------------------
SELECT u.username, d.specialty_id
FROM Users u
JOIN Doctors d ON u.user_id = d.user_id
WHERE u.user_id NOT IN (SELECT DISTINCT doctor_id FROM Medical_Appointments WHERE doctor_id IS NOT NULL)
ORDER BY u.username;