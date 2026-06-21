/*DESCRIPCION:
Este procedimiento permite registrar multiples doctores
mediante un arreglo JSONB. Cada registro es validado antes
de ser insertado en la tabla doctor.

VALIDACIONES:
- Verifica que el usuario exista.
- Verifica que la especialidad exista.
- Verifica que la licencia no este duplicada.

MANEJO DE ERRORES:
- Controla errores de clave foranea.
- Controla errores de duplicidad.
- Genera excepciones personalizadas mediante
  RAISE EXCEPTION.
- Registra la operacion en la tabla audit_log.
OBJETIVO:
Facilitar la carga masiva de personal clinico
manteniendo la integridad de los datos.*/

CREATE OR REPLACE PROCEDURE sp_insertar_doctores_masivo(
    p_doctores JSONB,
    p_usuario_auditoria INTEGER
)
LANGUAGE plpgsql AS $$
DECLARE
    item JSONB;
BEGIN
    FOR item IN
        SELECT * FROM jsonb_array_elements(p_doctores)
    LOOP
        IF NOT EXISTS (
            SELECT 1
            FROM users
            WHERE id_user = (item->>'id_user')::INTEGER
        ) THEN
            RAISE EXCEPTION
            'Usuario % no existe',
            item->>'id_user';
        END IF;
        IF NOT EXISTS (
            SELECT 1
            FROM specialty
            WHERE id_specialty =
            (item->>'id_specialty')::INTEGER
        ) THEN
            RAISE EXCEPTION
            'Especialidad % no existe',
            item->>'id_specialty';
        END IF;
        IF EXISTS (
            SELECT 1
            FROM doctor
            WHERE license_number =
            item->>'license_number'
        ) THEN
            RAISE EXCEPTION
            'Licencia % duplicada',
            item->>'license_number';
        END IF;
        INSERT INTO doctor(
            id_user,
            id_specialty,
            license_number
        )
        VALUES(
            (item->>'id_user')::INTEGER,
            (item->>'id_specialty')::INTEGER,
            item->>'license_number'
        );
    END LOOP;
    INSERT INTO audit_log(
        id_user,
        table_name,
        operation,
        new_values,
        executed_at
    )
    VALUES(
        p_usuario_auditoria,
        'doctor',
        'MASS_INSERT',
        jsonb_build_object(
            'cantidad_registros',
            jsonb_array_length(p_doctores)
        ),
        NOW()
    );
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION
        'Existe una licencia duplicada';
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION
        'Existe una referencia inválida';
    WHEN OTHERS THEN
        RAISE EXCEPTION
        'Error en inserción masiva de doctores: %',
        SQLERRM;
END;
$$;
/*=========================================================
PROCEDIMIENTO: sp_insertar_horarios_masivo

DESCRIPCION:
Este procedimiento permite registrar multiples horarios
para los doctores utilizando un arreglo JSONB.

VALIDACIONES:
- Verifica que el doctor exista.
- Verifica que la hora inicial sea menor que la hora final.
- Garantiza la consistencia de los horarios registrados.

MANEJO DE ERRORES:
- Genera excepciones cuando los datos son invalidos.
- Captura errores inesperados mediante EXCEPTION.
- Evita inserciones incorrectas en la tabla schedule.
OBJETIVO:
Automatizar la asignacion de horarios para el personal
clinico de forma segura y eficiente.*/

CREATE OR REPLACE PROCEDURE sp_insertar_horarios_masivo(
    p_horarios JSONB,
    p_usuario_auditoria INTEGER
)
LANGUAGE plpgsql AS $$
DECLARE
    item JSONB;
BEGIN

    FOR item IN
        SELECT *
        FROM jsonb_array_elements(p_horarios)
    LOOP

        IF NOT EXISTS(
            SELECT 1
            FROM doctor
            WHERE id_doctor =
            (item->>'id_doctor')::INTEGER
        ) THEN
            RAISE EXCEPTION
            'Doctor inexistente';
        END IF;

        IF (
            item->>'start_time'
        )::TIME >= (
            item->>'end_time'
        )::TIME THEN
            RAISE EXCEPTION
            'Horario inválido';
        END IF;

        INSERT INTO schedule(
            id_doctor,
            day_of_week,
            start_time,
            end_time
        )
        VALUES(
            (item->>'id_doctor')::INTEGER,
            item->>'day_of_week',
            (item->>'start_time')::TIME,
            (item->>'end_time')::TIME
        );

    END LOOP;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION
        'Error registrando horarios: %',
        SQLERRM;

