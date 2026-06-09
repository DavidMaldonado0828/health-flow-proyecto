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