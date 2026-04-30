import { useState, useEffect, useCallback } from 'react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import PillCapsule from '../components/PillCapsule'
import { prescriptionsApi, patientsApi, pillsApi } from '../api/client'

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

const SCHEDULE_OPTIONS = [
  { value: 'MORNING', label: 'Mañana', emoji: '🌅', time: '06:00–11:59' },
  { value: 'EVENING', label: 'Tarde', emoji: '🌆', time: '18:00–21:59' },
  { value: 'NIGHT', label: 'Noche', emoji: '🌙', time: '22:00–05:59' },
]

const SCHEDULE_BADGE = {
  MORNING: 'bg-yellow-500 bg-opacity-15 text-yellow-300 border-yellow-500',
  AFTERNOON: 'bg-orange-500 bg-opacity-15 text-orange-300 border-orange-500',
  EVENING: 'bg-purple-500 bg-opacity-15 text-purple-300 border-purple-500',
  NIGHT: 'bg-blue-500  bg-opacity-15 text-blue-300  border-blue-500',
}

const EMPTY_FORM = {
  patientId: '',
  pillId: '',
  intakeTime: '08:00',
  schedule: 'MORNING',
  timesPerDay: 1,
}

export default function PrescriptionsPage() {
  const toast = useToast()

  const [prescriptions, setPrescriptions] = useState([])
  const [patients, setPatients] = useState([])
  const [pills, setPills] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  /* ── Cargar todo en paralelo ── */
  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [rxData, patData, pillData] = await Promise.all([
        prescriptionsApi.getAll(),
        patientsApi.getAll(),
        pillsApi.getAll(),
      ])
      setPrescriptions(Array.isArray(rxData) ? rxData : (rxData?.data ?? []))
      setPatients(Array.isArray(patData) ? patData : (patData?.data ?? []))
      setPills(Array.isArray(pillData) ? pillData : (pillData?.data ?? []))
    } catch (err) {
      toast.error(`Error al cargar datos: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  /* ── Crear ── */
  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await prescriptionsApi.create({
        ...form,
        timesPerDay: Number(form.timesPerDay),
      })
      toast.success('Prescripción creada exitosamente')
      setCreateOpen(false)
      setForm(EMPTY_FORM)
      fetchAll()
    } catch (err) {
      toast.error(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Activar / Desactivar ── */
  const toggleActive = async (rx) => {
    try {
      await prescriptionsApi.toggleActive(rx.prescription_id, {
        isActive: !rx.isActive,
      })
      toast.success(`Prescripción ${rx.isActive ? 'desactivada' : 'activada'}`)
      fetchAll()
    } catch (err) {
      toast.error(`Error: ${err.message}`)
    }
  }

  /* ── Eliminar ── */
  const openDelete = (rx) => {
    setSelected(rx)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await prescriptionsApi.delete(selected.prescription_id)
      toast.success('Prescripción eliminada')
      setDeleteOpen(false)
      fetchAll()
    } catch (err) {
      toast.error(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Filtrado por nombre de paciente o pastilla ── */
  const filtered = prescriptions.filter((rx) => {
    const q = search.toLowerCase()
    return (
      rx.patient?.name?.toLowerCase().includes(q) ||
      rx.patient?.lastName?.toLowerCase().includes(q) ||
      rx.pill?.name?.toLowerCase().includes(q)
    )
  })

  /* Índice de color para una pastilla dada */
  const pillColor = (pillId) => {
    const idx = pills.findIndex((p) => p.pill_id === pillId)
    return PILL_COLORS[(idx >= 0 ? idx : 0) % PILL_COLORS.length]
  }

  return (
    <div className='page-enter space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-display font-bold text-2xl text-white'>
            Prescripciones
          </h1>
          <p className='text-white text-opacity-40 text-sm mt-0.5'>
            {prescriptions.length} recetas registradas
          </p>
        </div>
        <button
          onClick={() => {
            setForm(EMPTY_FORM)
            setCreateOpen(true)
          }}
          className='btn-primary flex items-center gap-2'
        >
          <PlusIcon />
          Nueva prescripción
        </button>
      </div>

      {/* Buscador */}
      <div className='relative max-w-sm'>
        <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white text-opacity-30' />
        <input
          type='search'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Buscar paciente o medicamento…'
          className='field pl-9'
        />
      </div>

      {/* Lista */}
      {loading ? (
        <div className='flex items-center justify-center py-20'>
          <SpinnerIcon className='w-8 h-8 text-teal-400 animate-spin' />
        </div>
      ) : filtered.length === 0 ? (
        <div className='flex flex-col items-center py-20 text-white text-opacity-30 gap-3'>
          <span className='text-4xl'>📋</span>
          <p>{search ? 'Sin resultados' : 'Aún no hay prescripciones'}</p>
          {!search && (
            <button
              onClick={() => setCreateOpen(true)}
              className='text-teal-400 text-sm hover:underline'
            >
              Crear primera prescripción →
            </button>
          )}
        </div>
      ) : (
        <div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
          {filtered.map((rx, i) => (
            <PrescriptionCard
              key={rx.prescription_id}
              rx={rx}
              index={i}
              color={pillColor(rx.pillId)}
              onToggle={() => toggleActive(rx)}
              onDelete={() => openDelete(rx)}
            />
          ))}
        </div>
      )}

      {/* Modal Crear */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title='Nueva Prescripción'
        size='md'
      >
        <PrescriptionForm
          form={form}
          setForm={setForm}
          patients={patients}
          pills={pills}
          pillColor={pillColor}
          onSubmit={handleCreate}
          submitting={submitting}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* Modal Eliminar */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title='Eliminar Prescripción'
        size='sm'
      >
        <p className='text-white text-opacity-60 text-sm mb-5'>
          ¿Eliminar la prescripción de{' '}
          <span className='text-white font-semibold'>
            {selected?.pill?.name}
          </span>{' '}
          para{' '}
          <span className='text-white font-semibold'>
            {selected?.patient?.name} {selected?.patient?.lastName}
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
            onClick={handleDelete}
            disabled={submitting}
            className='btn-danger flex-1 flex items-center justify-center gap-2'
          >
            {submitting && <SpinnerIcon className='w-4 h-4 animate-spin' />}
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  )
}

/* ── Card de prescripción ── */
function PrescriptionCard({ rx, index, color, onToggle, onDelete }) {
  const scheduleInfo =
    SCHEDULE_OPTIONS.find((s) => s.value === rx.schedule) ?? SCHEDULE_OPTIONS[0]
  const badgeClass = SCHEDULE_BADGE[rx.schedule] ?? SCHEDULE_BADGE.MORNING
  const initials =
    `${rx.patient?.name?.[0] ?? ''}${rx.patient?.lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <div
      className={`glass-card p-5 flex gap-4 transition-all duration-200 animate-fade-in-up
                  ${rx.isActive ? '' : 'opacity-50'}`}
      style={{ animationDelay: `${index * 0.04}s`, opacity: 0 }}
    >
      {/* Pastilla */}
      <div className='shrink-0 flex flex-col items-center gap-1 pt-1'>
        <PillCapsule color={color} size='md' animate={rx.isActive} />
        <span
          className={`text-xs font-semibold ${rx.isActive ? 'text-teal-400' : 'text-white text-opacity-20'}`}
        >
          {rx.isActive ? 'Activa' : 'Inactiva'}
        </span>
      </div>

      {/* Info */}
      <div className='flex-1 min-w-0 space-y-2'>
        {/* Nombre del medicamento */}
        <h3 className='font-semibold text-white text-sm'>
          {rx.pill?.name ?? '—'}
        </h3>
        {rx.pill?.description && (
          <p className='text-xs text-white text-opacity-30 line-clamp-1'>
            {rx.pill.description}
          </p>
        )}

        {/* Paciente */}
        <div className='flex items-center gap-2'>
          <div className='w-6 h-6 rounded-lg bg-gradient-to-br from-teal-600 to-teal-400 flex items-center justify-center text-navy-900 font-bold text-xs shrink-0'>
            {initials || '?'}
          </div>
          <span className='text-xs text-white text-opacity-60'>
            {rx.patient?.name} {rx.patient?.lastName}
          </span>
        </div>

        {/* Horario + dosis */}
        <div className='flex items-center gap-2 flex-wrap'>
          <span className={`badge border border-opacity-30 ${badgeClass}`}>
            {scheduleInfo.emoji} {scheduleInfo.label}
          </span>
          <span className='badge bg-white bg-opacity-5 text-white text-opacity-50 border border-white border-opacity-5'>
            🕐 {rx.intakeTime}
          </span>
          <span className='badge bg-white bg-opacity-5 text-white text-opacity-50 border border-white border-opacity-5'>
            ×{rx.timesPerDay} al día
          </span>
        </div>
      </div>

      {/* Acciones */}
      <div className='flex flex-col gap-1.5 shrink-0'>
        {/* Toggle ON/OFF */}
        <button
          onClick={onToggle}
          title={rx.isActive ? 'Desactivar' : 'Activar'}
          className={`p-1.5 rounded-lg transition-all text-sm
            ${
              rx.isActive
                ? 'text-teal-400 hover:bg-teal-500 hover:bg-opacity-10'
                : 'text-white text-opacity-20 hover:bg-white hover:bg-opacity-5 hover:text-opacity-60'
            }`}
        >
          <ToggleIcon active={rx.isActive} />
        </button>
        {/* Eliminar */}
        <button
          onClick={onDelete}
          className='p-1.5 rounded-lg text-white text-opacity-20 hover:bg-coral-500 hover:bg-opacity-10 hover:text-coral-400 transition-all'
          title='Eliminar'
        >
          <TrashIcon className='w-4 h-4' />
        </button>
      </div>
    </div>
  )
}

/* ── Formulario de prescripción ── */
function PrescriptionForm({
  form,
  setForm,
  patients,
  pills,
  pillColor,
  onSubmit,
  submitting,
  onCancel,
}) {
  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
  }

  const selectedPill = pills.find((p) => p.pill_id === form.pillId)
  const selectedPillColor = form.pillId ? pillColor(form.pillId) : 'teal'

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      {/* Paciente */}
      <div>
        <label className='label'>Paciente</label>
        <select
          name='patientId'
          value={form.patientId}
          onChange={handleChange}
          className='field'
          required
        >
          <option value='' disabled>
            Seleccionar paciente…
          </option>
          {patients.map((p) => (
            <option key={p.id ?? p.user_id} value={p.id ?? p.user_id}>
              {p.name} {p.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Pastilla */}
      <div>
        <label className='label'>Medicamento</label>
        <div className='flex items-center gap-3'>
          {form.pillId && <PillCapsule color={selectedPillColor} size='sm' />}
          <select
            name='pillId'
            value={form.pillId}
            onChange={handleChange}
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
        {selectedPill?.description && (
          <p className='text-xs text-white text-opacity-30 mt-1.5 ml-1'>
            {selectedPill.description}
          </p>
        )}
      </div>

      {/* Horario */}
      <div>
        <label className='label'>Momento del día</label>
        <div className='grid grid-cols-2 gap-2'>
          {SCHEDULE_OPTIONS.map((s) => (
            <button
              key={s.value}
              type='button'
              onClick={() => setForm((p) => ({ ...p, schedule: s.value }))}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-medium transition-all
                ${
                  form.schedule === s.value
                    ? 'border-teal-500 border-opacity-70 bg-teal-500 bg-opacity-10 text-teal-300'
                    : 'border-white border-opacity-5 bg-white bg-opacity-5 text-white text-opacity-40 hover:text-opacity-70'
                }`}
            >
              <span>{s.emoji}</span>
              <span>{s.label}</span>
              <span className='ml-auto text-xs opacity-50'>{s.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Hora y frecuencia */}
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='label'>Hora de toma</label>
          <input
            name='intakeTime'
            type='time'
            value={form.intakeTime}
            onChange={handleChange}
            className='field'
            required
          />
        </div>
        <div>
          <label className='label'>Veces por día</label>
          <input
            name='timesPerDay'
            type='number'
            min={1}
            max={10}
            value={form.timesPerDay}
            onChange={handleChange}
            className='field'
            required
          />
        </div>
      </div>

      <div className='flex gap-3 pt-1'>
        <button
          type='button'
          onClick={onCancel}
          className='btn-secondary flex-1'
        >
          Cancelar
        </button>
        <button
          type='submit'
          disabled={submitting}
          className='btn-primary flex-1 flex items-center justify-center gap-2'
        >
          {submitting && <SpinnerIcon className='w-4 h-4 animate-spin' />}
          Crear prescripción
        </button>
      </div>
    </form>
  )
}

/* Íconos */
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
function SearchIcon({ className }) {
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
        d='M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z'
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
function ToggleIcon({ active }) {
  return active ? (
    <svg
      className='w-4 h-4'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M5.636 5.636a9 9 0 1012.728 0M12 3v9'
      />
    </svg>
  ) : (
    <svg
      className='w-4 h-4'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      strokeWidth={2}
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        d='M5.636 5.636a9 9 0 1012.728 0M12 3v9'
      />
    </svg>
  )
}
