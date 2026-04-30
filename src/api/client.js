import useAuthStore from '../store/authStore'

const BASE_URL = 'https://pill-box-henna.vercel.app'

/**
 * Cliente HTTP centralizado.
 * Inyecta el JWT automáticamente en cada petición autenticada.
 */
class ApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL
  }

  /** Construye los headers base según si la petición necesita auth */
  _headers(requiresAuth = true, extra = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...extra,
    }
    if (requiresAuth) {
      const token = useAuthStore.getState().token
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
    return headers
  }

  /** Manejo centralizado de errores */
  async _handleResponse(response) {
    if (!response.ok) {
      let errorMessage = `Error ${response.status}`
      try {
        const data = await response.json()
        errorMessage = data.message || data.error || errorMessage
      } catch (_) {}

      // Si es 401, desloguear automáticamente
      if (response.status === 401) {
        useAuthStore.getState().logout()
      }

      throw new Error(errorMessage)
    }
    // Algunos endpoints retornan 204 sin body
    if (response.status === 204) return null
    return response.json()
  }

  async get(endpoint, requiresAuth = true) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this._headers(requiresAuth),
    })
    return this._handleResponse(response)
  }

  async post(endpoint, body, requiresAuth = true) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this._headers(requiresAuth),
      body: JSON.stringify(body),
    })
    return this._handleResponse(response)
  }

  async put(endpoint, body, requiresAuth = true) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this._headers(requiresAuth),
      body: JSON.stringify(body),
    })
    return this._handleResponse(response)
  }

  async patch(endpoint, body, requiresAuth = true) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this._headers(requiresAuth),
      body: JSON.stringify(body),
    })
    return this._handleResponse(response)
  }

  async delete(endpoint, requiresAuth = true) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this._headers(requiresAuth),
    })
    return this._handleResponse(response)
  }
}

const api = new ApiClient(BASE_URL)
export default api

// ── Endpoints organizados por módulo ──

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials, false),
  register: (userData) => api.post('/auth/register', userData),
}

export const patientsApi = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.patch(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
}

export const prescriptionsApi = {
  getAll: () => api.get('/prescriptions'),
  getByPatient: (id) => api.get(`/prescriptions/patient/${id}`),
  create: (data) => api.post('/prescriptions/', data),
  update: (id, data) => api.patch(`/prescriptions/${id}`, data),
  delete: (id) => api.delete(`/prescriptions/${id}`),
  toggleActive: (id, data) => api.patch(`/prescriptions/${id}`, data),
}

export const pillsApi = {
  getAll: () => api.get('/pills'),
  create: (data) => api.post('/pills', data),
  update: (id, data) => api.patch(`/pills/${id}`, data),
  delete: (id) => api.delete(`/pills/${id}`),
}

export const remindersApi = {
  getByPatient: (id) => api.get(`/reminders/patient/${id}`),
  create: (data) => api.post('/reminders', data),
  activate: (id) => api.patch(`/reminders/${id}/activate`, {}),
  deactivate: (id) => api.patch(`/reminders/${id}/deactivate`, {}),
}
