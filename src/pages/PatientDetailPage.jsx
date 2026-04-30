import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Modal from '../components/Modal'
import PillCapsule from '../components/PillCapsule'
import { useToast } from '../components/Toast'
import {
  patientsApi,
  prescriptionsApi,
  pillsApi,
  remindersApi,
} from '../api/client'

const PILL_COLORS = [
  'red',
  'blue',
  'yellow',
  'green',
  'purple',
  'orange',
  'pink',
  'cyan',
  'teal',
]

const SCHEDULE_LABEL = {
  MORNING: {
    label: 'Mañana',
    emoji: '🌅',
    badge: 'text-yellow-300 bg-yellow-500 bg-opacity-10 border-yellow-500',
  },
  AFTERNOON: {
    label: 'Tarde',
    emoji: '☀️',
    badge: 'text-orange-300 bg-orange-500 bg-opacity-10 border-orange-500',
  },
  EVENING: {
    label: 'Noche',
    emoji: '🌆',
    badge: 'text-purple-300 bg-purple-500 bg-opacity-10 border-purple-500',
  },
  NIGHT: {
    label: 'Madrugada',
    emoji: '🌙',
    badge: 'text-blue-300  bg-blue-500  bg-opacity-10 border-blue-500',
  },
}

const EMPTY_RX_FORM = {
  pillId: '',
  intakeTime: '08:00',
  schedule: 'MORNING',
  timesPerDay: 1,
}

const SCHEDULE_OPTIONS = [
  { value: 'MORNING', label: 'Mañana', emoji: '🌅' },
  { value: 'AFTERNOON', label: 'Tarde', emoji: '☀️' },
  { value: 'NIGHT', label: 'Noche', emoji: '🌙' },
]

