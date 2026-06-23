"""
HealthFlow - CLI CRUD de Usuarios
Conexión directa a Supabase (PostgreSQL)
Ubicación: /scripts/crud.py
"""

import sys
import psycopg2
from psycopg2.extras import RealDictCursor
import bcrypt

DATABASE_URL = "postgresql://postgres:HealthFlow2026DB@db.kqzlukceyihuapoojezb.supabase.co:5432/postgres"

# ============================================
# CONEXIÓN ÚNICA PARA TODA LA SESIÓN
# ============================================
conn = None

def get_connection():
    global conn
    try:
        if conn is None or conn.closed:
            conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"❌ Error de conexión: {e}")
        sys.exit(1)


# ============================================
# VALIDACIONES
# ============================================
def validar_email(email):
    return "@" in email and "." in email.split("@")[-1]

def usuario_existe(cur, user_id):
    cur.execute("SELECT user_id FROM Users WHERE user_id = %s", (user_id,))
    return cur.fetchone() is not None

def username_duplicado(cur, username, excluir_id=None):
    if excluir_id:
        cur.execute("SELECT user_id FROM Users WHERE username = %s AND user_id != %s", (username, excluir_id))
    else:
        cur.execute("SELECT user_id FROM Users WHERE username = %s", (username,))
    return cur.fetchone() is not None

def email_duplicado(cur, email, excluir_id=None):
    if excluir_id:
        cur.execute("SELECT user_id FROM Users WHERE email = %s AND user_id != %s", (email, excluir_id))
    else:
        cur.execute("SELECT user_id FROM Users WHERE email = %s", (email,))
    return cur.fetchone() is not None


# ============================================
# OPERACIONES CRUD - USUARIOS
# ============================================
def listar_usuarios():
    conn = get_connection()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("""
            SELECT u.user_id, u.username, u.email, u.active, r.name AS role
            FROM Users u
            JOIN Roles r ON r.role_id = u.role_id
            ORDER BY u.user_id
        """)
        users = cur.fetchall()
        if not users:
            print("\n📭 No hay usuarios registrados")
            return
        print(f"\n{'ID':<5} {'Username':<20} {'Email':<30} {'Rol':<15} {'Activo'}")
        print("-" * 80)
        for u in users:
            estado = "✅ Activo" if u['active'] else "❌ Inactivo"
            print(f"{u['user_id']:<5} {u['username']:<20} {u['email']:<30} {u['role']:<15} {estado}")
        print(f"\nTotal: {len(users)} usuarios")


def ver_usuario():
    user_id = input("  ID del usuario: ").strip()
    if not user_id.isdigit():
        print("❌ El ID debe ser un número")
        return

    conn = get_connection()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        # Datos básicos
        cur.execute("""
            SELECT u.user_id, u.username, u.email, u.active,
                   u.create_date, r.name AS role
            FROM Users u
            JOIN Roles r ON r.role_id = u.role_id
            WHERE u.user_id = %s
        """, (int(user_id),))
        user = cur.fetchone()

        if not user:
            print(f"❌ Usuario con ID {user_id} no encontrado")
            return

        print(f"\n👤 Usuario #{user['user_id']}")
        print(f"   Username : {user['username']}")
        print(f"   Email    : {user['email']}")
        print(f"   Rol      : {user['role']}")
        print(f"   Activo   : {'Sí' if user['active'] else 'No'}")
        print(f"   Creado   : {user['create_date']}")

        # Teléfonos
        cur.execute("""
            SELECT phone_number, phone_type, is_primary
            FROM User_Phones WHERE user_id = %s
        """, (int(user_id),))
        phones = cur.fetchall()
        if phones:
            print(f"\n   📞 Teléfonos:")
            for p in phones:
                primario = "⭐ Principal" if p['is_primary'] else ""
                print(f"      {p['phone_number']} ({p['phone_type']}) {primario}")

        # Documentos
        cur.execute("""
            SELECT ud.document_number, dt.name AS doc_type
            FROM User_Documents ud
            JOIN Document_Types dt ON dt.doc_type_id = ud.doc_type_id
            WHERE ud.user_id = %s
        """, (int(user_id),))
        docs = cur.fetchall()
        if docs:
            print(f"\n   📄 Documentos:")
            for d in docs:
                print(f"      {d['doc_type']}: {d['document_number']}")


