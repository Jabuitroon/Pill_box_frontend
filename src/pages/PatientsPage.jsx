import { useState, useEffect, useCallback } from 'react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import { authApi, patientsApi } from '../api/client'
import useAuthStore from '../store/authStore'
import { useNavigate } from 'react-router-dom'

const PHYSIOTHERAPIST_ID = 'a8a929a8-3354-4a78-ade3-ccf7d4faa1f7' // TODO: obtener del JWT

const EMPTY_FORM = {
  name: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  role: 'PATIENT',
  physiotherapistId: PHYSIOTHERAPIST_ID,
}

export default function PatientsPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Modales
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [selectedPatient, setSelectedPatient] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  /* ── Cargar pacientes ── */
  const fetchPatients = useCallback(async () => {
    setLoading(true)
    try {
      const data = await patientsApi.getAll()
      const list = Array.isArray(data) ? data : (data?.data ?? [])
      setPatients(list)
    } catch (err) {
      toast.error(`Error al cargar pacientes: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  /* ── Crear paciente ── */
  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await authApi.register({
        ...form,
        physiotherapistId: PHYSIOTHERAPIST_ID,
      })
      toast.success(`Paciente ${form.name} creado exitosamente`)
      setCreateOpen(false)
      setForm(EMPTY_FORM)
      fetchPatients()
    } catch (err) {
      toast.error(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Editar paciente ── */
  const openEdit = (patient) => {
    setSelectedPatient(patient)
    setForm({
      name: patient.name ?? '',
      lastName: patient.lastName ?? '',
      email: patient.email ?? '',
      phone: patient.phone ?? '',
      password: '',
      role: 'PATIENT',
      physiotherapistId: PHYSIOTHERAPIST_ID,
    })
    setEditOpen(true)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const payload = {
      name: form.name,
      lastName: form.lastName,
      phone: form.phone,
    }
    if (form.password) payload.password = form.password
    try {
      await patientsApi.update(selectedPatient.user_id, payload)
      toast.success('Paciente actualizado correctamente')
      setEditOpen(false)
      fetchPatients()
    } catch (err) {
      toast.error(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Eliminar paciente ── */
  const openDelete = (patient) => {
    setSelectedPatient(patient)
    setDeleteOpen(true)
  }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await patientsApi.delete(selectedPatient.user_id)
      toast.success('Paciente eliminado')
      setDeleteOpen(false)
      fetchPatients()
    } catch (err) {
      toast.error(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Filtrado ── */
  const filtered = patients.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.name?.toLowerCase().includes(q) ||
      p.lastName?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q)
    )
  })

  return (
    <div className='page-enter space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='font-display font-bold text-2xl text-white'>
            Pacientes
          </h1>
          <p className='text-white text-opacity-40 text-sm mt-0.5'>
            {patients.length} pacientes registrados
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
          Nuevo paciente
        </button>
      </div>

      {/* Barra de búsqueda */}
      <div className='relative max-w-sm'>
        <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white text-opacity-30' />
        <input
          type='search'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder='Buscar paciente…'
          className='field pl-9'
        />
      </div>

      {/* Tabla */}
      <div className='glass-card overflow-hidden'>
        {loading ? (
          <div className='flex items-center justify-center py-16'>
            <SpinnerIcon className='w-8 h-8 text-teal-400 animate-spin' />
          </div>
        ) : filtered.length === 0 ? (
          <div className='flex flex-col items-center py-16 text-white text-opacity-30'>
            <span className='text-4xl mb-3'>👤</span>
            <p className='font-medium'>
              {search
                ? 'Sin resultados para tu búsqueda'
                : 'Aún no hay pacientes registrados'}
            </p>
            {!search && (
              <button
                onClick={() => setCreateOpen(true)}
                className='mt-3 text-teal-400 text-sm hover:underline'
              >
                Crear primer paciente →
              </button>
            )}
          </div>
        ) : (
          <table className='w-full'>
            <thead>
              <tr className='border-b border-white border-opacity-5 text-left'>
                {['Paciente', 'Contacto', 'Teléfono', 'Acciones'].map((h) => (
                  <th
                    key={h}
                    className='px-5 py-3.5 text-xs font-semibold text-white text-opacity-30 uppercase tracking-wider'
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <PatientRow
                  key={p.user_id ?? i}
                  patient={p}
                  index={i}
                  onEdit={() => openEdit(p)}
                  onDelete={() => openDelete(p)}
                  onView={() => navigate(`/patients/${p.user_id ?? p.user_id}`)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MODAL: Crear ── */}
      <Modal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title='Nuevo Paciente'
        size='md'
      >
        <PatientForm
          form={form}
          setForm={setForm}
          onSubmit={handleCreate}
          submitting={submitting}
          mode='create'
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* ── MODAL: Editar ── */}
      <Modal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        title='Editar Paciente'
        size='md'
      >
        <PatientForm
          form={form}
          setForm={setForm}
          onSubmit={handleEdit}
          submitting={submitting}
          mode='edit'
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      {/* ── MODAL: Confirmar eliminación ── */}
      <Modal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title='Eliminar Paciente'
        size='sm'
      >
        <p className='text-white text-opacity-60 text-sm mb-5'>
          ¿Estás seguro de eliminar a{' '}
          <span className='text-white font-semibold'>
            {selectedPatient?.name} {selectedPatient?.lastName}
          </span>
          ? Esta acción no se puede deshacer.
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
            {submitting ? (
              <SpinnerIcon className='w-4 h-4 animate-spin' />
            ) : null}
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  )
}

/* ── Fila de la tabla ── */
function PatientRow({ patient, index, onEdit, onDelete, onView  }) {
  const initials =
    `${patient.name?.[0] ?? ''}${patient.lastName?.[0] ?? ''}`.toUpperCase()
  const avatarColors = [
    'from-teal-600 to-teal-400',
    'from-blue-600 to-blue-400',
    'from-purple-600 to-purple-400',
    'from-pink-600 to-pink-400',
  ]
  const avatarColor = avatarColors[index % avatarColors.length]

  return (
    <tr
      className='border-b border-white border-opacity-5 hover:bg-white hover:bg-opacity-[0.02] transition-colors animate-fade-in'
      style={{ animationDelay: `${index * 0.04}s`, opacity: 0 }}
    >
      <td className='px-5 py-4' onClick={onView} >
        <div className='flex items-center gap-3'>
          <div
            className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-navy-900 font-bold text-sm shrink-0`}
          >
            {initials || '?'}
          </div>
          <div>
            <p className='font-medium text-white text-sm'>
              {patient.name} {patient.lastName}
            </p>
            <p className='text-xs text-white text-opacity-30 mt-0.5'>
              Id: {patient.user_id?.slice(0, 8)}…
            </p>
          </div>
        </div>
      </td>
      <td className='px-5 py-4'>
        <p className='text-sm text-white text-opacity-60'>{patient.email}</p>
      </td>
      <td className='px-5 py-4'>
        <p className='text-sm text-white text-opacity-60'>
          {patient.phone ?? '—'}
        </p>
      </td>
      <td className='px-5 py-4'>
        <div className='flex items-center gap-2'  onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onEdit}
            className='p-2 rounded-lg text-white text-opacity-40 hover:bg-white hover:bg-opacity-10 hover:text-teal-400 transition-all'
            title='Editar'
          >
            <EditIcon className='w-4 h-4' />
          </button>
          <button
            onClick={onDelete}
            className='p-2 rounded-lg text-white text-opacity-40 hover:bg-coral-500 hover:bg-opacity-10 hover:text-coral-400 transition-all'
            title='Eliminar'
          >
            <TrashIcon className='w-4 h-4' />
          </button>
        </div>
      </td>
    </tr>
  )
}

