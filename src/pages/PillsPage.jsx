import { useState, useEffect, useCallback } from 'react'
import Modal from '../components/Modal'
import { useToast } from '../components/Toast'
import PillCapsule from '../components/PillCapsule'
import { pillsApi } from '../api/client'

// Colores que se asignan automáticamente en orden
const PILL_COLORS = ['red','blue','yellow','green','purple','orange','pink','cyan','teal']

const EMPTY_FORM = { name: '', description: '' }

export default function PillsPage() {
  const toast = useToast()

  const [pills,      setPills]      = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen,   setEditOpen]   = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected,   setSelected]   = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  /* ── Cargar pastillas ── */
  const fetchPills = useCallback(async () => {
    setLoading(true)
    try {
      const data = await pillsApi.getAll()
      setPills(Array.isArray(data) ? data : data?.data ?? [])
    } catch (err) {
      toast.error(`Error al cargar pastillas: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPills() }, [fetchPills])

  /* ── Crear ── */
  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await pillsApi.create(form)
      toast.success(`Pastilla "${form.name}" creada`)
      setCreateOpen(false)
      setForm(EMPTY_FORM)
      fetchPills()
    } catch (err) {
      toast.error(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Editar ── */
  const openEdit = (pill) => {
    setSelected(pill)
    setForm({ name: pill.name, description: pill.description ?? '' })
    setEditOpen(true)
  }

  const handleEdit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await pillsApi.update(selected.pill_id, form)
      toast.success('Pastilla actualizada')
      setEditOpen(false)
      fetchPills()
    } catch (err) {
      toast.error(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  /* ── Eliminar ── */
  const openDelete = (pill) => { setSelected(pill); setDeleteOpen(true) }

  const handleDelete = async () => {
    setSubmitting(true)
    try {
      await pillsApi.delete(selected.pill_id)
      toast.success('Pastilla eliminada')
      setDeleteOpen(false)
      fetchPills()
    } catch (err) {
      toast.error(`Error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = pills.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="page-enter space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-white">Pastillas</h1>
          <p className="text-white text-opacity-40 text-sm mt-0.5">
            {pills.length} medicamentos registrados
          </p>
        </div>
        <button
          onClick={() => { setForm(EMPTY_FORM); setCreateOpen(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <PlusIcon />
          Nueva pastilla
        </button>
      </div>

      {/* Buscador */}
      <div className="relative max-w-sm">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white text-opacity-30" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar medicamento…"
          className="field pl-9"
        />
      </div>

      {/* Grid de cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <SpinnerIcon className="w-8 h-8 text-teal-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-white text-opacity-30 gap-3">
          <span className="text-4xl">💊</span>
          <p>{search ? 'Sin resultados' : 'Aún no hay pastillas registradas'}</p>
          {!search && (
            <button onClick={() => setCreateOpen(true)} className="text-teal-400 text-sm hover:underline">
              Crear primera pastilla →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {filtered.map((pill, i) => (
            <PillCard
              key={pill.pill_id}
              pill={pill}
              color={PILL_COLORS[i % PILL_COLORS.length]}
              index={i}
              onEdit={() => openEdit(pill)}
              onDelete={() => openDelete(pill)}
            />
          ))}
        </div>
      )}

      {/* Modal Crear */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Nueva Pastilla">
        <PillForm form={form} setForm={setForm} onSubmit={handleCreate}
          submitting={submitting} onCancel={() => setCreateOpen(false)} mode="create" />
      </Modal>

      {/* Modal Editar */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Editar Pastilla">
        <PillForm form={form} setForm={setForm} onSubmit={handleEdit}
          submitting={submitting} onCancel={() => setEditOpen(false)} mode="edit" />
      </Modal>

      {/* Modal Eliminar */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Eliminar Pastilla" size="sm">
        <p className="text-white text-opacity-60 text-sm mb-5">
          ¿Eliminar <span className="text-white font-semibold">{selected?.name}</span>?
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setDeleteOpen(false)} className="btn-secondary flex-1">Cancelar</button>
          <button onClick={handleDelete} disabled={submitting} className="btn-danger flex-1 flex items-center justify-center gap-2">
            {submitting && <SpinnerIcon className="w-4 h-4 animate-spin" />}
            Eliminar
          </button>
        </div>
      </Modal>
    </div>
  )
}

/* ── Card visual de pastilla ── */
function PillCard({ pill, color, index, onEdit, onDelete }) {
  return (
    <div
      className="glass-card p-5 flex flex-col gap-4 hover:border-teal-500 hover:border-opacity-20
                 transition-all duration-200 animate-fade-in-up group"
      style={{ animationDelay: `${index * 0.05}s`, opacity: 0 }}
    >
      <div className="flex items-start justify-between">
        <PillCapsule color={color} size="lg" animate />
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit}
            className="p-1.5 rounded-lg text-white text-opacity-40 hover:bg-white hover:bg-opacity-10 hover:text-teal-400 transition-all">
            <EditIcon className="w-4 h-4" />
          </button>
          <button onClick={onDelete}
            className="p-1.5 rounded-lg text-white text-opacity-40 hover:bg-coral-500 hover:bg-opacity-10 hover:text-coral-400 transition-all">
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-white text-sm mb-1">{pill.name}</h3>
        <p className="text-xs text-white text-opacity-40 leading-relaxed line-clamp-2">
          {pill.description ?? 'Sin descripción'}
        </p>
      </div>
      <p className="text-xs text-white text-opacity-20 font-mono truncate">
        {pill.pill_id}
      </p>
    </div>
  )
}

/* ── Formulario ── */
function PillForm({ form, setForm, onSubmit, submitting, onCancel, mode }) {
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Nombre del medicamento</label>
        <input name="name" value={form.name} onChange={handleChange}
          className="field" placeholder="Ej: Hidroclorotiazida" required />
      </div>
      <div>
        <label className="label">Descripción</label>
        <textarea name="description" value={form.description} onChange={handleChange}
          className="field resize-none" rows={3}
          placeholder="Descripción breve del medicamento y su uso…" />
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">Cancelar</button>
        <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {submitting && <SpinnerIcon className="w-4 h-4 animate-spin" />}
          {mode === 'create' ? 'Crear pastilla' : 'Guardar cambios'}
        </button>
      </div>
    </form>
  )
}

/* Íconos */
function PlusIcon() { return <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg> }
function SearchIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg> }
function EditIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" /></svg> }
function TrashIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg> }
function SpinnerIcon({ className }) { return <svg className={className} fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> }