def crear_usuario():
    print("\n  --- Nuevo Usuario ---")
    username = input("  Username    : ").strip()
    email    = input("  Email       : ").strip()
    password = input("  Password    : ").strip()
    print("  Roles: 1=Admin | 2=Doctor | 3=Patient")
    role_id  = input("  Role ID     : ").strip()

    if not all([username, email, password, role_id]):
        print("❌ Todos los campos son obligatorios")
        return
    if not validar_email(email):
        print("❌ Formato de email inválido")
        return
    if not role_id.isdigit():
        print("❌ Role ID debe ser un número")
        return

    # Teléfono (opcional)
    print("\n  --- Teléfono (opcional, Enter para omitir) ---")
    phone_number = input("  Teléfono    : ").strip()
    phone_type   = input("  Tipo (Mobile/Home/Work): ").strip() if phone_number else ""

    # Documento (opcional)
    print("\n  --- Documento (opcional, Enter para omitir) ---")
    doc_number  = input("  Nº Documento: ").strip()
    if doc_number:
        conn_temp = get_connection()
        with conn_temp.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT doc_type_id, name FROM Document_Types ORDER BY doc_type_id")
            tipos = cur.fetchall()
            print("  Tipos disponibles:")
            for t in tipos:
                print(f"    {t['doc_type_id']} = {t['name']}")
        doc_type_id = input("  Tipo Doc ID : ").strip()
    else:
        doc_type_id = None

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if username_duplicado(cur, username):
                print(f"❌ El username '{username}' ya está registrado")
                return
            if email_duplicado(cur, email):
                print(f"❌ El email '{email}' ya está registrado")
                return
            cur.execute("SELECT role_id FROM Roles WHERE role_id = %s", (int(role_id),))
            if not cur.fetchone():
                print(f"❌ El rol con ID {role_id} no existe")
                return

            # Crear usuario
            cur.execute("""
                INSERT INTO Users (username, email, password, role_id, active)
                VALUES (%s, %s, %s, %s, TRUE)
                RETURNING user_id, username, email, role_id
            """, (username, email, hashed, int(role_id)))
            nuevo = cur.fetchone()
            new_id = nuevo['user_id']

            # Agregar teléfono si se ingresó
            if phone_number:
                cur.execute("""
                    INSERT INTO User_Phones (user_id, phone_number, phone_type, is_primary)
                    VALUES (%s, %s, %s, TRUE)
                """, (new_id, phone_number, phone_type or "Mobile"))

            # Agregar documento si se ingresó
            if doc_number and doc_type_id and doc_type_id.isdigit():
                cur.execute("""
                    INSERT INTO User_Documents (user_id, doc_type_id, document_number)
                    VALUES (%s, %s, %s)
                """, (new_id, int(doc_type_id), doc_number))

            conn.commit()
            print(f"\n✅ Usuario creado — ID: {new_id} | Username: {nuevo['username']}")
            if phone_number:
                print(f"   📞 Teléfono registrado: {phone_number}")
            if doc_number:
                print(f"   📄 Documento registrado: {doc_number}")

    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")


def actualizar_usuario():
    user_id = input("  ID del usuario a actualizar: ").strip()
    if not user_id.isdigit():
        print("❌ El ID debe ser un número")
        return

    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            if not usuario_existe(cur, int(user_id)):
                print(f"❌ Usuario con ID {user_id} no encontrado")
                return

            print("  (Dejar en blanco para no modificar)")
            nuevo_username = input("  Nuevo username : ").strip()
            nuevo_email    = input("  Nuevo email    : ").strip()

            if not nuevo_username and not nuevo_email:
                print("❌ Debes modificar al menos un campo")
                return

            campos, valores = [], []

            if nuevo_username:
                if username_duplicado(cur, nuevo_username, excluir_id=int(user_id)):
                    print(f"❌ El username '{nuevo_username}' ya está en uso")
                    return
                campos.append("username = %s")
                valores.append(nuevo_username)

            if nuevo_email:
                if not validar_email(nuevo_email):
                    print("❌ Formato de email inválido")
                    return
                if email_duplicado(cur, nuevo_email, excluir_id=int(user_id)):
                    print(f"❌ El email '{nuevo_email}' ya está en uso")
                    return
                campos.append("email = %s")
                valores.append(nuevo_email)

            valores.append(int(user_id))
            cur.execute(
                f"UPDATE Users SET {', '.join(campos)} WHERE user_id = %s RETURNING user_id, username, email",
                valores
            )
            actualizado = cur.fetchone()
            conn.commit()
            print(f"\n✅ Usuario #{actualizado['user_id']} actualizado")
            print(f"   Username : {actualizado['username']}")
            print(f"   Email    : {actualizado['email']}")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")


