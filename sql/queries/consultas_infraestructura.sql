--Consulta 1 — Consultorios activos con sus especialidades (JOIN)

SELECT
    mo.office_id,
    mo.name        AS office_name,
    mo.floor,
    s.name         AS specialty_name
FROM Medical_Offices mo
JOIN Speciality_Offices so ON so.office_id = mo.office_id
JOIN Specialties s        ON s.specialty_id = so.specialty_id
WHERE mo.active = TRUE
ORDER BY mo.floor, mo.name;


--Consulta 2 — Cantidad de especialidades por consultorio (JOIN + agregación)

SELECT
    mo.office_id,
    mo.name             AS office_name,
    COUNT(so.specialty_id) AS total_specialties
FROM Medical_Offices mo
LEFT JOIN Speciality_Offices so ON so.office_id = mo.office_id
GROUP BY mo.office_id, mo.name
ORDER BY total_specialties DESC;


--Consulta 3 — Consultorios por departamento (JOIN de 4 tablas)

SELECT
    d.name      AS department_name,
    s.name      AS specialty_name,
    mo.name     AS office_name,
    mo.floor
FROM Departments d
JOIN Specialties s        ON s.department_id = d.department_id
JOIN Speciality_Offices so ON so.specialty_id = s.specialty_id
JOIN Medical_Offices mo    ON mo.office_id = so.office_id
ORDER BY d.name, s.name;



--Consulta 4 — Consultorios activos sin especialidad asignada (subconsulta NOT IN)

SELECT
    mo.office_id,
    mo.name,
    mo.floor
FROM Medical_Offices mo
WHERE mo.active = TRUE
  AND mo.office_id NOT IN (
        SELECT so.office_id FROM Speciality_Offices so
  );


--Consulta 5 — Carga de citas por consultorio (JOIN + agregación condicional)

SELECT
    mo.office_id,
    mo.name AS office_name,
    COUNT(ma.appointment_id) AS total_appointments,
    COUNT(*) FILTER (WHERE ma.status = 'Completed') AS completed_appointments,
    COUNT(*) FILTER (WHERE ma.status = 'Scheduled') AS scheduled_appointments
FROM Medical_Offices mo
LEFT JOIN Medical_Appointments ma ON ma.office_id = mo.office_id
GROUP BY mo.office_id, mo.name
ORDER BY total_appointments DESC;


--Consulta 6 — Especialidad con más consultorios (subconsulta correlacionada + escalar)

SELECT
    s.specialty_id,
    s.name,
    (SELECT COUNT(*) FROM Speciality_Offices so
        WHERE so.specialty_id = s.specialty_id) AS total_offices
FROM Specialties s
WHERE (SELECT COUNT(*) FROM Speciality_Offices so
        WHERE so.specialty_id = s.specialty_id) =
      (SELECT MAX(office_count) FROM (
            SELECT COUNT(*) AS office_count
            FROM Speciality_Offices
            GROUP BY specialty_id
        ) AS counts
      );


--Consulta 7 — Verificación de auditoría sobre el dominio (depende de la Parte 2)

SELECT
    audit_id,
    table_name,
    operation_type,
    old_value,
    new_value,
    performed_at,
    user_id
FROM Audit_Logs
WHERE table_name IN ('medical_offices', 'speciality_offices')
ORDER BY performed_at DESC
LIMIT 20;