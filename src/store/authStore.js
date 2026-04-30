import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * Store de autenticación
 * Guarda el JWT en localStorage automáticamente gracias a `persist`.
 */
const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ──
      token: null,
      user: null,
      isAuthenticated: false,

      // ── Actions ──

      /** Guarda el token después de un login exitoso */
      setToken: (token) =>
        set({
          token,
          isAuthenticated: !!token,
        }),

      /** Guarda datos del usuario (opcional, si el backend los retorna) */
      setUser: (user) => set({ user }),

      /** Login completo: recibe el objeto de respuesta del backend */
      login: ({ access_token, user }) => {
        set({
          token: access_token,
          user: user ?? null,
          isAuthenticated: true,
        })
      },

      /** Cierra sesión y borra todo */
      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),

      /** Getter: devuelve el header Authorization listo para fetch */
      getAuthHeader: () => {
        const token = get().token
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    }),
    {
      name: 'pillbox-auth',       // clave en localStorage
      partialize: (state) => ({   // solo persiste estas propiedades
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

export default useAuthStore
