# MediCore — Frontend Gestión Hospitalaria

Sistema web de gestión hospitalaria con los siguientes módulos:

| Módulo | Ruta | Funcionalidad |
|--------|------|---------------|
| Dashboard | `/` | Resumen operativo |
| Especialidades | `/especialidades` | CRUD de especialidades médicas |
| Citas | `/citas` | Programar y cambiar estado de citas |
| Diagnósticos | `/diagnosticos` | Registro con código CIE-10 |
| Tratamientos | `/tratamientos` | Vinculados a diagnósticos |
| Medicamentos | `/medicamentos` | Inventario y alertas de stock |
| Historial clínico | `/historial` | Línea de tiempo por paciente |
| Reportes | `/reportes` | Indicadores y exportación JSON |
| Auditoría | `/auditoria` | Log CRUD y consultas de historial |

## Requisitos

- Node.js 18+

## Instalación y ejecución

```bash
cd hospital-frontend
npm install
npm run dev
```

Abra `http://localhost:5173` en el navegador.

## Build producción

```bash
npm run build
npm run preview
```

## Arquitectura

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** para estilos
- **React Router** para navegación
- Datos en **localStorage** (demo); listo para conectar API REST

Cada operación CREATE/UPDATE/DELETE y consulta de historial/reportes genera un registro en auditoría.

## Portal del paciente

Ruta: **http://localhost:5173/paciente/login**

| Credencial demo | Valor |
|-----------------|-------|
| Documento | `12345678` |
| Contraseña | `paciente123` |

Funciones: iniciar sesión, recuperar contraseña, solicitar/consultar/cancelar/reprogramar citas, historial de citas, tratamientos, diagnósticos, descargar fórmulas y exámenes, actualizar datos personales, contacto y contraseña.

## Próximos pasos (backend)

1. API REST con JWT y roles (médico, admin, farmacia)
2. Base de datos PostgreSQL
3. Auditoría persistente en tabla `audit_logs`
4. Autenticación OAuth2 / SSO hospitalario