END;
$$;

/*=========================================================
PROCEDIMIENTO: sp_eliminar_doctor

DESCRIPCION:
Este procedimiento elimina un doctor del sistema
siempre que no posea citas medicas activas o pendientes.

VALIDACIONES:
- Verifica que el doctor exista.
- Verifica que el doctor no tenga citas pendientes.

MANEJO DE ERRORES:
- Controla errores de clave foranea.
- Evita eliminar registros relacionados.
- Genera mensajes de error claros para el usuario.

OBJETIVO:
Mantener la integridad referencial y evitar la perdida
de informacion relacionada con citas medicas.*/

CREATE OR REPLACE PROCEDURE sp_eliminar_doctor(
    p_id_doctor INTEGER,
    p_usuario_auditoria INTEGER
)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS(
        SELECT 1
        FROM doctor
        WHERE id_doctor = p_id_doctor
    ) THEN
        RAISE EXCEPTION
        'Doctor inexistente';
    END IF;

    IF EXISTS(
        SELECT 1
        FROM medical_appointment
        WHERE id_doctor = p_id_doctor
          AND appointment_status = 'PROGRAMADA'
    ) THEN
        RAISE EXCEPTION
        'El doctor tiene citas pendientes';
    END IF;

    DELETE FROM doctor
    WHERE id_doctor = p_id_doctor;

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION
        'No puede eliminarse porque existen referencias';

    WHEN OTHERS THEN
        RAISE EXCEPTION
        'Error eliminando doctor: %',
        SQLERRM;

END;
$$;

/*=========================================================
PROCEDIMIENTO: sp_actualizar_especialidad_doctor

DESCRIPCION:
Este procedimiento permite actualizar la especialidad
asignada a un doctor.

VALIDACIONES:
- Verifica que el doctor exista.
- Verifica que la nueva especialidad exista.
- Verifica que la especialidad nueva sea diferente
  a la especialidad actual.

MANEJO DE ERRORES:
- Genera excepciones cuando los datos son invalidos.
- Captura errores inesperados mediante EXCEPTION.
- Impide actualizaciones inconsistentes.
OBJETIVO:
Permitir la administracion de especialidades del
personal clinico garantizando la consistencia
de la informacion.*/

CREATE OR REPLACE PROCEDURE sp_actualizar_especialidad_doctor(
    p_id_doctor INTEGER,
    p_nueva_especialidad INTEGER
)
LANGUAGE plpgsql AS $$
DECLARE
    v_especialidad_actual INTEGER;
BEGIN

    SELECT id_specialty
    INTO v_especialidad_actual
    FROM doctor
    WHERE id_doctor = p_id_doctor;

    IF NOT FOUND THEN
        RAISE EXCEPTION
        'Doctor no encontrado';
    END IF;

    IF NOT EXISTS(
        SELECT 1
        FROM specialty
        WHERE id_specialty = p_nueva_especialidad
    ) THEN
        RAISE EXCEPTION
        'Especialidad inexistente';
    END IF;

    IF v_especialidad_actual = p_nueva_especialidad THEN
        RAISE EXCEPTION
        'La especialidad ya está asignada';
    END IF;

    UPDATE doctor
    SET id_specialty = p_nueva_especialidad
    WHERE id_doctor = p_id_doctor;

EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION
        'Error actualizando especialidad: %',
        SQLERRM;
END;
$$;
/*=======================VALIDACIONES Y MANEJO DE ERRORES===========================================================*/
/*==================================================================================================================
VALIDACION 1: USUARIO EXISTENTE
DESCRIPCION:
Verifica que el usuario asociado al doctor exista
en la tabla users antes de realizar cualquier operacion.

OBJETIVO:
Evitar registros huerfanos dentro de la tabla doctor.
=========================================================*/

IF NOT EXISTS (
    SELECT 1
    FROM users
    WHERE id_user = p_id_user
)
THEN
    RAISE EXCEPTION
    'El usuario no existe';
END IF;

----------------------------------------------------------
/*=========================================================
VALIDACION 2: ESPECIALIDAD EXISTENTE
DESCRIPCION:
Verifica que la especialidad exista antes
de asociarla a un doctor.

OBJETIVO:
Garantizar que las referencias sean validas.
=========================================================*/

