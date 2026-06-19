-- ============================================
-- HEALTHFLOW - CREAR BASE DE DATOS Y USUARIO
-- ============================================

-- 01. Crear usuario
CREATE USER healthflow_admin WITH PASSWORD 'tu_password';

-- 02. Crear base de datos
CREATE DATABASE healthflow_db;

-- 03. Dar privilegios sobre la base de datos
GRANT ALL PRIVILEGES ON DATABASE healthflow_db TO healthflow_admin;

-- 04. Conectarse a healthflow_db para dar permisos sobre el schema public
\c healthflow_db

-- 05. Dar permisos sobre el schema public 
GRANT ALL ON SCHEMA public TO healthflow_admin;

-- 06. Hacer a healthflow_admin dueño del schema public
ALTER SCHEMA public OWNER TO healthflow_admin;