def desactivar_usuario():
    user_id = input("  ID del usuario a desactivar: ").strip()
    if not user_id.isdigit():
        print("❌ El ID debe ser un número")
        return

    conn = get_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT username, email, active FROM Users WHERE user_id = %s", (int(user_id),))
            user = cur.fetchone()

            if not user:
                print(f"❌ Usuario con ID {user_id} no encontrado")
                return
            if not user['active']:
                print(f"⚠️  El usuario '{user['username']}' ya está inactivo")
                return

            confirmar = input(f"  ¿Desactivar '{user['username']}' ({user['email']})? (s/n): ").strip().lower()
            if confirmar != "s":
                print("❌ Operación cancelada")
                return

            cur.execute("UPDATE Users SET active = FALSE WHERE user_id = %s", (int(user_id),))
            conn.commit()
            print(f"\n✅ Usuario '{user['username']}' desactivado (eliminación lógica)")
    except Exception as e:
        conn.rollback()
        print(f"❌ Error: {e}")


# ============================================
# AUDITORÍA
# ============================================
def ver_auditoria():
    print("\n  --- Filtros de Auditoría (Enter para ver todos) ---")
    tabla  = input("  Tabla (Users/Doctors/Patients/etc): ").strip()
    limite = input("  Últimos N registros [20]: ").strip()
    limite = int(limite) if limite.isdigit() else 20

    conn = get_connection()
    with conn.cursor(cursor_factory=RealDictCursor) as cur:
        if tabla:
            cur.execute("""
                SELECT al.audit_id, al.table_name, al.operation_type,
                       al.performed_at, u.username,
                       al.old_value, al.new_value
                FROM Audit_Logs al
                LEFT JOIN Users u ON u.user_id = al.user_id
                WHERE al.table_name ILIKE %s
                ORDER BY al.performed_at DESC
                LIMIT %s
            """, (tabla, limite))
        else:
            cur.execute("""
                SELECT al.audit_id, al.table_name, al.operation_type,
                       al.performed_at, u.username,
                       al.old_value, al.new_value
                FROM Audit_Logs al
                LEFT JOIN Users u ON u.user_id = al.user_id
                ORDER BY al.performed_at DESC
                LIMIT %s
            """, (limite,))

        logs = cur.fetchall()

        if not logs:
            print("\n📭 No hay registros de auditoría")
            return

        print(f"\n{'ID':<6} {'Tabla':<20} {'Operación':<10} {'Usuario':<20} {'Fecha'}")
        print("-" * 80)
        for log in logs:
            usuario = log['username'] or "sistema"
            print(f"{log['audit_id']:<6} {log['table_name']:<20} {log['operation_type']:<10} {usuario:<20} {log['performed_at']}")

        # Mostrar detalle si quiere
        detalle = input("\n  ¿Ver detalle de algún registro? ID (Enter para omitir): ").strip()
        if detalle.isdigit():
            registro = next((l for l in logs if l['audit_id'] == int(detalle)), None)
            if registro:
                print(f"\n  📋 Detalle registro #{registro['audit_id']}")
                print(f"  Tabla     : {registro['table_name']}")
                print(f"  Operación : {registro['operation_type']}")
                print(f"  Fecha     : {registro['performed_at']}")
                print(f"  Usuario   : {registro['username'] or 'sistema'}")
                if registro['old_value']:
                    print(f"  Antes     : {registro['old_value']}")
                if registro['new_value']:
                    print(f"  Después   : {registro['new_value']}")


# ============================================
# MENÚ PRINCIPAL
# ============================================
def menu():
    print("\n🔌 Conectando a Supabase...")
    get_connection()
    print("✅ Conexión establecida")

    opciones = {
        "1": ("Listar todos los usuarios",       listar_usuarios),
        "2": ("Ver usuario por ID",               ver_usuario),
        "3": ("Crear nuevo usuario",              crear_usuario),
        "4": ("Actualizar usuario",               actualizar_usuario),
        "5": ("Desactivar usuario",               desactivar_usuario),
        "6": ("Ver registros de auditoría",       ver_auditoria),
        "7": ("Salir",                            None),
    }

    while True:
        print("\n" + "=" * 40)
        print("   🏥 HealthFlow — Gestión de Usuarios")
        print("=" * 40)
        for key, (descripcion, _) in opciones.items():
            print(f"  {key}. {descripcion}")
        print("=" * 40)

        opcion = input("  Selecciona una opción: ").strip()

        if opcion == "7":
            if conn and not conn.closed:
                conn.close()
            print("\n👋 Hasta luego\n")
            sys.exit(0)

        if opcion not in opciones:
            print("❌ Opción inválida")
            continue

        _, funcion = opciones[opcion]
        try:
            funcion()
        except KeyboardInterrupt:
            print("\n⚠️  Operación cancelada")


if __name__ == "__main__":
    menu()
