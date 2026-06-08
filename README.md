# 🏥 Health Flow

Health Flow es una plataforma de gestión integral diseñada para optimizar los procesos operativos y clínicos de instituciones de salud. El objetivo es centralizar la gestión de pacientes, citas médicas, personal clínico e historial médico en una sola fuente de verdad.

---

## 💡 ¿Por qué este proyecto?
El sistema Health Flow nace de la necesidad de digitalizar y optimizar la gestión operativa de instituciones de salud. Creamos este proyecto para centralizar el flujo clínico y administrativo en una plataforma **robusta, segura y escalable**, eliminando la fragmentación de la información y mejorando la atención al paciente mediante una arquitectura tecnológica moderna.

---

## 🚀 Reglas de Trabajo Colaborativo (¡LEER ANTES DE CODIAR!)

Para mantener el orden y evitar conflictos, seguimos este flujo obligatorio:

* **Protección de Ramas:** Nunca hagas `push` directo a `develop` o `main`.
* **Ramas de Feature:** Todo trabajo debe realizarse en una rama propia siguiendo el formato: `feat/modulo/descripcion`.
* **Pull Requests (PR):** Al terminar una tarea, abre un PR hacia `develop`. Es **obligatorio** pedir una revisión de al menos un compañero antes de fusionar (`merge`).
* **Convención de Commits:** Todo mensaje de commit debe seguir el formato: `tipo(alcance): descripción`. (Ej: `feat(auth): implementar login`).
* **Comunicación:** Si vas a tocar archivos sensibles (`main.py`, `database.py`, `alembic/`), avisa primero en el grupo para evitar conflictos.

---

## 🛠 Backend y Arquitectura

El backend está construido con **FastAPI**, diseñado para ser escalable y modular.

### Arquitectura: Modular por Dominio
No usamos una estructura plana; dividimos el sistema por áreas de negocio. Cada módulo es independiente y contiene sus propias capas:

1.  **Domain:** La lógica pura del negocio.
2.  **Use Cases:** Orquestación de servicios.
3.  **Infrastructure:** Modelos de BD y adaptadores.
4.  **Routes:** Entradas de la API (FastAPI).

### Stack Tecnológico
* **Framework:** FastAPI
* **Validación:** Pydantic v2
* **ORM:** SQLAlchemy
* **Migraciones:** Alembic
* **Base de Datos:** PostgreSQL
* **Testing:** Pytest

---

## ⚙️ Configuración del Entorno

1.  **Clonar:** `git clone <url-del-repo>`
2.  **Entorno:** `python -m venv venv` (y actívalo).
3.  **Dependencias:** `pip install -r requirements.txt`
4.  **Variables:** Copia el `.env.example` a `.env` y configura tus credenciales locales.
5.  **Migraciones:** `alembic upgrade head` (prepara la base de datos).
6.  **Ejecutar:** `uvicorn app.main:app --reload`

---

## 📋 Módulos del Sistema

* **Auth:** Gestión de usuarios y seguridad.
* **Pacientes:** CRUD y gestión de datos.
* **Médicos:** Gestión de personal y disponibilidad.
Citas: Agendamiento.

Historia Clínica: Registros médicos.

Notificaciones: Sistema de alertas.

Documento mantenido por el equipo de Health Flow.
