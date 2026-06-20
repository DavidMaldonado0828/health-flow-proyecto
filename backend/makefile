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
# BASE DE DATOS
# ============================================

# Crea usuario, BD y ejecuta todos los scripts en orden (solo una vez)
setup:
	psql -U postgres -f ../sql/ddl/00_create_database.sql
	psql -U healthflow_admin -d healthflow_db -f sql/ddl/01_create_tables.sql
	psql -U healthflow_admin -d healthflow_db -f sql/ddl/02_indexes.sql
	psql -U healthflow_admin -d healthflow_db -f sql/ddl/03_triggers_auditoria.sql

# Solo crea las tablas (si ya existe la BD)
tables:
	psql -U healthflow_admin -d healthflow_db -f sql/ddl/01_create_tables.sql

# Solo crea los índices
indexes:
	psql -U healthflow_admin -d healthflow_db -f sql/ddl/02_indexes.sql

# Solo crea las funciones y triggers de auditoría
triggers:
	psql -U healthflow_admin -d healthflow_db -f sql/ddl/03_triggers_auditoria.sql

# Borra y recrea todo desde cero
reset:
	psql -U postgres -c "DROP DATABASE IF EXISTS healthflow_db;"
	psql -U postgres -c "DROP USER IF EXISTS healthflow_admin;"
	psql -U postgres -f sql/ddl/00_create_database.sql
	psql -U healthflow_admin -d healthflow_db -f sql/ddl/01_create_tables.sql
	psql -U healthflow_admin -d healthflow_db -f sql/ddl/02_indexes.sql
	psql -U healthflow_admin -d healthflow_db -f sql/ddl/03_triggers_auditoria.sql