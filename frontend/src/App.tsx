import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { PatientLayout } from './components/PatientLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Auditoria } from './pages/Auditoria'
import { Citas } from './pages/Citas'
import { Dashboard } from './pages/Dashboard'
import { Diagnosticos } from './pages/Diagnosticos'
import { Especialidades } from './pages/Especialidades'
import { Historial } from './pages/Historial'
import { Medicamentos } from './pages/Medicamentos'
import { Reportes } from './pages/Reportes'
import { Tratamientos } from './pages/Tratamientos'
import { CambiarPassword } from './pages/patient/CambiarPassword'
import { CitasProgramadas } from './pages/patient/CitasProgramadas'
import { Contacto } from './pages/patient/Contacto'
import { DatosPersonales } from './pages/patient/DatosPersonales'
import { DiagnosticosPaciente } from './pages/patient/DiagnosticosPaciente'
import { ExamenesPaciente } from './pages/patient/ExamenesPaciente'
import { ForgotPassword } from './pages/patient/ForgotPassword'
import { FormulasPaciente } from './pages/patient/FormulasPaciente'
import { GestionarCitas } from './pages/patient/GestionarCitas'
import { HistorialCitas } from './pages/patient/HistorialCitas'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { PatientHome } from './pages/patient/PatientHome'
import { SolicitarCita } from './pages/patient/SolicitarCita'
import { TratamientosPaciente } from './pages/patient/TratamientosPaciente'

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/paciente/login" element={<Navigate to="/login" replace />} />
      <Route path="/paciente/recuperar" element={<ForgotPassword />} />

      {/* Patient Protected Portal */}
      <Route
        path="/paciente"
        element={
          <ProtectedRoute allowedRoles={['paciente']}>
            <PatientLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PatientHome />} />
        <Route path="citas/solicitar" element={<SolicitarCita />} />
        <Route path="citas/programadas" element={<CitasProgramadas />} />
        <Route path="citas/gestionar" element={<GestionarCitas />} />
        <Route path="citas/historial" element={<HistorialCitas />} />
        <Route path="medica/tratamientos" element={<TratamientosPaciente />} />
        <Route path="medica/diagnosticos" element={<DiagnosticosPaciente />} />
        <Route path="medica/formulas" element={<FormulasPaciente />} />
        <Route path="medica/examenes" element={<ExamenesPaciente />} />
        <Route path="perfil/datos" element={<DatosPersonales />} />
        <Route path="perfil/contacto" element={<Contacto />} />
        <Route path="perfil/password" element={<CambiarPassword />} />
      </Route>

      {/* Clinician & Admin Protected Console */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['medico', 'administrador']}>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        {/* Admin-only Routes */}
        <Route
          path="especialidades"
          element={
            <ProtectedRoute allowedRoles={['administrador']}>
              <Especialidades />
            </ProtectedRoute>
          }
        />
        <Route
          path="auditoria"
          element={
            <ProtectedRoute allowedRoles={['administrador']}>
              <Auditoria />
            </ProtectedRoute>
          }
        />

        {/* Doctor-only Routes */}
        <Route
          path="citas"
          element={
            <ProtectedRoute allowedRoles={['medico']}>
              <Citas />
            </ProtectedRoute>
          }
        />
        <Route
          path="diagnosticos"
          element={
            <ProtectedRoute allowedRoles={['medico']}>
              <Diagnosticos />
            </ProtectedRoute>
          }
        />
        <Route
          path="tratamientos"
          element={
            <ProtectedRoute allowedRoles={['medico']}>
              <Tratamientos />
            </ProtectedRoute>
          }
        />
        <Route
          path="historial"
          element={
            <ProtectedRoute allowedRoles={['medico', 'administrador']}>
              <Historial />
            </ProtectedRoute>
          }
        />

        {/* Shared Console Routes */}
        <Route path="medicamentos" element={<Medicamentos />} />
        <Route path="reportes" element={<Reportes />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
