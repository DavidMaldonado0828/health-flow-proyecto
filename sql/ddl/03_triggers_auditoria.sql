-- ============================================
-- FUNCIONES Y TRIGGERS DE AUDITORÍA
-- ============================================

CREATE OR REPLACE FUNCTION fn_audit_log() RETURNS trigger AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    -- Intentamos leer el user_id desde la variable de sesión 'audit.user_id'.
    -- La aplicación puede hacer: SELECT set_config('audit.user_id', '42', true);
    BEGIN
        v_user_id := NULLIF(current_setting('audit.user_id', true), '')::INTEGER;
    EXCEPTION WHEN others THEN
        v_user_id := NULL;
    END;

    IF TG_OP = 'INSERT' THEN
        INSERT INTO Audit_Log(table_name, operation_type, new_value, performed_at, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), CURRENT_TIMESTAMP, v_user_id);
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO Audit_Log(table_name, operation_type, old_value, new_value, performed_at, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), CURRENT_TIMESTAMP, v_user_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO Audit_Log(table_name, operation_type, old_value, performed_at, user_id)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), CURRENT_TIMESTAMP, v_user_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

 
-- Users
CREATE TRIGGER trg_audit_users
AFTER INSERT OR UPDATE OR DELETE ON Users
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();
 
-- Patient
CREATE TRIGGER trg_audit_patient
AFTER INSERT OR UPDATE OR DELETE ON Patient
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();
 
-- Doctor
CREATE TRIGGER trg_audit_doctor
AFTER INSERT OR UPDATE OR DELETE ON Doctor
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();
 
-- Medical_Appointment
CREATE TRIGGER trg_audit_appointment
AFTER INSERT OR UPDATE OR DELETE ON Medical_Appointment
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();
 
-- Medical_History
CREATE TRIGGER trg_audit_medical_history
AFTER INSERT OR UPDATE OR DELETE ON Medical_History
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();
 
-- Prescription
CREATE TRIGGER trg_audit_prescription
AFTER INSERT OR UPDATE OR DELETE ON Prescription
FOR EACH ROW
EXECUTE FUNCTION fn_audit_log();