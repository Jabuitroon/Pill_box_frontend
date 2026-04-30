import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import PillCapsule from './PillCapsule'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Inicio', icon: HomeIcon },
  { to: '/patients', label: 'Pacientes', icon: UsersIcon },
  { to: '/prescriptions', label: 'Recetas', icon: RxIcon },
  { to: '/reminders', label: 'Recordatorios', icon: BellIcon },
  { to: '/pills', label: 'Pastillas', icon: PillNavIcon },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { logout, user } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className='fixed left-0 top-0 h-full w-64 bg-navy-800 border-r border-white border-opacity-5 flex flex-col z-40 animate-fade-in'>
      {/* Logo */}
      <div className='px-6 pt-7 pb-6 flex items-center gap-3'>
        <PillCapsule color='teal' size='md' />
        <div>
          <h1 className='font-display font-bold text-lg leading-tight text-white'>
            PillBox
          </h1>
          <p className='text-xs text-teal-400 font-medium tracking-wide'>
            Hipertensión
          </p>
        </div>
      </div>

      {/* Divisor */}
      <div className='mx-6 h-px bg-white bg-opacity-5 mb-4' />

      {/* Nav links */}
      <nav className='flex-1 px-4 space-y-1'>
        {NAV_LINKS.map(({ to, label, icon: Icon }) => {
          const active = pathname.startsWith(to)
          return (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                ${
                  active
                    ? 'bg-teal-500 bg-opacity-15 text-teal-400 font-semibold'
                    : 'text-white text-opacity-50 hover:bg-white hover:bg-opacity-5 hover:text-opacity-90'
                }`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 ${active ? 'text-teal-400' : ''}`}
              />
              <span className='text-sm'>{label}</span>
              {active && (
                <div className='ml-auto w-1.5 h-1.5 rounded-full bg-teal-400' />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User info + logout */}
      <div className='px-4 pb-6'>
        <div className='mx-2 h-px bg-white bg-opacity-5 mb-4' />
        <div className='flex items-center gap-3 px-4 py-3 rounded-xl bg-navy-700 bg-opacity-50 mb-2'>
          <div className='w-8 h-8 rounded-full bg-gradient-to-br from-teal-600 to-teal-400 flex items-center justify-center text-navy-900 font-bold text-sm shrink-0'>
            {user?.name?.[0]?.toUpperCase() ?? 'F'}
          </div>
          <div className='min-w-0'>
            <p className='text-sm font-medium text-white truncate'>
              {user?.name ?? 'Fisioterapeuta'}
            </p>
            <p className='text-xs text-teal-400'>Administrador</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className='w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-coral-400 hover:bg-coral-500 hover:bg-opacity-10 transition-all duration-200'
        >
          <LogoutIcon className='w-4 h-4' />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}

/* ── Iconos inline (SVG) ── */
function HomeIcon({ className }) {
  return (
    <svg
      className={className}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={1.8}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M2.25 12l8.954-8.955a1.5 1.5 0 012.092 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25'
      />
    </svg>
  )
}
function UsersIcon({ className }) {
  return (
    <svg
      className={className}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={1.8}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
      />
    </svg>
  )
}
function RxIcon({ className }) {
  return (
    <svg
      className={className}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={1.8}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z'
      />
    </svg>
  )
}
function BellIcon({ className }) {
  return (
    <svg
      className={className}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={1.8}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0'
      />
    </svg>
  )
}

function PillNavIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
    </svg>
  )
}

function LogoutIcon({ className }) {
  return (
    <svg
      className={className}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={1.8}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9'
      />
    </svg>
  )
}
