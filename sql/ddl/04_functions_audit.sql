
--audit history function
CREATE OR REPLACE FUNCTION fn_get_audit_history(

    p_table_name VARCHAR,
    p_pk_column VARCHAR,
    p_record_id INTEGER
)
RETURNS TABLE (
    audit_id INTEGER,
    operation_type VARCHAR,
    old_value JSONB,
    new_value JSONB,
    performed_at TIMESTAMP,
    user_id INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.audit_id,
        a.operation_type::VARCHAR,
        a.old_value,
        a.new_value,
        a.performed_at,
        a.user_id
    FROM Audit_Logs a
    WHERE a.table_name = p_table_name
      AND (
            (a.new_value ->> p_pk_column) = p_record_id::TEXT
         OR (a.old_value ->> p_pk_column) = p_record_id::TEXT
      )
    ORDER BY a.performed_at ASC;
END;
$$ LANGUAGE plpgsql;

--activity summary function
CREATE OR REPLACE FUNCTION fn_audit_activity_summary(
    p_start_date TIMESTAMP,
    p_end_date   TIMESTAMP
)
RETURNS TABLE (
    table_name      VARCHAR,
    operation_type  VARCHAR,
    total_events    BIGINT,
    distinct_users  BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        a.table_name::VARCHAR,
        a.operation_type::VARCHAR,
        COUNT(*)                          AS total_events,
        COUNT(DISTINCT a.user_id)         AS distinct_users
    FROM Audit_Logs a
    WHERE a.performed_at BETWEEN p_start_date AND p_end_date
    GROUP BY a.table_name, a.operation_type
    ORDER BY total_events DESC;
END;
$$ LANGUAGE plpgsql;