/* ── Formulario reutilizable ── */
function PatientForm({ form, setForm, onSubmit, submitting, mode, onCancel }) {
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <label className='label'>Nombre</label>
          <input
            name='name'
            value={form.name}
            onChange={handleChange}
            className='field'
            placeholder='Juanes'
            required
          />
        </div>
        <div>
          <label className='label'>Apellido</label>
          <input
            name='lastName'
            value={form.lastName}
            onChange={handleChange}
            className='field'
            placeholder='Pérez'
            required
          />
        </div>
      </div>
      <div>
        <label className='label'>Correo electrónico</label>
        <input
          name='email'
          type='email'
          value={form.email}
          onChange={handleChange}
          className='field'
          placeholder='paciente@email.com'
          required
          disabled={mode === 'edit'}
        />
      </div>
      <div>
        <label className='label'>Teléfono</label>
        <input
          name='phone'
          type='tel'
          value={form.phone}
          onChange={handleChange}
          className='field'
          placeholder='+573135904593'
        />
      </div>
      {mode === 'create' && (
        <div>
          <label className='label'>Contraseña inicial</label>
          <input
            name='password'
            type='password'
            value={form.password}
            onChange={handleChange}
            className='field'
            placeholder='Mínimo 8 caracteres'
            required
            minLength={6}
          />
        </div>
      )}
      {mode === 'edit' && (
        <div>
          <label className='label'>Nueva contraseña (opcional)</label>
          <input
            name='password'
            type='password'
            value={form.password}
            onChange={handleChange}
            className='field'
            placeholder='Dejar vacío para no cambiar'
            minLength={6}
          />
        </div>
      )}

      <div className='flex gap-3 pt-2'>
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
          {submitting ? <SpinnerIcon className='w-4 h-4 animate-spin' /> : null}
          {mode === 'create' ? 'Crear paciente' : 'Guardar cambios'}
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
function EditIcon({ className }) {
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
        d='M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10'
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