export default function PatientDetailPage() {
  const { patientId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()

  const [patient, setPatient] = useState(null)
  const [prescriptions, setPrescriptions] = useState([])
  const [pills, setPills] = useState([])
  const [loading, setLoading] = useState(true)

  // Modal nueva prescripción
  const [rxOpen, setRxOpen] = useState(false)
  const [rxForm, setRxForm] = useState(EMPTY_RX_FORM)
  const [rxSubmit, setRxSubmit] = useState(false)

  // Modal recordatorio
  const [reminderOpen, setReminderOpen] = useState(false)
  const [reminderPx, setReminderPx] = useState(null) // prescription seleccionada
  const [reminderTime, setReminderTime] = useState('08:00')
  const [reminderSubmit, setReminderSubmit] = useState(false)

  // Modal eliminar prescripción
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePx, setDeletePx] = useState(null)
  const [deleteSubmit, setDeleteSubmit] = useState(false)

  /* ── Carga de datos ── */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [pat, rxData, pillData] = await Promise.all([
        patientsApi.getById(patientId),
        prescriptionsApi.getByPatient(patientId),
        pillsApi.getAll(),
      ])
      setPatient(pat)
      setPrescriptions(Array.isArray(rxData) ? rxData : (rxData?.data ?? []))
      setPills(Array.isArray(pillData) ? pillData : (pillData?.data ?? []))
    } catch (err) {
      toast.error(`Error al cargar datos: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [patientId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* ── Color de pastilla por índice ── */
  const pillColor = (pillId) => {
    const idx = pills.findIndex((p) => p.pill_id === pillId)
    return PILL_COLORS[(idx >= 0 ? idx : 0) % PILL_COLORS.length]
  }

  /* ── Crear prescripción ── */
  const handleCreateRx = async (e) => {
    e.preventDefault()
    setRxSubmit(true)
    try {
      await prescriptionsApi.create({
        patientId,
        pillId: rxForm.pillId,
        intakeTime: rxForm.intakeTime,
        schedule: rxForm.schedule,
        timesPerDay: Number(rxForm.timesPerDay),
      })
      toast.success('Prescripción creada')
      setRxOpen(false)
      setRxForm(EMPTY_RX_FORM)
      fetchData()
    } catch (err) {
      toast.error(`Error: ${err.message}`)
    } finally {
      setRxSubmit(false)
    }
  }

  /* ── Eliminar prescripción ── */
  const handleDeleteRx = async () => {
    setDeleteSubmit(true)
    try {
      await prescriptionsApi.delete(deletePx.prescription_id)
      toast.success('Prescripción eliminada')
      setDeleteOpen(false)
      fetchData()
    } catch (err) {
      toast.error(`Error: ${err.message}`)
    } finally {
      setDeleteSubmit(false)
    }
  }

  /* ── Activar recordatorio ── */
  const openReminder = (rx) => {
    setReminderPx(rx)
    setReminderTime(rx.intakeTime ?? '08:00')
    setReminderOpen(true)
  }

  const handleActivateReminder = async (e) => {
    e.preventDefault()
    setReminderSubmit(true)
    try {
      await remindersApi.create({
        prescriptionId: reminderPx.prescription_id,
        scheduledTime: reminderTime,
      })
      toast.success(`Recordatorio activado para las ${reminderTime}`)
      setReminderOpen(false)
    } catch (err) {
      toast.error(`Error: ${err.message}`)
    } finally {
      setReminderSubmit(false)
    }
  }

  /* ── Initials del avatar ── */
  const initials = patient
    ? `${patient.name?.[0] ?? ''}${patient.lastName?.[0] ?? ''}`.toUpperCase()
    : '?'

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[60vh]'>
        <SpinnerIcon className='w-10 h-10 text-teal-400 animate-spin' />
      </div>
    )
  }

  return (
    <div className='page-enter space-y-6'>
      {/* ── Back + Header ── */}
      <div className='flex items-center gap-4'>
        <button
          onClick={() => navigate('/patients')}
          className='p-2 rounded-xl text-white text-opacity-40 hover:bg-white hover:bg-opacity-10 hover:text-opacity-80 transition-all'
        >
          <BackIcon className='w-5 h-5' />
        </button>
        <div>
          <p className='text-teal-400 text-xs font-medium uppercase tracking-widest mb-0.5'>
            Detalle de paciente
          </p>
          <h1 className='font-display font-bold text-2xl text-white'>
            {patient?.name} {patient?.lastName}
          </h1>
        </div>
      </div>

      {/* ── Tarjeta de info del paciente ── */}
      {patient && (
        <div className='glass-card p-6 flex items-start gap-5 animate-fade-in-up'>
          {/* Avatar */}
          <div className='w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 to-teal-400 flex items-center justify-center text-navy-900 font-display font-bold text-xl shrink-0'>
            {initials}
          </div>

          {/* Datos */}
          <div className='flex-1 grid grid-cols-2 xl:grid-cols-4 gap-4'>
            <InfoItem label='Correo' value={patient.email} />
            <InfoItem label='Teléfono' value={patient.phone ?? '—'} />
            <InfoItem
              label='Estado'
              value={
                <span
                  className={`badge border border-opacity-30 ${
                    patient.status === 'ACTIVE'
                      ? 'text-teal-300 bg-teal-500 bg-opacity-10 border-teal-500'
                      : 'text-white text-opacity-30 bg-white bg-opacity-5 border-white border-opacity-10'
                  }`}
                >
                  {patient.status === 'ACTIVE' ? '● Activo' : '○ Inactivo'}
                </span>
              }
            />
            <InfoItem
              label='Registrado'
              value={
                patient.createdAt
                  ? new Date(patient.createdAt).toLocaleDateString('es-CO', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'
              }
            />
          </div>
        </div>
      )}

      {/* ── Sección de prescripciones ── */}
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h2 className='font-display font-semibold text-lg text-white'>
              Prescripciones
            </h2>
            <p className='text-white text-opacity-40 text-xs mt-0.5'>
              {prescriptions.length} medicamento
              {prescriptions.length !== 1 ? 's' : ''} asignado
              {prescriptions.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => {
              setRxForm(EMPTY_RX_FORM)
              setRxOpen(true)
            }}
            className='btn-primary flex items-center gap-2 text-sm'
          >
            <PlusIcon />
            Agregar prescripción
          </button>
        </div>

        {prescriptions.length === 0 ? (
          <div className='glass-card flex flex-col items-center py-14 gap-3 text-white text-opacity-30'>
            <span className='text-4xl'>💊</span>
            <p className='text-sm'>Este paciente no tiene prescripciones aún</p>
            <button
              onClick={() => setRxOpen(true)}
              className='text-teal-400 text-sm hover:underline'
            >
              Agregar primera prescripción →
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
            {prescriptions.map((rx, i) => (
              <RxCard
                key={rx.prescription_id}
                rx={rx}
                index={i}
                color={pillColor(rx.pillId)}
                onActivateReminder={() => openReminder(rx)}
                onDelete={() => {
                  setDeletePx(rx)
                  setDeleteOpen(true)
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL: Nueva prescripción ── */}
      <Modal
        isOpen={rxOpen}
        onClose={() => setRxOpen(false)}
        title='Nueva Prescripción'
        size='md'
      >
        <form onSubmit={handleCreateRx} className='space-y-4'>
          {/* Pastilla */}
          <div>
            <label className='label'>Medicamento</label>
            <div className='flex items-center gap-3'>
              {rxForm.pillId && (
                <PillCapsule color={pillColor(rxForm.pillId)} size='sm' />
              )}
              <select
                value={rxForm.pillId}
                onChange={(e) =>
                  setRxForm((p) => ({ ...p, pillId: e.target.value }))
                }
                className='field flex-1'
                required
              >
                <option value='' disabled>
                  Seleccionar medicamento…
                </option>
                {pills.map((p) => (
                  <option key={p.pill_id} value={p.pill_id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {rxForm.pillId && (
              <p className='text-xs text-white text-opacity-30 mt-1.5 ml-1'>
                {pills.find((p) => p.pill_id === rxForm.pillId)?.description}
              </p>
            )}
          </div>

          {/* Momento del día */}
          <div>
            <label className='label'>Momento del día</label>
            <div className='grid grid-cols-2 gap-2'>
              {SCHEDULE_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type='button'
                  onClick={() =>
                    setRxForm((p) => ({ ...p, schedule: s.value }))
                  }
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all
                    ${
                      rxForm.schedule === s.value
                        ? 'border-teal-500 border-opacity-70 bg-teal-500 bg-opacity-10 text-teal-300'
                        : 'border-white border-opacity-5 bg-white bg-opacity-5 text-white text-opacity-40 hover:text-opacity-70'
                    }`}
                >
                  <span>{s.emoji}</span>
                  <span>{s.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Hora y frecuencia */}
          <div className='grid grid-cols-2 gap-3'>
            <div>
              <label className='label'>Hora de toma</label>
              <input
                type='time'
                value={rxForm.intakeTime}
                onChange={(e) =>
                  setRxForm((p) => ({ ...p, intakeTime: e.target.value }))
                }
                className='field'
                required
              />
            </div>
            <div>
              <label className='label'>Veces por día</label>
              <input
                type='number'
                min={1}
                max={10}
                value={rxForm.timesPerDay}
                onChange={(e) =>
                  setRxForm((p) => ({ ...p, timesPerDay: e.target.value }))
                }
                className='field'
                required
              />
            </div>
          </div>

          <div className='flex gap-3 pt-1'>
            <button
              type='button'
              onClick={() => setRxOpen(false)}
              className='btn-secondary flex-1'
            >
              Cancelar
            </button>
            <button
              type='submit'
              disabled={rxSubmit}
              className='btn-primary flex-1 flex items-center justify-center gap-2'
            >
              {rxSubmit && <SpinnerIcon className='w-4 h-4 animate-spin' />}
              Crear prescripción
            </button>
          </div>
        </form>
      </Modal>

      {/* ── MODAL: Activar recordatorio ── */}
      <Modal
        isOpen={reminderOpen}
        onClose={() => setReminderOpen(false)}
        title='Activar Recordatorio'
        size='sm'
      >
        {reminderPx && (
          <form onSubmit={handleActivateReminder} className='space-y-4'>
            {/* Info de la prescripción */}
            <div className='flex items-center gap-3 p-3 rounded-xl bg-white bg-opacity-5 border border-white border-opacity-5'>
              <PillCapsule color={pillColor(reminderPx.pillId)} size='sm' />
              <div>
                <p className='text-sm font-semibold text-white'>
                  {reminderPx.pill?.name}
                </p>
                <p className='text-xs text-white text-opacity-40'>
                  {reminderPx.timesPerDay}× al día ·{' '}
                  {SCHEDULE_LABEL[reminderPx.schedule]?.emoji}{' '}
                  {SCHEDULE_LABEL[reminderPx.schedule]?.label}
                </p>
              </div>
            </div>

            <div>
              <label className='label'>Hora del recordatorio</label>
              <input
                type='time'
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className='field text-lg font-semibold tracking-wider'
                required
              />
              <p className='text-xs text-white text-opacity-30 mt-1.5 ml-1'>
                El paciente recibirá una notificación a esta hora
              </p>
            </div>

            <div className='flex gap-3 pt-1'>
              <button
                type='button'
                onClick={() => setReminderOpen(false)}
                className='btn-secondary flex-1'
              >
                Cancelar
              </button>
              <button
                type='submit'
                disabled={reminderSubmit}
                className='btn-primary flex-1 flex items-center justify-center gap-2'
              >
                {reminderSubmit ? (
                  <SpinnerIcon className='w-4 h-4 animate-spin' />
                ) : (
                  <BellIcon className='w-4 h-4' />
                )}
                Activar
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── MODAL: Confirmar eliminar prescripción ── */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title='Eliminar Prescripción'
        size='sm'
      >
        <p className='text-white text-opacity-60 text-sm mb-5'>
          ¿Eliminar la prescripción de{' '}
          <span className='text-white font-semibold'>
            {deletePx?.pill?.name}
          </span>
          ?
        </p>
        <div className='flex gap-3'>
          <button
            onClick={() => setDeleteOpen(false)}
            className='btn-secondary flex-1'
          >
            Cancelar
          </button>
          <button
            onClick={handleDeleteRx}
            disabled={deleteSubmit}
            className='btn-danger flex-1 flex items-center justify-center gap-2'
          >
            {deleteSubmit && <SpinnerIcon className='w-4 h-4 animate-spin' />}
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  )
}

/* ── Card de prescripción ── */
function RxCard({ rx, index, color, onActivateReminder, onDelete }) {
  const sched = SCHEDULE_LABEL[rx.schedule] ?? SCHEDULE_LABEL.MORNING

  return (
    <div
      className='glass-card p-5 space-y-4 animate-fade-in-up transition-all duration-200 hover:border-white hover:border-opacity-10'
      style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
    >
      {/* Fila superior: pastilla + nombre + toggle activo */}
      <div className='flex items-start gap-3'>
        <PillCapsule color={color} size='md' animate={rx.isActive} />
        <div className='flex-1 min-w-0'>
          <h3 className='font-semibold text-white text-sm'>
            {rx.pill?.name ?? '—'}
          </h3>
          <p className='text-xs text-white text-opacity-30 mt-0.5 line-clamp-1'>
            {rx.pill?.description ?? ''}
          </p>
        </div>
        {/* Badge estado */}
        <span
          className={`badge border border-opacity-30 text-xs shrink-0 ${
            rx.isActive
              ? 'text-teal-300 bg-teal-500 bg-opacity-10 border-teal-500'
              : 'text-white text-opacity-20 bg-white bg-opacity-5 border-white border-opacity-10'
          }`}
        >
          {rx.isActive ? '● Activa' : '○ Inactiva'}
        </span>
      </div>

      {/* Badges de horario */}
      <div className='flex items-center gap-2 flex-wrap'>
        <span className={`badge border border-opacity-30 ${sched.badge}`}>
          {sched.emoji} {sched.label}
        </span>
        <span className='badge bg-white bg-opacity-5 text-white text-opacity-50 border border-white border-opacity-5'>
          🕐 {rx.intakeTime}
        </span>
        <span className='badge bg-white bg-opacity-5 text-white text-opacity-50 border border-white border-opacity-5'>
          ×{rx.timesPerDay} al día
        </span>
      </div>

      {/* Divider */}
      <div className='h-px bg-white bg-opacity-5' />

      {/* Acciones */}
      <div className='flex items-center gap-2'>
        {/* Botón principal: activar recordatorio */}
        <button
          onClick={onActivateReminder}
          className='flex-1 flex items-center justify-center gap-2 py-2 rounded-xl
                     bg-teal-500 bg-opacity-10 border border-teal-500 border-opacity-30
                     text-teal-400 text-sm font-medium
                     hover:bg-opacity-20 hover:border-opacity-60
                     transition-all duration-200 active:scale-95'
        >
          <BellIcon className='w-4 h-4' />
          Activar recordatorio
        </button>

        {/* Eliminar */}
        <button
          onClick={onDelete}
          className='p-2 rounded-xl text-white text-opacity-20
                     hover:bg-coral-500 hover:bg-opacity-10 hover:text-coral-400
                     border border-white border-opacity-5
                     transition-all duration-200'
          title='Eliminar prescripción'
        >
          <TrashIcon className='w-4 h-4' />
        </button>
      </div>
    </div>
  )
}

/* ── Componente auxiliar de info ── */
function InfoItem({ label, value }) {
  return (
    <div>
      <p className='text-xs text-white text-opacity-30 uppercase tracking-widest mb-1'>
        {label}
      </p>
      <div className='text-sm text-white font-medium'>{value}</div>
    </div>
  )
}

/* ── Íconos ── */
function BackIcon({ className }) {
  return (
    <svg
      className={className}
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18'
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
function PlusIcon() {
  return (
    <svg
      className='w-4 h-4'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2.5}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M12 4.5v15m7.5-7.5h-15'
      />
    </svg>
  )
}
function TrashIcon({ className }) {
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
        d='M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0'
      />
    </svg>
  )
}
function SpinnerIcon({ className }) {
  return (
    <svg className={className} fill='none' viewBox='0 0 24 24'>
      <circle
        className='opacity-25'
        cx='12'
        cy='12'
        r='10'
        stroke='currentColor'
        strokeWidth='4'
      />
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z'
      />
    </svg>
  )
}
