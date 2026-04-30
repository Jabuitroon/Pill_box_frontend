import { useState, useCallback, createContext, useContext, useRef } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++idRef.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const remove = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

  const toast = {
    success: (msg) => addToast(msg, 'success'),
    error:   (msg) => addToast(msg, 'error'),
    info:    (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Portal de toasts */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2 min-w-[280px]">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

const TOAST_STYLES = {
  success: 'border-teal-500 bg-teal-500 bg-opacity-15 text-teal-300',
  error:   'border-coral-500 bg-coral-500 bg-opacity-15 text-coral-400',
  info:    'border-blue-400 bg-blue-500 bg-opacity-15 text-blue-300',
  warning: 'border-yellow-400 bg-yellow-500 bg-opacity-15 text-yellow-300',
}

const TOAST_ICONS = {
  success: '✓',
  error:   '✕',
  info:    'i',
  warning: '!',
}

function ToastItem({ toast, onClose }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg
                  animate-slide-in-right ${TOAST_STYLES[toast.type]}`}
    >
      <span className="font-bold text-sm w-5 h-5 flex items-center justify-center rounded-full bg-current bg-opacity-20 shrink-0 mt-0.5">
        {TOAST_ICONS[toast.type]}
      </span>
      <p className="text-sm flex-1 leading-snug">{toast.message}</p>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 text-xs ml-1 shrink-0 mt-0.5">✕</button>
    </div>
  )
}
