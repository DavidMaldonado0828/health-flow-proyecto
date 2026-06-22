-- =============================================================================
-- SISTEMA DE AUDITORÍA AUTOMÁTICA - HEALTHFLOW
-- Descripción: Implementación de triggers para registro de operaciones CRUD.
-- =============================================================================

-- 1. Crear el tipo ENUM para las operaciones (si no existe)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'operation_type') THEN
        CREATE TYPE operation_type AS ENUM ('INSERT', 'UPDATE', 'DELETE');
    END IF;
END
$$;

-- 2. Función de Auditoría (Captura el usuario de la sesión y la operación)
CREATE OR REPLACE FUNCTION fn_audit_log() 
RETURNS TRIGGER AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    -- Capturar el ID de usuario desde la sesión de la aplicación
    BEGIN
        v_user_id := NULLIF(current_setting('audit.user_id', true), '')::INTEGER;
    EXCEPTION WHEN others THEN
        v_user_id := NULL;
    END;

    -- Lógica de registro según la operación
    IF TG_OP = 'INSERT' THEN
        INSERT INTO Audit_Logs(table_name, operation_type, new_value, performed_at, user_id)
        VALUES (TG_TABLE_NAME::TEXT, TG_OP::operation_type, to_jsonb(NEW), CURRENT_TIMESTAMP, v_user_id);
        RETURN NEW;
        
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO Audit_Logs(table_name, operation_type, old_value, new_value, performed_at, user_id)
        VALUES (TG_TABLE_NAME::TEXT, TG_OP::operation_type, to_jsonb(OLD), to_jsonb(NEW), CURRENT_TIMESTAMP, v_user_id);
        RETURN NEW;
        
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO Audit_Logs(table_name, operation_type, old_value, performed_at, user_id)
        VALUES (TG_TABLE_NAME::TEXT, TG_OP::operation_type, to_jsonb(OLD), CURRENT_TIMESTAMP, v_user_id);
        RETURN OLD;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 3. Asignación de Triggers por Tabla
-- Estos triggers garantizan la auditoría automática sin tocar el código de la API

DROP TRIGGER IF EXISTS trg_audit_users ON Users;
CREATE TRIGGER trg_audit_users AFTER INSERT OR UPDATE OR DELETE ON Users FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_patients ON Patients;
CREATE TRIGGER trg_audit_patients AFTER INSERT OR UPDATE OR DELETE ON Patients FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_doctors ON Doctors;
CREATE TRIGGER trg_audit_doctors AFTER INSERT OR UPDATE OR DELETE ON Doctors FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_medical_appointments ON Medical_Appointments;
CREATE TRIGGER trg_audit_medical_appointments AFTER INSERT OR UPDATE OR DELETE ON Medical_Appointments FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_medical_histories ON Medical_Histories;
CREATE TRIGGER trg_audit_medical_histories AFTER INSERT OR UPDATE OR DELETE ON Medical_Histories FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

DROP TRIGGER IF EXISTS trg_audit_prescriptions ON Prescriptions;
CREATE TRIGGER trg_audit_prescriptions AFTER INSERT OR UPDATE OR DELETE ON Prescriptions FOR EACH ROW EXECUTE FUNCTION fn_audit_log();

-- =============================================================================
-- TRIGGERS ADICIONALES - DOMINIO INTEGRACIÓN COMPLETADA
-- =============================================================================

-- Medical_Offices
DROP TRIGGER IF EXISTS trg_audit_medical_offices ON Medical_Offices;
CREATE TRIGGER trg_audit_medical_offices
AFTER INSERT OR UPDATE OR DELETE ON Medical_Offices
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();

-- Speciality_Offices
DROP TRIGGER IF EXISTS trg_audit_speciality_offices ON Speciality_Offices;
CREATE TRIGGER trg_audit_speciality_offices
AFTER INSERT OR UPDATE OR DELETE ON Speciality_Offices
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();