import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PatientsPage from './pages/PatientsPage'
import PillsPage from './pages/PillsPage'
import PrescriptionsPage from './pages/PrescriptionsPage'
import PatientDetailPage from './pages/PatientDetailPage'
import { RemindersPage } from './pages/PlaceholderPages'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          {/* Ruta pública */}
          <Route path='/login' element={<LoginPage />} />

          {/* Rutas protegidas (requieren JWT) */}
          <Route element={<ProtectedRoute />}>
            <Route path='/dashboard' element={<DashboardPage />} />
            <Route path='/patients' element={<PatientsPage />} />
            <Route
              path='/patients/:patientId'
              element={<PatientDetailPage />}
            />{' '}
            {/* <-- nueva */}
            <Route path='/prescriptions' element={<PrescriptionsPage />} />
            <Route path='/pills' element={<PillsPage />} />
            <Route path='/reminders' element={<RemindersPage />} />
          </Route>

          {/* Redireccionamiento por defecto */}
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  )
}