IF NOT EXISTS (
    SELECT 1
    FROM specialty
    WHERE id_specialty = p_id_specialty
)
THEN
    RAISE EXCEPTION
    'La especialidad no existe';
END IF;

----------------------------------------------------------

/*=========================================================
VALIDACION 3: DOCTOR EXISTENTE

DESCRIPCION:
Verifica que el doctor exista antes de actualizar,
consultar o eliminar informacion relacionada.

OBJETIVO:
Evitar operaciones sobre registros inexistentes.
=========================================================*/

IF NOT EXISTS (
    SELECT 1
    FROM doctor
    WHERE id_doctor = p_id_doctor
)
THEN
    RAISE EXCEPTION
    'Doctor no encontrado';
END IF;

----------------------------------------------------------

/*=========================================================
VALIDACION 4: LICENCIA MEDICA UNICA

DESCRIPCION:
Verifica que el numero de licencia no se encuentre
registrado previamente.

OBJETIVO:
Evitar duplicidad de profesionales medicos.
=========================================================*/

IF EXISTS (
    SELECT 1
    FROM doctor
    WHERE license_number = p_license
)
THEN
    RAISE EXCEPTION
    'Licencia medica duplicada';
END IF;
----------------------------------------------------------

/*=========================================================
VALIDACION 5: HORARIO VALIDO

DESCRIPCION:
Verifica que la hora inicial sea menor
que la hora final.

OBJETIVO:
Evitar horarios inconsistentes.
=========================================================*/

IF p_start_time >= p_end_time
THEN
    RAISE EXCEPTION
    'La hora inicial debe ser menor';
END IF;

----------------------------------------------------------

/*=========================================================
VALIDACION 6: HORARIOS SUPERPUESTOS

DESCRIPCION:
Verifica que un doctor no tenga horarios
que se crucen entre si.

OBJETIVO:
Evitar conflictos en la agenda medica.
=========================================================*/

IF EXISTS (
    SELECT 1
    FROM schedule
    WHERE id_doctor = p_id_doctor
      AND p_start_time < end_time
      AND p_end_time > start_time
)
THEN
    RAISE EXCEPTION
    'Cruce de horarios detectado';
END IF;

----------------------------------------------------------

/*=========================================================
VALIDACION 7: CONSULTORIO EXISTENTE

DESCRIPCION:
Verifica que el consultorio exista
antes de realizar una asignacion.

OBJETIVO:
Garantizar la integridad referencial.
=========================================================*/

IF NOT EXISTS (
    SELECT 1
    FROM medical_office
    WHERE id_office = p_id_office
)
THEN
    RAISE EXCEPTION
    'Consultorio inexistente';
END IF;
----------------------------------------------------------

/*=========================================================
VALIDACION 8: COMPATIBILIDAD CONSULTORIO ESPECIALIDAD

DESCRIPCION:
Verifica que el consultorio tenga habilitada
la especialidad que se desea asignar.

OBJETIVO:
Garantizar una correcta distribucion
del personal clinico.
=========================================================*/

IF NOT EXISTS (
    SELECT 1
    FROM office_specialties
    WHERE id_office = p_id_office
      AND id_specialty = p_id_specialty
)
THEN
    RAISE EXCEPTION
    'Consultorio incompatible con la especialidad';
END IF;

/*=========================================================
MANEJO DE ERRORES
DESCRIPCION:
Captura errores generados por PostgreSQL durante
la ejecucion de los procedimientos almacenados.

OBJETIVO:
Generar mensajes claros para el usuario y evitar
inconsistencias en la base de datos.
=========================================================*/

EXCEPTION

    /*ERROR DE CLAVE FORANEA*/
    WHEN foreign_key_violation THEN
        RAISE EXCEPTION
        'Referencia inexistente';

    /*ERROR DE DUPLICIDAD*/
    WHEN unique_violation THEN
        RAISE EXCEPTION
        'Registro duplicado';

    /*ERROR DE CAMPO OBLIGATORIO*/
    WHEN not_null_violation THEN
        RAISE EXCEPTION
        'Campos obligatorios vacios';

    /*ERROR DE CONVERSION DE DATOS*/
    WHEN invalid_text_representation THEN
        RAISE EXCEPTION
        'Formato de dato invalido';

    /*ERROR GENERAL*/
    WHEN OTHERS THEN
        RAISE EXCEPTION
        'Error inesperado: %',
        SQLERRM;