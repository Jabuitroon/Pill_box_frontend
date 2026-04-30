import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api/client'
import useAuthStore from '../store/authStore'
import { BgPill } from '../components/PillCapsule'
import { useToast } from '../components/Toast'

/* Configuración de las pastillas flotantes de fondo */
const BG_PILLS = [
  { color: 'red',    size: 'xl',  style: { top: '8%',  left: '5%'  }, anim: 'animate-float'         },
  { color: 'blue',   size: 'lg',  style: { top: '20%', right: '8%' }, anim: 'animate-float-reverse'  },
  { color: 'yellow', size: 'xl',  style: { top: '55%', left: '3%'  }, anim: 'animate-float-slow'     },
  { color: 'green',  size: 'md',  style: { top: '75%', right: '6%' }, anim: 'animate-float'          },
  { color: 'purple', size: 'lg',  style: { top: '40%', right: '3%' }, anim: 'animate-float-reverse'  },
  { color: 'orange', size: 'md',  style: { top: '85%', left: '12%' }, anim: 'animate-float-slow'     },
  { color: 'pink',   size: 'xl',  style: { top: '5%',  right: '20%'}, anim: 'animate-float'          },
  { color: 'cyan',   size: 'md',  style: { top: '65%', left: '20%' }, anim: 'animate-float-reverse'  },
  { color: 'teal',   size: 'lg',  style: { top: '30%', left: '8%'  }, anim: 'animate-float-slow'     },
]

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuthStore()
  const toast = useToast()

  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setError('')
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Por favor completa todos los campos.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const data = await authApi.login(form)
      login({ access_token: data.access_token, user: data.user })
      toast.success('¡Bienvenido de nuevo!')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message ?? 'Credenciales incorrectas. Intenta de nuevo.')
      toast.error('Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center relative overflow-hidden">

      {/* Fondo con malla de gradiente */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900" />
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full bg-teal-500 opacity-5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-blue-500 opacity-5 blur-[100px]" />
      </div>

      {/* Pastillas flotantes de fondo */}
      {BG_PILLS.map((p, i) => (
        <BgPill key={i} color={p.color} size={p.size} style={p.style} animationClass={p.anim} />
      ))}

      {/* Tarjeta de login */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-fade-in-up">

        {/* Logo y título */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-navy-700 border border-white border-opacity-10 mb-4 shadow-lg">
            <PillIcon />
          </div>
          <h1 className="font-display font-bold text-3xl text-white mb-1">
            Pill<span className="shimmer-text">Box</span>
          </h1>
          <p className="text-white text-opacity-40 text-sm">
            Gestión de Medicamentos para Hipertensión
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 shadow-2xl">
          <h2 className="font-display font-semibold text-xl text-white mb-1">
            Iniciar sesión
          </h2>
          <p className="text-white text-opacity-40 text-sm mb-6">
            Accede a tu panel de fisioterapeuta
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="label">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="field"
                placeholder="fisio@clinica.com"
                autoComplete="email"
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="label">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="field pr-11"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-opacity-30 hover:text-opacity-70 transition-opacity"
                >
                  {showPass ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-coral-500 bg-opacity-10 border border-coral-500 border-opacity-30 text-coral-400 text-sm animate-fade-in">
                <span className="shrink-0">⚠</span>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3.5 mt-2 text-base"
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  Verificando…
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-white text-opacity-20 text-xs mt-6">
          PillBox v1.0 · Solo para uso clínico autorizado
        </p>
      </div>
    </div>
  )
}

/* ── Íconos ── */
function PillIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <rect x="2" y="13" width="28" height="6" rx="3" fill="url(#pill-login-grad)" />
      <line x1="16" y1="13" x2="16" y2="19" stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" />
      <defs>
        <linearGradient id="pill-login-grad" x1="0" y1="0" x2="32" y2="6">
          <stop offset="0%" stopColor="#00C9A7" />
          <stop offset="100%" stopColor="#4ECDC4" />
        </linearGradient>
      </defs>
    </svg>
  )
}
function EyeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}
function EyeOffIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}
function SpinnerIcon() {
  return (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  )
}
