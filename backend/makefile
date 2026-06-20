# ============================================
# ENTORNO
# ============================================

# Instala todas las dependencias del proyecto
install:
	pip install -r requirements.txt

# Activa el entorno virtual (Windows)
venv:
	python -m venv venv

# ============================================
# SERVIDOR
# ============================================

# Levanta el servidor en modo desarrollo con recarga automática
run:
	uvicorn app.main:app --reload

# Levanta en un puerto específico
run-port:
	uvicorn app.main:app --reload --port 8001

# ============================================
# MIGRACIONES (Alembic)
# ============================================

# Crea una nueva migración detectando cambios en los modelos
# Uso: make migration name="nombre_descriptivo"
migration:
	alembic revision --autogenerate -m "$(name)"

# Aplica todas las migraciones pendientes a la BD
migrate:
	alembic upgrade head

# Revierte la última migración aplicada
rollback:
	alembic downgrade -1

# Muestra el historial de migraciones
migration-history:
	alembic history

# ============================================
# CALIDAD DE CÓDIGO
# ============================================

# Formatea todo el código automáticamente
format:
	ruff format .

# Revisa errores de estilo sin modificar nada
lint:
	ruff check .

# Corrige automáticamente los errores que pueda
fix:
	ruff check . --fix

# ============================================
# TESTING
# ============================================

# Corre todos los tests
test:
	pytest

# Corre tests mostrando detalle de cada uno
test-v:
	pytest -v

# ============================================
# UTILIDADES
# ============================================

# Genera el requirements.txt con las dependencias actuales
freeze:
	pip freeze > requirements.txt

# ============================================
# BASE DE DATOS (Supabase - nube)
# ============================================

# URL de conexión a Supabase, ajusta tu contraseña real
SUPABASE_URL = postgresql://postgres:HealthFlow2026DB@db.kqzlukceyihuapoojezb.supabase.co:5432/postgres

# Crea las tablas, índices y triggers en Supabase (primera vez)
setup:
	psql "$(SUPABASE_URL)" -f sql/ddl/01_create_tables.sql
	psql "$(SUPABASE_URL)" -f sql/ddl/02_indexes.sql
	psql "$(SUPABASE_URL)" -f sql/ddl/03_triggers_auditoria.sql

# Solo crea las tablas
tables:
	psql "$(SUPABASE_URL)" -f sql/ddl/01_create_tables.sql

# Solo crea los índices
indexes:
	psql "$(SUPABASE_URL)" -f sql/ddl/02_indexes.sql

# Solo crea las funciones y triggers de auditoría
triggers:
	psql "$(SUPABASE_URL)" -f sql/ddl/03_triggers_auditoria.sql

# Borra todas las tablas en Supabase y las vuelve a crear desde cero
reset:
	psql "$(SUPABASE_URL)" -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
	psql "$(SUPABASE_URL)" -f sql/ddl/01_create_tables.sql
	psql "$(SUPABASE_URL)" -f sql/ddl/02_indexes.sql
	psql "$(SUPABASE_URL)" -f sql/ddl/03_triggers_auditoria.sql