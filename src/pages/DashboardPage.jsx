import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PillCapsule from '../components/PillCapsule'
import useAuthStore from '../store/authStore'
import { patientsApi } from '../api/client'

const PILL_COLORS = ['red', 'blue', 'yellow', 'green', 'purple', 'orange', 'pink', 'cyan']

const QUICK_ACTIONS = [
  { label: 'Nuevo Paciente',  icon: '👤', to: '/patients',      color: 'teal'  },
  { label: 'Nueva Receta',    icon: '📋', to: '/prescriptions', color: 'blue'  },
  { label: 'Recordatorios',   icon: '🔔', to: '/reminders',     color: 'purple'},
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [patientCount, setPatientCount] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    patientsApi.getAll()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.data ?? []
        setPatientCount(list.length)
      })
      .catch(() => setPatientCount(0))
      .finally(() => setLoading(false))
  }, [])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 18 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="page-enter space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-teal-400 font-medium text-sm mb-1">{greeting},</p>
          <h1 className="font-display font-bold text-3xl text-white">
            {user?.name ?? 'Fisioterapeuta'} 👋
          </h1>
          <p className="text-white text-opacity-40 text-sm mt-1">
            {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          {PILL_COLORS.slice(0, 5).map((c, i) => (
            <div key={c} style={{ animationDelay: `${i * 0.15}s` }} className="animate-fade-in">
              <PillCapsule color={c} size="sm" animate />
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Pacientes Activos"
          value={loading ? '…' : patientCount ?? '—'}
          icon={<UsersIcon />}
          color="teal"
          delay="0"
        />
        <StatCard
          title="Recetas Vigentes"
          value="—"
          icon={<RxIcon />}
          color="blue"
          delay="0.1"
          comingSoon
        />
        <StatCard
          title="Recordatorios Hoy"
          value="—"
          icon={<BellIcon />}
          color="purple"
          delay="0.2"
          comingSoon
        />
      </div>

      {/* Acciones rápidas */}
      <section>
        <h2 className="font-display font-semibold text-white text-lg mb-4">Acciones rápidas</h2>
        <div className="grid grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(({ label, icon, to }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="glass-card p-5 flex flex-col items-center gap-3 hover:border-teal-500 hover:border-opacity-30
                         transition-all duration-200 hover:scale-105 group"
            >
              <span className="text-3xl">{icon}</span>
              <span className="text-sm font-medium text-white text-opacity-70 group-hover:text-opacity-100 transition-opacity">
                {label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Panel de pastillas */}
      <section>
        <h2 className="font-display font-semibold text-white text-lg mb-4">
          Paleta de medicamentos
        </h2>
        <div className="glass-card p-6">
          <p className="text-white text-opacity-40 text-sm mb-5">
            Cada medicamento en las recetas se identifica visualmente con un color único.
          </p>
          <div className="flex flex-wrap gap-6 items-center">
            {[
              { color: 'red',    name: 'Losartán'    },
              { color: 'blue',   name: 'Amlodipino'  },
              { color: 'yellow', name: 'Metoprolol'  },
              { color: 'green',  name: 'Enalapril'   },
              { color: 'purple', name: 'Valsartán'   },
              { color: 'orange', name: 'Furosemida'  },
              { color: 'pink',   name: 'Diltiazem'   },
              { color: 'cyan',   name: 'Ramipril'    },
            ].map(({ color, name }, i) => (
              <div
                key={color}
                className="flex flex-col items-center gap-2 animate-fade-in"
                style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
              >
                <PillCapsule color={color} size="md" animate />
                <span className="text-xs text-white text-opacity-50">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ title, value, icon, color, delay, comingSoon }) {
  const colorMap = {
    teal:   'text-teal-400 bg-teal-500',
    blue:   'text-blue-400 bg-blue-500',
    purple: 'text-purple-400 bg-purple-500',
  }

  return (
    <div
      className="glass-card p-5 animate-fade-in-up"
      style={{ animationDelay: `${delay}s`, opacity: 0 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl ${colorMap[color]} bg-opacity-15 flex items-center justify-center ${colorMap[color].split(' ')[0]}`}>
          {icon}
        </div>
        {comingSoon && (
          <span className="badge bg-white bg-opacity-5 text-white text-opacity-30">
            Próximo
          </span>
        )}
      </div>
      <p className={`font-display font-bold text-3xl ${colorMap[color].split(' ')[0]} mb-1`}>
        {value}
      </p>
      <p className="text-white text-opacity-50 text-sm">{title}</p>
    </div>
  )
}

/* Íconos */
function UsersIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
}
function RxIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>
}
function BellIcon() {
  return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>
}
