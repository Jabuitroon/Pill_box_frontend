import { Navigate, Outlet } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import Navbar from './Navbar'

/** Ruta protegida: redirige al login si no hay token */
export default function ProtectedRoute() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen">
      <Navbar />
      {/* Contenido principal con margen para el sidebar */}
      <main className="flex-1 sm:ml-64 min-h-screen bg-navy-900 relative overflow-x-hidden">
        {/* Decoración de fondo */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-teal-500 opacity-5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-blue-500 opacity-5 blur-3xl pointer-events-none" />
        <div className="relative z-10 p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
